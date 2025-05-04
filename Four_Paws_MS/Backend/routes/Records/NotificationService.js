import nodemailer from 'nodemailer';
const db = require('../../db');
const moment = require('moment');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kalanahansa74@gmail.com',
    pass: 'kalanahansa@7422'
  }
});
try {
  const info = await transporter.sendMail({
    from: 'kalanahansa74@gmail.com',
    to: schedule.E_mail,
    subject: subject,
    text: message
  });
  console.log('Email sent:', info.messageId);
} catch (emailError) {
  console.error('Email send failed:', emailError);
  throw emailError; // This will trigger the outer catch block
}
transporter.verify(function(error, success) {
  if (error) {
    console.error('Email transporter failed:', error);
  } else {
    console.log('Email transporter ready');
  }
});
// Initialize templates (run this once)
export async function initializeTemplates() {
  const templates = [
    {
      template_name: 'DA2PP First Dose Reminder',
      trigger_condition: 'age 6-8 weeks AND vaccine_name="DA2PP"',
      subject: 'Upcoming Vaccination Reminder for {pet_name}',
      message_body: 'This message from Four Paws Animal Clinic, Dear sir/madam, Your pet {pet_name} next vaccination on second dose of DA2PP on {next_vaccination_date}. Please be kind to do vaccination on or before two weeks later from this day.',
      days_before: 14 // 2 weeks before 10 weeks (10 weeks - 6 weeks = 4 weeks, minus 2 weeks = 2 weeks)
    },
    {
      template_name: 'Leptospirosis First Dose Reminder',
      trigger_condition: 'age 10-12 weeks AND vaccine_name="leptospirosis"',
      subject: 'Upcoming Vaccination Reminder for {pet_name}',
      message_body: 'This message from Four Paws Animal Clinic, Dear sir/madam, Your pet {pet_name} next vaccination on second dose of leptospirosis on {next_vaccination_date}. Please be kind to do vaccination on or before two weeks later from this day.',
      days_before: 14 // 2 weeks before 14 weeks (14 weeks - 10 weeks = 4 weeks, minus 2 weeks = 2 weeks)
    },
    // Add other templates similarly
  ];

  for (const template of templates) {
    const [existing] = await db.promise().query(
      'SELECT * FROM notification_templates WHERE template_name = ?',
      [template.template_name]
    );
    
    if (existing.length === 0) {
      await db.promise().query(
        'INSERT INTO notification_templates SET ?',
        template
      );
    }
  }
}

// Calculate pet's age in weeks at a given date
function getAgeInWeeks(dob, date) {
  const birthDate = moment(dob);
  const checkDate = moment(date);
  return checkDate.diff(birthDate, 'weeks');
}

// Schedule notifications for a vaccination record
export async function scheduleVaccinationNotifications(vaccinationId) {
  console.log(`Scheduling notifications for vaccination ${vaccinationId}`);
  const [vaccination] = await db.promise().query(
    'SELECT v.*, p.Pet_name, p.Pet_dob, o.Owner_id, o.E_mail ' +
    'FROM vaccination v ' +
    'JOIN pet p ON v.pet_id = p.Pet_id ' +
    'JOIN pet_owner o ON p.Owner_id = o.Owner_id ' +
    'WHERE v.vaccination_id = ?',
    [vaccinationId]
  );
  console.log(`Found ${vaccination.length} vaccinations to schedule`);
  if (vaccination.length === 0) return;

  const vacc = vaccination[0];
  const ageInWeeks = getAgeInWeeks(vacc.Pet_dob, vacc.vaccination_date);

  // Get all templates that might match this vaccination
  const [templates] = await db.promise().query(
    'SELECT * FROM notification_templates WHERE is_active = 1'
  );

  for (const template of templates) {
    let matches = false;
    let nextVaccinationDate = null;
    
    // Check template conditions
    if (template.trigger_condition.includes('age 6-8 weeks') && ageInWeeks >= 6 && ageInWeeks <= 8) {
      matches = true;
      nextVaccinationDate = moment(vacc.vaccination_date).add(4, 'weeks').format('YYYY-MM-DD');
    } 
    else if (template.trigger_condition.includes('age 10-12 weeks') && ageInWeeks >= 10 && ageInWeeks <= 12) {
      matches = true;
      nextVaccinationDate = moment(vacc.vaccination_date).add(4, 'weeks').format('YYYY-MM-DD');
    }
    else if (template.trigger_condition.includes('age 14-16 weeks') && ageInWeeks >= 14 && ageInWeeks <= 16) {
      matches = true;
      if (template.trigger_condition.includes('DA2PP') || template.trigger_condition.includes('Rabies')) {
        nextVaccinationDate = moment(vacc.vaccination_date).add(24, 'weeks').format('YYYY-MM-DD');
      } else {
        nextVaccinationDate = moment(vacc.vaccination_date).add(4, 'weeks').format('YYYY-MM-DD');
      }
    }

    // Check vaccine name match
    if (matches && template.trigger_condition.includes(`vaccine_name="${vacc.vaccine_name}"`)) {
      const scheduledDate = moment(vacc.vaccination_date).add(template.days_before, 'days').format('YYYY-MM-DD');
      
      // Schedule the notification
      await db.promise().query(
        'INSERT INTO notification_schedules SET ?',
        {
          pet_id: vacc.pet_id,
          vaccination_id: vacc.vaccination_id,
          template_id: template.template_id,
          scheduled_date: scheduledDate
        }
      );
    }
  }
}

// Process scheduled notifications
export async function processScheduledNotifications() {
  const today = moment().format('YYYY-MM-DD');
  console.log(`Processing notifications scheduled for ${today} or earlier`);
  // Get all notifications scheduled for today or earlier that haven't been sent
  const [schedules] = await db.promise().query(
    'SELECT s.*, t.subject, t.message_body, ' +
    'p.Pet_name, o.E_mail, o.Owner_name, v.vaccine_name ' +
    'FROM notification_schedules s ' +
    'JOIN notification_templates t ON s.template_id = t.template_id ' +
    'JOIN pet p ON s.pet_id = p.Pet_id ' +
    'JOIN pet_owner o ON p.Owner_id = o.Owner_id ' +
    'JOIN vaccination v ON s.vaccination_id = v.vaccination_id ' +
    'WHERE s.scheduled_date <= ? AND s.is_sent = 0',
    [today]
  );
  console.log(`Found ${schedules.length} notifications to process`);
  for (const schedule of schedules) {
    try {
      // Replace placeholders in the message
      let message = schedule.message_body
        .replace(/{pet_name}/g, schedule.Pet_name)
        .replace(/{next_vaccination_date}/g, 
          moment(schedule.vaccination_date).add(4, 'weeks').format('YYYY-MM-DD'));
      
      let subject = schedule.subject.replace(/{pet_name}/g, schedule.Pet_name);

      // Record the notification before sending (to track failures)
      const [notification] = await db.promise().query(
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
          status: 'pending'
        }
      );

      // Send email
      await transporter.sendMail({
        from: 'kalanahansa74@gmail.com',
        to: schedule.E_mail,
        subject: subject,
        text: message
      });

      // Update as sent
      await db.promise().query(
        'UPDATE sent_notifications SET status = "sent" WHERE notification_id = ?',
        [notification.insertId]
      );

      await db.promise().query(
        'UPDATE notification_schedules SET is_sent = 1 WHERE schedule_id = ?',
        [schedule.schedule_id]
      );

    } catch (error) {
      console.error('Failed to send notification:', error);
      await db.promise().query(
        'UPDATE sent_notifications SET status = "failed", error_message = ? WHERE notification_id = ?',
        [error.message, notification.insertId]
      );
    }
  }
}

// Run this daily (set up with cron job)
export async function dailyNotificationCheck() {
  try {
    // First, check for any new vaccinations that need scheduling
    const [newVaccinations] = await db.promise().query(
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

module.export = {
  initializeTemplates,
  scheduleVaccinationNotifications,
  processScheduledNotifications,
  dailyNotificationCheck
};