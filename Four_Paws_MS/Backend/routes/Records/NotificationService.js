const nodemailer = require('nodemailer');
const express = require('express');
const router = express.Router();
const moment = require('moment');
const cron = require('node-cron');
require('dotenv').config();
const db = require('../../db');

// Promisify the db connection
const util = require('util');
db.query = util.promisify(db.query).bind(db);

// Email transporter configuration
let transporter;
try {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'default@example.com',
      pass: process.env.EMAIL_PASS || 'password'
    }
  });

  transporter.verify((error) => {
    if (error) {
      console.error('Email transporter failed:', error.message);
    } else {
      console.log('Email transporter ready');
    }
  });
} catch (error) {
  console.error('Failed to create email transporter:', error);
}

function getAgeInWeeks(dob, date) {
  if (!dob || !date) return 0;
  const birthDate = moment(dob);
  const checkDate = moment(date);
  return checkDate.diff(birthDate, 'weeks');
}



async function logFailedNotification(pet, template, error) {
  await db.query(`INSERT INTO sent_notifications SET ?`, {
    template_id: template.template_id,
    pet_id: pet.Pet_id,
    owner_id: pet.Owner_id,
    vaccination_id: null,
    scheduled_date: new Date(),
    sent_date: new Date(),
    email: pet.E_mail,
    subject: template.subject,
    message: template.message_body,
    status: 'failed',
    error_message: error.message
  });
}


async function sendFirstDoseNotification(pet, template, vaccineName) {
  try {
    const recommendedDate = moment().format('YYYY-MM-DD');
    
    // Customize message for first dose
    let message = template.message_body
      .replace(/{pet_name}/g, pet.Pet_name)
      .replace(/{next_vaccination_date}/g, recommendedDate)
      .replace(/second dose/g, 'first dose');
    
    let subject = template.subject.replace(/{pet_name}/g, pet.Pet_name);

    // Send email
    await transporter.sendMail({
      from: `"Four Paws Clinic" <${process.env.EMAIL_USER}>`,
      to: pet.E_mail,
      subject: subject,
      text: message,
      html: `<div>${message.replace(/\n/g, '<br>')}</div>`
    });

    // Log in sent_notifications table with NULL vaccination_id
    await db.query(`INSERT INTO sent_notifications SET ?`, {
      template_id: template.template_id,
      pet_id: pet.Pet_id,
      owner_id: pet.Owner_id,
      vaccination_id: null,
      scheduled_date: new Date(),
      sent_date: new Date(),
      email: pet.E_mail,
      subject,
      message,
      status: 'sent'
    });

    console.log(`Sent first dose reminder for ${pet.Pet_name} (${vaccineName})`);
  } catch (error) {
    console.error('Failed to send first dose reminder:', error);
    await logFailedNotification(pet, template, error);
  }
}


async function handleFirstDoseReminder(pet, template, vaccineName, ageInWeeks) {
  // Check if pet already has this vaccination
  const existingVaccinations = await db.query(`
    SELECT 1 FROM vaccination 
    WHERE pet_id = ? 
    AND vaccine_name = ?
    LIMIT 1
  `, [pet.Pet_id, vaccineName]);
  
  // Only send if no existing vaccination
  if (existingVaccinations.length === 0) {
    await sendFirstDoseNotification(pet, template, vaccineName);
  }
}


async function checkPreviousDoseExists(petId, vaccineName, currentTemplate) {
  // Check vaccination table for previous dose
  const vaccinations = await db.query(`
    SELECT 1 FROM vaccination 
    WHERE pet_id = ? 
    AND vaccine_name = ?
    LIMIT 1
  `, [petId, vaccineName]);
  
  if (vaccinations.length > 0) return true;
  
  // Check sent_notifications for first dose reminder
  const previousNotifications = await db.query(`
    SELECT 1 FROM sent_notifications sn
    JOIN notification_templates nt ON sn.template_id = nt.template_id
    WHERE sn.pet_id = ?
    AND nt.trigger_condition LIKE ?
    AND sn.vaccination_id IS NULL
    LIMIT 1
  `, [petId, `%${vaccineName}%`]);
  
  return previousNotifications.length > 0;
}



// Send follow-up dose notification
async function sendFollowUpNotification(pet, template, vaccineName) {
  try {
    // Get the most recent vaccination for this pet and vaccine
    const [latestVaccination] = await db.query(`
      SELECT * FROM vaccination 
      WHERE pet_id = ? 
      AND vaccine_name = ?
      ORDER BY vaccination_date DESC
      LIMIT 1
    `, [pet.Pet_id, vaccineName]);

    if (!latestVaccination) {
      console.log(`No vaccination record found for follow-up dose for ${pet.Pet_name}`);
      return;
    }

    const nextVaccinationDate = calculateNextVaccinationDate(
      vaccineName,
      latestVaccination.vaccination_date
    );

    let message = template.message_body
      .replace(/{pet_name}/g, pet.Pet_name)
      .replace(/{next_vaccination_date}/g, nextVaccinationDate);
    
    let subject = template.subject.replace(/{pet_name}/g, pet.Pet_name);

    // Send email
    await transporter.sendMail({
      from: `"Four Paws Clinic" <${process.env.EMAIL_USER}>`,
      to: pet.E_mail,
      subject: subject,
      text: message,
      html: `<div>${message.replace(/\n/g, '<br>')}</div>`
    });

    // Log in sent_notifications table with vaccination_id
    await db.query(`INSERT INTO sent_notifications SET ?`, {
      template_id: template.template_id,
      pet_id: pet.Pet_id,
      owner_id: pet.Owner_id,
      vaccination_id: latestVaccination.vaccination_id,
      scheduled_date: new Date(),
      sent_date: new Date(),
      email: pet.E_mail,
      subject,
      message,
      status: 'sent'
    });

    console.log(`Sent follow-up dose reminder for ${pet.Pet_name} (${vaccineName})`);
  } catch (error) {
    console.error('Failed to send follow-up dose reminder:', error);
    await logFailedNotification(pet, template, error);
  }
}


async function handleFollowUpDoses(pet, template, vaccineName, ageInWeeks) {
  // Check if there's a previous dose notification or vaccination record
  const hasPreviousDose = await checkPreviousDoseExists(pet.Pet_id, vaccineName, template);
  
  if (hasPreviousDose) {
    await sendFollowUpNotification(pet, template, vaccineName);
  }
}


async function checkAgeBasedNotifications() {
  try {
    // Get all active templates
    const templates = await db.query(`
      SELECT * FROM notification_templates 
      WHERE is_active = 1
    `);

    // Get all pets with their owners' information
    const pets = await db.query(`
      SELECT p.*, o.E_mail, o.Owner_name, o.Owner_id
      FROM pet p
      JOIN pet_owner o ON p.Owner_id = o.Owner_id
      WHERE p.Pet_dob IS NOT NULL
    `);

    for (const pet of pets) {
      const ageInWeeks = getAgeInWeeks(pet.Pet_dob, new Date());
      
      for (const template of templates) {
        const conditions = template.trigger_condition.split(' AND ');
        const ageMatch = checkAgeCondition(conditions, ageInWeeks);
        const vaccineName = getVaccineNameFromCondition(template.trigger_condition);
        
        if (ageMatch && vaccineName) {
          // Check if this is a first dose reminder
          const isFirstDose = template.template_name.toLowerCase().includes('first dose');
          
          if (isFirstDose) {
            await handleFirstDoseReminder(pet, template, vaccineName, ageInWeeks);
          } else {
            await handleFollowUpDoses(pet, template, vaccineName, ageInWeeks);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in checkAgeBasedNotifications:', error);
  }
}

// Helper function to get vaccine name from condition
function getVaccineNameFromCondition(condition) {
  const vaccineMatch = condition.match(/vaccine_name="([^"]+)"/);
  return vaccineMatch ? vaccineMatch[1] : null;
}


async function sendFirstDoseReminder(pet, template, ageInWeeks) {
  try {
    // Extract vaccine name from template
    const vaccineMatch = template.trigger_condition.match(/vaccine_name="([^"]+)"/);
    const vaccineName = vaccineMatch ? vaccineMatch[1] : '';
    
    // Calculate recommended vaccination date (current date)
    const recommendedDate = moment().format('YYYY-MM-DD');
    
    // Customize message for first dose
    let message = template.message_body
      .replace(/{pet_name}/g, pet.Pet_name)
      .replace(/{next_vaccination_date}/g, recommendedDate)
      .replace(/second dose/g, 'first dose'); // Update wording for first dose
    
    let subject = template.subject.replace(/{pet_name}/g, pet.Pet_name);

    // Send email
    await transporter.sendMail({
      from: `"Four Paws Clinic" <${process.env.EMAIL_USER}>`,
      to: pet.E_mail,
      subject: subject,
      text: message,
      html: `<div>${message.replace(/\n/g, '<br>')}</div>`
    });

    // Log in sent_notifications table
    await db.query(`INSERT INTO sent_notifications SET ?`, {
      template_id: template.template_id,
      pet_id: pet.Pet_id,
      owner_id: pet.Owner_id,
      vaccination_id: null, // No vaccination record yet
      scheduled_date: new Date(),
      sent_date: new Date(),
      email: pet.E_mail,
      subject,
      message,
      status: 'sent'
    });

    console.log(`Sent first dose reminder for ${pet.Pet_name} (${vaccineName})`);
  } catch (error) {
    console.error('Failed to send first dose reminder:', error);
    await db.query(`INSERT INTO sent_notifications SET ?`, {
      template_id: template.template_id,
      pet_id: pet.Pet_id,
      owner_id: pet.Owner_id,
      vaccination_id: null,
      scheduled_date: new Date(),
      sent_date: new Date(),
      email: pet.E_mail,
      subject: template.subject,
      message: template.message_body,
      status: 'failed',
      error_message: error.message
    });
  }
}


// Calculate next vaccination date based on vaccine type and current vaccination date
function calculateNextVaccinationDate(vaccineName, currentVaccinationDate) {
  const date = moment(currentVaccinationDate);
  switch (vaccineName.toLowerCase()) {
    case 'da2pp':
    case 'leptospirosis':
      return date.add(4, 'weeks').format('YYYY-MM-DD');
    case 'rabies':
      return date.add(52, 'weeks').format('YYYY-MM-DD');
    case 'bordetella':
    case 'parainfluenza':
      return date.add(26, 'weeks').format('YYYY-MM-DD');
    default:
      return date.add(4, 'weeks').format('YYYY-MM-DD');
  }
}

// Process vaccination records for follow-ups

async function processVaccinationFollowUps() {
  const vaccinations = await db.query(`
    SELECT v.*, p.Pet_name, p.Pet_dob, o.E_mail, o.Owner_name
    FROM vaccination v
    JOIN pet p ON v.pet_id = p.Pet_id
    JOIN pet_owner o ON p.Owner_id = o.Owner_id
  `);

  for (const vacc of vaccinations) {
    const templates = await db.query(`
      SELECT * FROM notification_templates 
      WHERE is_active = 1 
      AND trigger_condition LIKE ?
    `, [`%${vacc.vaccine_name}%`]);

    for (const template of templates) {
      await sendNotification({ ...vacc, Pet_id: vacc.pet_id, Owner_id: vacc.Owner_id }, template);
    }
  }
}


async function sendNotification(pet, template) {
  try {
    const message = template.message_body
      .replace(/{pet_name}/g, pet.Pet_name)
      .replace(/{next_vaccination_date}/g, new Date().toLocaleDateString());

    const subject = template.subject.replace(/{pet_name}/g, pet.Pet_name);

    await transporter.sendMail({
      from: `"Four Paws Clinic" <${process.env.EMAIL_USER}>`,
      to: pet.E_mail,
      subject: subject,
      text: message
    });

    await db.query(`INSERT INTO sent_notifications SET ?`, {
      template_id: template.template_id,
      pet_id: pet.Pet_id,
      owner_id: pet.Owner_id,
      vaccination_id: pet.vaccination_id || null,
      scheduled_date: new Date(),
      sent_date: new Date(),
      email: pet.E_mail,
      subject,
      message,
      status: 'sent'
    });
  } catch (error) {
    console.error('Notification failed:', error);
    await db.query(`INSERT INTO sent_notifications SET ?`, {
      template_id: template.template_id,
      pet_id: pet.Pet_id,
      owner_id: pet.Owner_id,
      vaccination_id: pet.vaccination_id || null,
      scheduled_date: new Date(),
      sent_date: new Date(),
      email: pet.E_mail,
      subject: template.subject,
      message: template.message_body,
      status: 'failed',
      error_message: error.message
    });
  }
}

// Schedule notifications for a vaccination record
async function scheduleVaccinationNotifications(vaccinationId) {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT v.*, p.Pet_name, p.Pet_dob, p.Pet_type, o.Owner_id, o.E_mail, o.Owner_name 
       FROM vaccination v 
       JOIN pet p ON v.pet_id = p.Pet_id 
       JOIN pet_owner o ON p.Owner_id = o.Owner_id 
       WHERE v.vaccination_id = ?`,
      [vaccinationId],
      async (err, vaccinations) => {
        if (err) return reject(err);
        if (vaccinations.length === 0) return resolve();

        const vacc = vaccinations[0];
        const ageInWeeks = getAgeInWeeks(vacc.Pet_dob, vacc.vaccination_date);

        db.query(
          'SELECT * FROM notification_templates WHERE is_active = 1',
          async (err, templates) => {
            if (err) return reject(err);

            for (const template of templates) {
              const conditions = template.trigger_condition.split(' AND ');
              const ageMatch = checkAgeCondition(conditions, ageInWeeks);
              const vaccineMatch = checkVaccineCondition(conditions, vacc.vaccine_name);

              if (ageMatch && vaccineMatch) {
                const nextVaccinationDate = calculateNextVaccinationDate(
                  vacc.vaccine_name, 
                  vacc.vaccination_date
                );
                
                const scheduledDate = moment(nextVaccinationDate)
                  .subtract(template.days_before, 'days')
                  .format('YYYY-MM-DD');

                if (moment(scheduledDate).isAfter(moment())) {
                  db.query(
                    'SELECT * FROM notification_schedules WHERE vaccination_id = ? AND template_id = ?',
                    [vacc.vaccination_id, template.template_id],
                    (err, existing) => {
                      if (err) {
                        console.error('Error checking existing schedules:', err);
                        return;
                      }

                      if (existing.length === 0) {
                        // When scheduling notifications
                        db.query(
                          'INSERT INTO notification_schedules SET ?',
                          {
                            pet_id: vacc.pet_id,
                            vaccination_id: vacc.vaccination_id,
                            template_id: template.template_id,
                            scheduled_date: scheduledDate,
                            is_sent: 0
                          },
                          (err, result) => {
                            if (err) {
                              if (err.code === 'ER_NO_REFERENCED_ROW_2') {
                                console.error('Invalid foreign key reference');
                              } else {
                                console.error('Error scheduling notification:', err);
                              }
                            }
                          }
                        );
                      }
                    }
                  );
                }
              }
            }
            resolve();
          }
        );
      }
    );
  });
}

function checkAgeCondition(conditions, ageInWeeks) {
  const ageCondition = conditions.find(c => c.includes('age'));
  if (!ageCondition) return false; // We only want age-based notifications here
  
  // Handle different age condition formats
  if (ageCondition.includes('between')) {
    // Format: "age 10 between 12 weeks"
    const range = ageCondition.match(/age (\d+) between (\d+) weeks/);
    if (!range) return false;
    return ageInWeeks >= parseInt(range[1]) && ageInWeeks <= parseInt(range[2]);
  } else if (ageCondition.includes('-')) {
    // Format: "age 6-8 weeks"
    const range = ageCondition.match(/age (\d+)-(\d+) weeks/);
    if (!range) return false;
    return ageInWeeks >= parseInt(range[1]) && ageInWeeks <= parseInt(range[2]);
  } else if (ageCondition.includes('>')) {
    // Format: "age > 16 weeks"
    const threshold = ageCondition.match(/age > (\d+) weeks/);
    if (!threshold) return false;
    return ageInWeeks > parseInt(threshold[1]);
  }
  
  return false;
}




function checkVaccineCondition(conditions, vaccineName) {
  const vaccineCondition = conditions.find(c => c.includes('vaccine_name'));
  if (!vaccineCondition) return true;
  
  const expectedVaccine = vaccineCondition.match(/vaccine_name="([^"]+)"/)[1];
  return vaccineName.toLowerCase() === expectedVaccine.toLowerCase();
}

// Process scheduled notifications
async function processScheduledNotifications() {
  return new Promise((resolve, reject) => {
    const today = moment().format('YYYY-MM-DD');
    
    db.query(
      `SELECT s.*, t.subject, t.message_body, 
       p.Pet_name, p.Pet_dob, o.E_mail, o.Owner_name, v.vaccine_name, v.vaccination_date 
       FROM notification_schedules s 
       JOIN notification_templates t ON s.template_id = t.template_id 
       JOIN pet p ON s.pet_id = p.Pet_id 
       JOIN pet_owner o ON p.Owner_id = o.Owner_id 
       JOIN vaccination v ON s.vaccination_id = v.vaccination_id 
       WHERE s.scheduled_date <= ? AND s.is_sent = 0`,
      [today],
      async (err, schedules) => {
        if (err) return reject(err);

        for (const schedule of schedules) {
          try {
            const nextVaccinationDate = calculateNextVaccinationDate(
              schedule.vaccine_name,
              schedule.vaccination_date
            );

            let message = schedule.message_body
              .replace(/{pet_name}/g, schedule.Pet_name)
              .replace(/{next_vaccination_date}/g, nextVaccinationDate);
            
            let subject = schedule.subject.replace(/{pet_name}/g, schedule.Pet_name);

            if (transporter) {
              await transporter.sendMail({
                from: `"Four Paws Animal Clinic" <${process.env.EMAIL_USER || 'noreply@example.com'}>`,
                to: schedule.E_mail,
                subject: subject,
                text: message,
                html: `<div>${message.replace(/\n/g, '<br>')}</div>`
              });
            }

            db.query(
              'UPDATE notification_schedules SET is_sent = 1 WHERE schedule_id = ?',
              [schedule.schedule_id]
            );

            db.query(
              'INSERT INTO sent_notifications SET ?',
              {
                template_id: schedule.template_id,
                pet_id: schedule.pet_id,
                owner_id: schedule.Owner_id,
                vaccination_id: schedule.vaccination_id,
                scheduled_date: schedule.scheduled_date,
                sent_date: new Date(),
                email: schedule.E_mail,
                subject: subject,
                message: message,
                status: 'sent'
              }
            );

          } catch (error) {
            console.error('Failed to send notification:', error);
            db.query(
              'INSERT INTO sent_notifications SET ?',
              {
                template_id: schedule.template_id,
                pet_id: schedule.pet_id,
                owner_id: schedule.Owner_id,
                vaccination_id: schedule.vaccination_id,
                scheduled_date: schedule.scheduled_date,
                sent_date: new Date(),
                email: schedule.E_mail,
                subject: schedule.subject,
                message: schedule.message_body,
                status: 'failed',
                error_message: error.message
              }
            );
          }
        }
        resolve();
      }
    );
  });
}

// API Endpoints
router.get('/notification-templates', async (req, res) => {
  try {
    const templates = await db.query('SELECT * FROM notification_templates');
    res.json(templates);
  } catch (err) {
    console.error('Error fetching templates:', err);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

router.put('/notification-templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, message_body, days_before, is_active } = req.body;
    await db.query(
      'UPDATE notification_templates SET subject = ?, message_body = ?, days_before = ?, is_active = ? WHERE template_id = ?',
      [subject, message_body, days_before, is_active, id]
    );
    res.json({ message: 'Template updated successfully' });
  } catch (err) {
    console.error('Error updating template:', err);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

router.get('/notification-history', async (req, res) => {
  try {
    const history = await db.query(
      'SELECT sn.*, nt.template_name, p.Pet_name, po.Owner_name ' +
      'FROM sent_notifications sn ' +
      'JOIN notification_templates nt ON sn.template_id = nt.template_id ' +
      'JOIN pet p ON sn.pet_id = p.Pet_id ' +
      'JOIN pet_owner po ON sn.owner_id = po.Owner_id ' +
      'ORDER BY sn.sent_date DESC'
    );
    res.json(history);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Run this daily (set up with cron job)
// Main daily runner
async function dailyNotificationCheck() {
  try {
    // Process age-based notifications first
    await checkAgeBasedNotifications();
    
    // Process scheduled notifications from vaccination records
    const newVaccinations = await db.query(`
      SELECT v.vaccination_id FROM vaccination v 
      LEFT JOIN notification_schedules s ON v.vaccination_id = s.vaccination_id 
      WHERE s.vaccination_id IS NULL
    `);

    for (const vacc of newVaccinations) {
      await scheduleVaccinationNotifications(vacc.vaccination_id);
    }

    // Process any scheduled notifications
    await processScheduledNotifications();
    
    // Process follow-ups for existing vaccinations
    await processVaccinationFollowUps();
  } catch (error) {
    console.error('Error in daily notification check:', error);
  }
}


// Test endpoint to manually trigger notifications
router.post('/test-notification', async (req, res) => {
  try {
    const vaccinations = await db.query(
      'SELECT v.*, p.Pet_name, p.Pet_dob, o.Owner_id, o.E_mail, o.Owner_name ' +
      'FROM vaccination v ' +
      'JOIN pet p ON v.pet_id = p.Pet_id ' +
      'JOIN pet_owner o ON p.Owner_id = o.Owner_id ' +
      'ORDER BY v.vaccination_id DESC LIMIT 1'
    );

    if (vaccinations.length === 0) {
      return res.status(404).json({ error: 'No vaccination records found' });
    }

    const vacc = vaccinations[0];
    await scheduleVaccinationNotifications(vacc.vaccination_id);
    await processScheduledNotifications();

    res.json({ message: 'Test notification processed' });
  } catch (err) {
    console.error('Test notification error:', err);
    res.status(500).json({ error: 'Test notification failed' });
  }
});

// Debug endpoint to check vaccination records
router.get('/debug-vaccinations', async (req, res) => {
   try {
    const vaccinations = await db.query(
      'SELECT v.*, p.Pet_name, p.Pet_dob, o.Owner_id, o.E_mail, o.Owner_name ' +
      'FROM vaccination v ' +
      'JOIN pet p ON v.pet_id = p.Pet_id ' +
      'JOIN pet_owner o ON p.Owner_id = o.Owner_id ' +
      'ORDER BY v.vaccination_id DESC LIMIT 5'
    );

    const templates = await db.query(
      'SELECT * FROM notification_templates WHERE is_active = 1'
    );

    res.json({
      vaccinations,
      templates,
      message: 'Debug information retrieved successfully'
    });
  } catch (err) {
    console.error('Debug error:', err);
    res.status(500).json({ error: 'Debug fetch failed' });
  }
});


router.post('/trigger-notifications', async (req, res) => {
 try {
    await dailyNotificationCheck();
    res.json({ success: true, message: 'Notifications processed successfully' });
  } catch (error) {
    console.error('Error triggering notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to process notifications' });
  }
});

module.exports = {
  scheduleVaccinationNotifications,
  processScheduledNotifications,
  dailyNotificationCheck,
  router
};