const nodemailer = require('nodemailer');
const express = require('express');
const router = express.Router();
const moment = require('moment');
const cron = require('node-cron');
require('dotenv');
const db = require('../../db');

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

// Calculate pet's age in weeks at a given date
function getAgeInWeeks(dob, date) {
  if (!dob || !date) {
    console.error('Missing date for age calculation');
    return 0;
  }
  
  try {
    const birthDate = moment(dob);
    const checkDate = moment(date);
    
    if (!birthDate.isValid() || !checkDate.isValid()) {
      console.error('Invalid date format for age calculation');
      return 0;
    }
    
    return checkDate.diff(birthDate, 'weeks');
  } catch (error) {
    console.error('Error calculating age:', error);
    return 0;
  }
}

// Calculate next vaccination date based on vaccine type and current vaccination date
function calculateNextVaccinationDate(vaccineName, currentVaccinationDate) {
  const date = moment(currentVaccinationDate);
  
  switch (vaccineName.toLowerCase()) {
    case 'da2pp':
      return date.add(4, 'weeks').format('YYYY-MM-DD');
    case 'leptospirosis':
      return date.add(4, 'weeks').format('YYYY-MM-DD');
    case 'rabies':
      return date.add(52, 'weeks').format('YYYY-MM-DD'); // Annual
    case 'bordetella':
      return date.add(26, 'weeks').format('YYYY-MM-DD'); // Semi-annual
    case 'parainfluenza':
      return date.add(26, 'weeks').format('YYYY-MM-DD'); // Semi-annual
    default:
      return date.add(4, 'weeks').format('YYYY-MM-DD');
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
                        db.query(
                          'INSERT INTO notification_schedules SET ?',
                          {
                            pet_id: vacc.pet_id,
                            vaccination_id: vacc.vaccination_id,
                            template_id: template.template_id,
                            scheduled_date: scheduledDate,
                            is_sent: 0
                          },
                          (err) => {
                            if (err) {
                              console.error('Error scheduling notification:', err);
                            } else {
                              console.log(`Scheduled notification for ${vacc.Pet_name}`);
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
  if (!ageCondition) return true;
  
  const ageRange = ageCondition.match(/age (\d+)-(\d+) weeks/);
  if (!ageRange) return false;
  
  const minAge = parseInt(ageRange[1]);
  const maxAge = parseInt(ageRange[2]);
  return ageInWeeks >= minAge && ageInWeeks <= maxAge;
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
    const [templates] = await db.query('SELECT * FROM notification_templates');
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
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
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

router.get('/notification-history', async (req, res) => {
  try {
    console.log('Fetching notification history');
    const [history] = await db.query(
      'SELECT sn.*, nt.template_name, p.Pet_name, po.Owner_name ' +
      'FROM sent_notifications sn ' +
      'JOIN notification_templates nt ON sn.template_id = nt.template_id ' +
      'JOIN pet p ON sn.pet_id = p.Pet_id ' +
      'JOIN pet_owner po ON sn.owner_id = po.Owner_id ' +
      'ORDER BY sn.sent_date DESC'
    );
    console.log('Found notification history records:', history.length);
    res.json(history);
  } catch (error) {
    console.error('Error fetching notification history:', error);
    res.status(500).json({ error: 'Failed to fetch notification history' });
  }
});

// Run this daily (set up with cron job)
async function dailyNotificationCheck() {
  try {
    db.query(
      'SELECT v.vaccination_id FROM vaccination v ' +
      'LEFT JOIN notification_schedules s ON v.vaccination_id = s.vaccination_id ' +
      'WHERE s.vaccination_id IS NULL',
      async (err, newVaccinations) => {
        if (err) throw err;
        
        for (const vacc of newVaccinations) {
          await scheduleVaccinationNotifications(vacc.vaccination_id);
        }

        await processScheduledNotifications();
      }
    );
  } catch (error) {
    console.error('Error in daily notification check:', error);
  }
}


// Test endpoint to manually trigger notifications
router.post('/test-notification', async (req, res) => {
  try {
    // Get the latest vaccination record
    const [vaccinations] = await db.query(
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
    console.log('Testing notification for vaccination:', vacc);

    // Schedule notifications for this vaccination
    await scheduleVaccinationNotifications(vacc.vaccination_id);

    // Process notifications immediately
    await processScheduledNotifications();

    res.json({ message: 'Test notification processed' });
  } catch (error) {
    console.error('Error in test notification:', error);
    res.status(500).json({ error: 'Failed to process test notification' });
  }
});

// Debug endpoint to check vaccination records
router.get('/debug-vaccinations', async (req, res) => {
  try {
    const [vaccinations] = await db.query(
      'SELECT v.*, p.Pet_name, p.Pet_dob, o.Owner_id, o.E_mail, o.Owner_name ' +
      'FROM vaccination v ' +
      'JOIN pet p ON v.pet_id = p.Pet_id ' +
      'JOIN pet_owner o ON p.Owner_id = o.Owner_id ' +
      'ORDER BY v.vaccination_id DESC LIMIT 5'
    );

    const [templates] = await db.query(
      'SELECT * FROM notification_templates WHERE is_active = 1'
    );

    res.json({
      vaccinations,
      templates,
      message: 'Debug information retrieved successfully'
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({ error: 'Failed to retrieve debug information' });
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