const nodemailer = require('nodemailer');
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const moment = require('moment');
const cron = require('node-cron');
const env = require('dotenv');
const db = require('../../db');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify email configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('Email transporter failed:', error);
  } else {
    console.log('Email transporter ready');
  }
});

// Initialize templates (run this once)
async function initializeTemplates() {
  const templates = [
    {
      template_name: 'DA2PP First Dose Reminder',
      trigger_condition: 'age 6-8 weeks AND vaccine_name="DA2PP"',
      subject: 'Upcoming Vaccination Reminder for {pet_name}',
      message_body: 'This message from Four Paws Animal Clinic, Dear sir/madam, Your pet {pet_name} next vaccination on second dose of DA2PP on {next_vaccination_date}. Please be kind to do vaccination on or before two weeks later from this day.',
      days_before: 14,
      is_active: 1
    },
    {
      template_name: 'Leptospirosis First Dose Reminder',
      trigger_condition: 'age 10-12 weeks AND vaccine_name="Leptospirosis"',
      subject: 'Upcoming Vaccination Reminder for {pet_name}',
      message_body: 'This message from Four Paws Animal Clinic, Dear sir/madam, Your pet {pet_name} next vaccination on second dose of Leptospirosis on {next_vaccination_date}. Please be kind to do vaccination on or before two weeks later from this day.',
      days_before: 14,
      is_active: 1
    },
    {
      template_name: 'Rabies Annual Reminder',
      trigger_condition: 'vaccine_name="Rabies"',
      subject: 'Annual Rabies Vaccination Reminder for {pet_name}',
      message_body: 'This message from Four Paws Animal Clinic, Dear sir/madam, Your pet {pet_name} is due for their annual Rabies vaccination on {next_vaccination_date}. Please schedule an appointment to ensure your pet remains protected.',
      days_before: 30,
      is_active: 1
    },
    {
      template_name: 'Bordetella Semi-Annual Reminder',
      trigger_condition: 'vaccine_name="Bordetella"',
      subject: 'Bordetella Vaccination Reminder for {pet_name}',
      message_body: 'This message from Four Paws Animal Clinic, Dear sir/madam, Your pet {pet_name} is due for their Bordetella vaccination on {next_vaccination_date}. This vaccine helps protect against kennel cough.',
      days_before: 14,
      is_active: 1
    },
    {
      template_name: 'Parainfluenza Semi-Annual Reminder',
      trigger_condition: 'vaccine_name="Parainfluenza"',
      subject: 'Parainfluenza Vaccination Reminder for {pet_name}',
      message_body: 'This message from Four Paws Animal Clinic, Dear sir/madam, Your pet {pet_name} is due for their Parainfluenza vaccination on {next_vaccination_date}. This vaccine helps protect against respiratory infections.',
      days_before: 14,
      is_active: 1
    }
  ];

  for (const template of templates) {
    const [existing] = await db.query(
      'SELECT * FROM notification_templates WHERE template_name = ?',
      [template.template_name]
    );
    
    if (existing.length === 0) {
      await db.query(
        'INSERT INTO notification_templates SET ?',
        template
      );
      console.log(`Created template: ${template.template_name}`);
    }
  }
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
  try {
    console.log('Scheduling notifications for vaccination:', vaccinationId);
    
    const [vaccinations] = await db.query(
      `SELECT v.*, p.Pet_name, p.Pet_dob, p.Pet_type, o.Owner_id, o.E_mail, o.Owner_name 
       FROM vaccination v 
       JOIN pet p ON v.pet_id = p.Pet_id 
       JOIN pet_owner o ON p.Owner_id = o.Owner_id 
       WHERE v.vaccination_id = ?`,
      [vaccinationId]
    );

    if (vaccinations.length === 0) {
      console.log('No vaccination record found for ID:', vaccinationId);
      return;
    }

    const vacc = vaccinations[0];
    console.log('Found vaccination record:', {
      petName: vacc.Pet_name,
      vaccineName: vacc.vaccine_name,
      vaccinationDate: vacc.vaccination_date
    });

    const ageInWeeks = getAgeInWeeks(vacc.Pet_dob, vacc.vaccination_date);
    console.log('Pet age in weeks:', ageInWeeks);

    // Get all active templates
    const [templates] = await db.query(
      'SELECT * FROM notification_templates WHERE is_active = 1'
    );
    console.log('Found active templates:', templates.length);

    for (const template of templates) {
      console.log('Checking template:', template.template_name);
      const conditions = template.trigger_condition.split(' AND ');
      const ageMatch = checkAgeCondition(conditions, ageInWeeks);
      const vaccineMatch = checkVaccineCondition(conditions, vacc.vaccine_name);

      console.log('Template conditions:', {
        ageMatch,
        vaccineMatch,
        conditions,
        ageInWeeks,
        vaccineName: vacc.vaccine_name
      });

      if (ageMatch && vaccineMatch) {
        const nextVaccinationDate = calculateNextVaccinationDate(
          vacc.vaccine_name, 
          vacc.vaccination_date
        );
        
        const scheduledDate = moment(nextVaccinationDate)
          .subtract(template.days_before, 'days')
          .format('YYYY-MM-DD');

        console.log('Calculated dates:', {
          nextVaccinationDate,
          scheduledDate,
          daysBefore: template.days_before
        });

        // Only schedule if the date is in the future
        if (moment(scheduledDate).isAfter(moment())) {
          // Check if a schedule already exists
          const [existing] = await db.query(
            'SELECT * FROM notification_schedules WHERE vaccination_id = ? AND template_id = ?',
            [vacc.vaccination_id, template.template_id]
          );

          if (existing.length === 0) {
            await db.query(
              'INSERT INTO notification_schedules SET ?',
              {
                pet_id: vacc.pet_id,
                vaccination_id: vacc.vaccination_id,
                template_id: template.template_id,
                scheduled_date: scheduledDate,
                is_sent: 0
              }
            );
            console.log(`Scheduled notification for ${vacc.Pet_name} - ${vacc.vaccine_name} on ${scheduledDate}`);
          } else {
            console.log('Schedule already exists for this vaccination and template');
          }
        } else {
          console.log('Scheduled date is in the past, skipping');
        }
      }
    }
  } catch (error) {
    console.error('Error scheduling notifications:', error);
    throw error;
  }
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
  try {
    const today = moment().format('YYYY-MM-DD');
    console.log('Processing notifications for date:', today);
    
    const [schedules] = await db.query(
      'SELECT s.*, t.subject, t.message_body, ' +
      'p.Pet_name, p.Pet_dob, o.E_mail, o.Owner_name, v.vaccine_name, v.vaccination_date ' +
      'FROM notification_schedules s ' +
      'JOIN notification_templates t ON s.template_id = t.template_id ' +
      'JOIN pet p ON s.pet_id = p.Pet_id ' +
      'JOIN pet_owner o ON p.Owner_id = o.Owner_id ' +
      'JOIN vaccination v ON s.vaccination_id = v.vaccination_id ' +
      'WHERE s.scheduled_date <= ? AND s.is_sent = 0',
      [today]
    );

    console.log('Found schedules to process:', schedules.length);

    for (const schedule of schedules) {
      try {
        console.log('Processing schedule:', {
          petName: schedule.Pet_name,
          vaccineName: schedule.vaccine_name,
          scheduledDate: schedule.scheduled_date,
          email: schedule.E_mail
        });

        // Calculate next vaccination date
        const nextVaccinationDate = calculateNextVaccinationDate(
          schedule.vaccine_name,
          schedule.vaccination_date
        );

        // Replace placeholders in the message
        let message = schedule.message_body
          .replace(/{pet_name}/g, schedule.Pet_name)
          .replace(/{next_vaccination_date}/g, nextVaccinationDate);
        
        let subject = schedule.subject.replace(/{pet_name}/g, schedule.Pet_name);

        // Create HTML message
        const htmlMessage = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">${subject}</h2>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
              <p><strong>Pet:</strong> ${schedule.Pet_name}</p>
              <p><strong>Next Vaccination:</strong> ${nextVaccinationDate}</p>
              <p><strong>Vaccine:</strong> ${schedule.vaccine_name}</p>
            </div>
            <p style="margin-top: 20px; font-size: 0.9em; color: #7f8c8d;">
              This is an automated message from Four Paws Animal Clinic. Please do not reply directly to this email.
            </p>
          </div>
        `;

        console.log('Sending email to:', schedule.E_mail);

        // Send email
        const info = await transporter.sendMail({
          from: `"Four Paws Animal Clinic" <${process.env.EMAIL_USER}>`,
          to: schedule.E_mail,
          subject: subject,
          text: message,
          html: htmlMessage
        });

        console.log('Email sent successfully:', info.messageId);

        // Update as sent
        await db.query(
          'UPDATE notification_schedules SET is_sent = 1 WHERE schedule_id = ?',
          [schedule.schedule_id]
        );

        // Record the sent notification
        const [result] = await db.query(
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

        console.log('Notification recorded in database:', result.insertId);

      } catch (error) {
        console.error('Failed to send notification:', error);
        // Record the failed notification
        const [result] = await db.query(
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
        console.log('Failed notification recorded in database:', result.insertId);
      }
    }
  } catch (error) {
    console.error('Error processing notifications:', error);
    throw error;
  }
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
    // First, check for any new vaccinations that need scheduling
    const [newVaccinations] = await db.query(
      'SELECT v.vaccination_id FROM vaccination v ' +
      'LEFT JOIN notification_schedules s ON v.vaccination_id = s.vaccination_id ' +
      'WHERE s.vaccination_id IS NULL'
    );

    for (const vacc of newVaccinations) {
      await scheduleVaccinationNotifications(vacc.vaccination_id);
    }

    // Then process any scheduled notifications
    await processScheduledNotifications();

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


// Initialize Templates on Server Start and start cron job
initializeTemplates().then(() => {
  console.log('Notification templates initialized');
  
  // Run daily at 9 AM
  cron.schedule('0 9 * * *', () => {
    console.log('Running daily notification check...');
    dailyNotificationCheck().catch(err => {
      console.error('Error in daily notification check:', err);
    });
  });
  
  console.log('Cron job scheduled for daily notifications');
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
  initializeTemplates,
  scheduleVaccinationNotifications,
  processScheduledNotifications,
  dailyNotificationCheck,
  router
};