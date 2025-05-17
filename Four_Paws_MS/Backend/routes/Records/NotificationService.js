const nodemailer = require('nodemailer');
const express = require('express');
const router = express.Router();
const moment = require('moment');
const cron = require('node-cron');
require('dotenv').config();
const db = require('../../db');

// Create email transporter using .env credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Error with mail transporter:', error);
  } else {
    console.log('Mail transporter is ready');
  }
});

// Helper function to promisify db.query
const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

/**
 * Calculate pet's age in weeks from pet_dob to current date
 * @param {Date} dob - Pet's date of birth
 * @returns {Number} Age in weeks
 */
const calculatePetAgeInWeeks = (dob) => {
  const birthDate = moment(dob);
  const currentDate = moment();
  return currentDate.diff(birthDate, 'weeks');
};


//Minimum age calculation
const getMinimumAgeFromCondition = (condition) => {
  // Remove all whitespace
  const cleanCondition = condition.replace(/\s/g, '');
  
  // For conditions like "6>=8", extract the first number
  if (/^\d+[><=]+\d+$/.test(cleanCondition)) {
    return parseInt(cleanCondition.split(/[><=]+/)[0]);
  }
  
  // For conditions like ">16", return the threshold number
  return parseInt(cleanCondition.replace(/[^0-9]/g, ''));
};

/**
 * Parse age condition to extract operator and value
 * @param {String} condition - Age condition string (e.g. "6>=8", "> 16")
 * @returns {Object} Parsed condition {value: Number, operator: String}
 */
const parseAgeCondition = (condition) => {
  // Remove all whitespace from the condition
  const cleanCondition = condition.replace(/\s/g, '');
  
  // Match operators: >=, <=, >, <, =
  const operatorMatch = cleanCondition.match(/(>=|<=|>|<|=)/);
  if (!operatorMatch) return null;
  
  const operator = operatorMatch[0];
  const parts = cleanCondition.split(operator);
  
  // For conditions like "6>=8" we want the right side number (8)
  // For conditions like ">16" we want the number after operator (16)
  const value = operatorMatch.index === 0 ? parseFloat(parts[1]) : parseFloat(parts[parts.length - 1]);
  
  return { value, operator };
};

/**
 * Calculate next vaccination date based on age condition
 * @param {Date} dob - Pet's date of birth
 * @param {String} ageCondition - Age condition string
 * @returns {Date} Next vaccination date
 */
const calculateNextVaccinationDate = (dob, ageCondition) => {
  const parsedCondition = parseAgeCondition(ageCondition);
  if (!parsedCondition) return null;
  
  const birthDate = moment(dob);
  return birthDate.add(parsedCondition.value, 'weeks').toDate();
};

/**
 * Check if a notification should be sent based on age condition, vaccination history, and previous notifications
 * @param {Object} pet - Pet information
 * @param {Object} template - Notification template
 * @param {Array} vaccinations - Array of pet's vaccinations
 * @param {Array} sentNotifications - Array of previously sent notifications
 * @returns {Object} {shouldSend: Boolean, dose: String, nextVaccinationDate: Date}
 */
const shouldSendNotification = async (pet, template, vaccinations, sentNotifications) => {
  // 1. Calculate age in weeks
  if (!pet.Pet_dob || !template.is_active) return { shouldSend: false };
  const ageInWeeks = calculatePetAgeInWeeks(pet.Pet_dob);
  
  // 2. Find available vaccines in notification_templates using age_condition and vaccine_name
  const parsedCondition = parseAgeCondition(template.age_condition);
  if (!parsedCondition) return { shouldSend: false };

  // 3. Find if available vaccines are already saved in the vaccination table
  const petVaccinations = vaccinations.filter(v => 
    v.pet_id === pet.Pet_id && 
    v.vaccine_name.toLowerCase() === template.vaccine_name.toLowerCase()
  );

  // 4. Check latest vaccine record for this pet
  petVaccinations.sort((a, b) => new Date(b.vaccination_date) - new Date(a.vaccination_date));
  const latestVaccination = petVaccinations[0];

  // 5. Calculate available dose based on vaccination history
  let dose = 'first';
  let nextVaccinationDate = null;

  if (latestVaccination) {
    // If there's a previous vaccination, this is a second dose
    dose = 'second';
    
    // Calculate next vaccination date based on the latest vaccination
    const lastVaccinationDate = new Date(latestVaccination.vaccination_date);
    nextVaccinationDate = new Date(lastVaccinationDate);
    nextVaccinationDate.setDate(nextVaccinationDate.getDate() + template.days_before);
  } else {
    // For first dose, use the age condition
    nextVaccinationDate = calculateNextVaccinationDate(pet.Pet_dob, template.age_condition);
  }

  // 6. Check for existing notification
  const existingNotification = sentNotifications.find(n => 
    n.pet_id === pet.Pet_id && 
    n.template_id === template.template_id &&
    (!n.vaccination_id || n.vaccination_id === (latestVaccination?.vaccination_id || null)) &&
    new Date(n.scheduled_date).toDateString() === new Date().toDateString() // Same day check
  );

  if (existingNotification) {
    return { shouldSend: false, reason: 'Notification already sent today' };
  }

  // Check if the pet has reached the required age for the dose
  let ageConditionMet = false;
  switch (parsedCondition.operator) {
    case '>':
      ageConditionMet = ageInWeeks > parsedCondition.value;
      break;
    case '>=':
      ageConditionMet = ageInWeeks >= parsedCondition.value;
      break;
    case '<':
      ageConditionMet = ageInWeeks < parsedCondition.value;
      break;
    case '<=':
      ageConditionMet = ageInWeeks <= parsedCondition.value;
      break;
    case '=':
      ageConditionMet = ageInWeeks === parsedCondition.value;
      break;
  }

  return {
    shouldSend: ageConditionMet,
    dose,
    nextVaccinationDate,
    ageInWeeks
  };
};

/**
 * Send email notification to pet owner
 * @param {Object} owner - Pet owner information
 * @param {Object} pet - Pet information
 * @param {Object} template - Notification template
 * @param {Object} vaccination - Vaccination information (optional)
 * @returns {Promise} Promise that resolves when email is sent
 */
const sendEmailNotification = async (owner, pet, template, vaccination = null) => {
  const nextVaccinationDate = calculateNextVaccinationDate(pet.Pet_dob, template.age_condition);
  
  // Replace placeholders in subject and message
  const subject = template.subject.replace('{pet_name}', pet.Pet_name);
  let message = template.message_body.replace('{pet_name}', pet.Pet_name);
  
  if (nextVaccinationDate) {
    const formattedDate = moment(nextVaccinationDate).format('YYYY-MM-DD');
    message = message.replace('{next_vaccination_date}', formattedDate);
  }
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: owner.E_mail,
    subject: subject,
    text: message
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    
    // Save to sent_notifications table
    await query(
      'INSERT INTO sent_notifications (template_id, pet_id, owner_id, vaccination_id, scheduled_date, sent_date, email, subject, message, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        template.template_id,
        pet.Pet_id,
        owner.Owner_id,
        vaccination ? vaccination.vaccination_id : null,
        new Date(),
        new Date(),
        owner.E_mail,
        subject,
        message,
        'sent'
      ]
    );
    
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Save failed attempt to sent_notifications table
    await query(
      'INSERT INTO sent_notifications (template_id, pet_id, owner_id, vaccination_id, scheduled_date, sent_date, email, subject, message, status, error_message) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        template.template_id,
        pet.Pet_id,
        owner.Owner_id,
        vaccination ? vaccination.vaccination_id : null,
        new Date(),
        new Date(),
        owner.E_mail,
        subject,
        message,
        'failed',
        error.message
      ]
    );
    
    throw error;
  }
};

/**
 * Process pending notifications with enhanced vaccination checks
 */
const processPendingNotifications = async () => {
  try {
    // Get all active notification templates
    const templates = await query('SELECT * FROM notification_templates WHERE is_active = 1');

    // Get all vaccinations at once for efficiency
    const allVaccinations = await query('SELECT * FROM vaccination');
    
    // Get all pets with their owners
    const pets = await query(`
      SELECT p.*, po.Owner_id, po.E_mail, po.Owner_name 
      FROM pet p
      JOIN pet_owner po ON p.Owner_id = po.Owner_id
    `);
    
    // Get recent sent notifications (last 7 days)
    const sentNotifications = await query(`
      SELECT * FROM sent_notifications 
      WHERE sent_date > DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    for (const template of templates) {
      for (const pet of pets) {
        // Calculate age in weeks
        const ageInWeeks = calculatePetAgeInWeeks(pet.Pet_dob);
        
        // Parse age condition
        const parsedCondition = parseAgeCondition(template.age_condition);
        if (!parsedCondition) continue;

        // Check if notification was already sent recently
        const existingNotification = sentNotifications.find(n => 
          n.pet_id === pet.Pet_id && 
          n.template_id === template.template_id &&
          n.vaccine_name === template.vaccine_name
        );

        if (existingNotification) continue;

        // Check if age condition is met
        let ageConditionMet = false;
        switch (parsedCondition.operator) {
          case '>':
            ageConditionMet = ageInWeeks > parsedCondition.value;
            break;
          case '>=':
            ageConditionMet = ageInWeeks >= parsedCondition.value;
            break;
          case '<':
            ageConditionMet = ageInWeeks < parsedCondition.value;
            break;
          case '<=':
            ageConditionMet = ageInWeeks <= parsedCondition.value;
            break;
          case '=':
            ageConditionMet = ageInWeeks === parsedCondition.value;
            break;
        }

        if (ageConditionMet) {
          try {
            // Calculate next vaccination date
            const nextVaccinationDate = calculateNextVaccinationDate(pet.Pet_dob, template.age_condition);
            
            // Determine dose based on age
            let dose = 'first';
            if (ageInWeeks >= 14) {
              dose = 'third';
            } else if (ageInWeeks >= 10) {
              dose = 'second';
            }

            // Modify email template
            const modifiedTemplate = {
              ...template,
              subject: template.subject
                .replace('{pet_name}', pet.Pet_name)
                .replace('{dose}', dose),
              message_body: template.message_body
                .replace('{pet_name}', pet.Pet_name)
                .replace('{dose}', dose)
                .replace('{next_vaccination_date}', nextVaccinationDate.toISOString().split('T')[0])
            };

            // Send email
            const mailOptions = {
              from: process.env.EMAIL_USER,
              to: pet.E_mail,
              subject: modifiedTemplate.subject,
              text: modifiedTemplate.message_body
            };

            const info = await transporter.sendMail(mailOptions);

            // Save to sent_notifications table
            await query(
              'INSERT INTO sent_notifications (template_id, pet_id, owner_id, scheduled_date, sent_date, email, subject, message, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [
                template.template_id,
                pet.Pet_id,
                pet.Owner_id,
                new Date(),
                new Date(),
                pet.E_mail,
                modifiedTemplate.subject,
                modifiedTemplate.message_body,
                'sent'
              ]
            );

            console.log(`Notification sent for pet ${pet.Pet_name} (${pet.Pet_id}) using template ${template.template_name} - ${dose} dose at ${ageInWeeks} weeks`);
          } catch (error) {
            console.error(`Failed to send notification for pet ${pet.Pet_name}:`, error);
            
            // Save failed attempt
            await query(
              'INSERT INTO sent_notifications (template_id, pet_id, owner_id, scheduled_date, sent_date, email, subject, message, status, error_message) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [
                template.template_id,
                pet.Pet_id,
                pet.Owner_id,
                new Date(),
                new Date(),
                pet.E_mail,
                modifiedTemplate.subject,
                modifiedTemplate.message_body,
                'failed',
                error.message
              ]
            );
          }
        }
      }
    }
    
    return { success: true, message: 'All pending notifications processed' };
  } catch (error) {
    console.error('Error processing notifications:', error);
    throw error;
  }
};

/**
 * API endpoint to trigger notification processing manually
 */
router.post('/trigger-notifications', async (req, res) => {
  try {
    const result = await processPendingNotifications();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * API endpoint to get notification history
 */
router.get('/notification-history', (req, res) => {
  const query = `
    SELECT 
      sn.notification_id,
      sn.subject,
      sn.message,
      sn.status,
      sn.sent_date,
      p.Pet_name,
      po.Owner_name,
      ont.template_name
    FROM sent_notifications sn
    JOIN pet p ON sn.pet_id = p.Pet_id
    JOIN pet_owner po ON sn.owner_id = po.Owner_id
    JOIN old_notification_templates ont ON sn.template_id = ont.template_id
    ORDER BY sn.sent_date DESC
  `;

  db.query(query, (error, results) => {
    if (results.length === 0) {
      return res.status(404).json({ error: 'No notifications found' });
    }
    if (error) {
      console.error('Error fetching notifications:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

/**
 * API endpoint to get notification templates
 */
// Notification routes
router.get('/notification-templates', async (req, res) => {
  try {
    const results = await query('SELECT * FROM notification_templates');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * API endpoint to update notification template
 */
router.put('/notification-templates/:id', async (req, res) => {
  const { subject, message_body, days_before, is_active } = req.body;
  
  try {
    await query(
      'UPDATE notification_templates SET subject = ?, message_body = ?, days_before = ?, is_active = ? WHERE template_id = ?',
      [subject, message_body, days_before, is_active, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Daily notification check function to be called on server start
 */
const dailyNotificationCheck = () => {
  // Run immediately on server start
  processPendingNotifications().catch(console.error);
  
  // Then schedule to run daily at 8 AM
  cron.schedule('0 8 * * *', () => {
    console.log('Running daily notification check...');
    processPendingNotifications().catch(console.error);
  });
};

module.exports = {
  router,
  dailyNotificationCheck
};