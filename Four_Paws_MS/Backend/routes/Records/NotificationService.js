const nodemailer = require('nodemailer');
const express = require('express');
const router = express.Router();
const moment = require('moment');
const cron = require('node-cron');
require('dotenv').config();
const db = require('../../db');

// --- Nodemailer Transporter Setup (No changes) ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
transporter.verify((error, success) => {
    if (error) console.error('Error with mail transporter:', error);
    else console.log('Mail transporter is ready');
});


// --- Database Utility (No changes) ---
const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (error, results) => {
            if (error) reject(error);
            else resolve(results);
        });
    });
};


// --- MODIFIED Email Sending Function ---
// This function is now simpler. It receives the exact due date and doesn't need to calculate it.
const sendEmailNotification = async (owner, pet, template, dueDate) => {
    const subject = template.subject.replace(/{pet_name}/g, pet.Pet_name);
    let message = template.message_body.replace(/{pet_name}/g, pet.Pet_name);
    
    const formattedDate = moment(dueDate).format('YYYY-MM-DD');
    message = message.replace(/{next_vaccination_date}/g, formattedDate);

    const mailOptions = { from: process.env.EMAIL_USER, to: owner.E_mail, subject, text: message };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${owner.E_mail} for pet ${pet.Pet_name} (Template ID: ${template.template_id})`);
        // Log the success in your database
        await query(
            'INSERT INTO sent_notifications (template_id, pet_id, owner_id, scheduled_date, sent_date, email, subject, message, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [template.template_id, pet.Pet_id, owner.Owner_id, dueDate, new Date(), owner.E_mail, subject, message, 'sent']
        );
    } catch (error) {
        console.error(`Error sending email for pet ${pet.Pet_id}:`, error);
        // Log the failure
        await query(
            'INSERT INTO sent_notifications (template_id, pet_id, owner_id, scheduled_date, sent_date, email, subject, message, status, error_message) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [template.template_id, pet.Pet_id, owner.Owner_id, dueDate, new Date(), owner.E_mail, subject, message, 'failed', error.message]
        );
    }
};


// --- REWRITTEN Main Notification Processing Logic ---
const processPendingNotifications = async () => {
    console.log('Starting v_code based notification processing cycle...');
    try {
        // 1. Fetch all necessary data from the database
        const [templates, allPets, allVaccinations, allSentNotifications] = await Promise.all([
            query('SELECT * FROM notification_templates WHERE is_active = 1'),
            query('SELECT p.*, po.Owner_id, po.E_mail, po.Owner_name FROM pet p JOIN pet_owner po ON p.Owner_id = po.Owner_id'),
            query('SELECT * FROM vaccination WHERE v_code IS NOT NULL AND v_code != "" ORDER BY vaccination_date DESC'),
            query('SELECT * FROM sent_notifications')
        ]);

        // 2. Create efficient lookups (Maps) for quick data access
        const petsMap = new Map(allPets.map(p => [p.Pet_id, p]));
        const templatesMap = new Map(templates.map(t => [t.template_id, t]));
        const templatesByVCode = new Map(templates.filter(t => t.v_code).map(t => [t.v_code, t]));
        
        const sentNotificationsMap = new Map();
        allSentNotifications.forEach(n => {
            const key = `${n.pet_id}-${n.template_id}`; // Composite key to check for duplicates
            sentNotificationsMap.set(key, true);
        });

        let notificationsSentThisCycle = 0;

        // 3. Iterate through every vaccination record that has a v_code
        for (const vaccination of allVaccinations) {
            const { pet_id, v_code, vaccination_date } = vaccination;

            // 4. Find the template for the vaccine that was *just given*
            const currentTemplate = templatesByVCode.get(v_code);
            
            // If there's no matching template or it doesn't link to a next dose, skip it
            if (!currentTemplate || !currentTemplate.next_template_id) {
                continue;
            }

            // 5. Get the template for the *next* reminder we need to send
            const nextTemplate = templatesMap.get(currentTemplate.next_template_id);
            if (!nextTemplate) {
                console.warn(`Template chain broken: v_code ${v_code} points to a missing next_template_id: ${currentTemplate.next_template_id}`);
                continue;
            }
            
            // 6. Check if this specific reminder has already been sent to this pet
            const sentKey = `${pet_id}-${nextTemplate.template_id}`;
            if (sentNotificationsMap.has(sentKey)) {
                continue;
            }

            // 7. Calculate the exact date the next dose is due
            // We use the `next_dose` value (in weeks) from the template of the shot that was given.
            const nextDueDate = moment(vaccination_date).add(currentTemplate.next_dose, 'weeks').toDate();
            
            // 8. CRITICAL CHECK: Send the email only if today is the exact due date
            if (moment().isSame(nextDueDate, 'day')) {
                const pet = petsMap.get(pet_id);
                if (pet && pet.E_mail) {
                    console.log(`MATCH: Pet ${pet.Pet_name} (ID: ${pet_id}) is due for ${nextTemplate.template_name} today.`);
                    await sendEmailNotification(pet, pet, nextTemplate, nextDueDate);
                    notificationsSentThisCycle++;
                }
            }
        }

        console.log(`Notification processing cycle finished. ${notificationsSentThisCycle} emails sent.`);
        return { success: true, message: `All pending notifications processed. ${notificationsSentThisCycle} emails sent.` };
    } catch (error) {
        console.error('FATAL ERROR during notification processing:', error);
        throw error;
    }
};


// --- API Endpoints & Scheduler ---

// MODIFIED: Update your API endpoints to handle the new 'next_template_id' field.
router.post('/notification-templates', async (req, res) => {
    const { 
        template_name, age_condition, vaccine_name, subject, message_body, is_active = 1,
        v_code, next_dose, next_template_id // Added new fields
    } = req.body;

    if (!template_name || !vaccine_name || !subject || !message_body) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const result = await query(
            `INSERT INTO notification_templates 
            (template_name, age_condition, vaccine_name, subject, message_body, is_active, v_code, next_dose, next_template_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [template_name, age_condition, vaccine_name, subject, message_body, is_active, v_code, next_dose, next_template_id]
        );
        res.status(201).json({ success: true, message: 'Template created successfully', template_id: result.insertId });
    } catch (error) {
        console.error('Error creating notification template:', error);
        res.status(500).json({ error: 'Failed to create template', details: error.message });
    }
});

router.put('/notification-templates/:id', async (req, res) => {
    const { 
        template_name, age_condition, vaccine_name, subject, message_body, is_active,
        v_code, next_dose, next_template_id // Added new fields
    } = req.body;
    
    try {
        await query(
            `UPDATE notification_templates SET 
                template_name = ?, age_condition = ?, vaccine_name = ?, subject = ?, 
                message_body = ?, is_active = ?, v_code = ?, next_dose = ?, next_template_id = ?
            WHERE template_id = ?`,
            [template_name, age_condition, vaccine_name, subject, message_body, is_active, v_code, next_dose, next_template_id, req.params.id]
        );
        res.json({ success: true, message: 'Template updated successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// --- API Endpoints & Scheduler ---

router.post('/trigger-notifications', async (req, res) => {
    try {
        const result = await processPendingNotifications();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/notification-history', async (req, res) => {
    const sql = `
      SELECT 
        sn.notification_id, sn.subject, sn.message, sn.status, sn.sent_date,
        p.Pet_name, po.Owner_name, nt.template_name
      FROM sent_notifications sn
      JOIN pet p ON sn.pet_id = p.Pet_id
      JOIN pet_owner po ON sn.owner_id = po.Owner_id
      JOIN notification_templates nt ON sn.template_id = nt.template_id
      ORDER BY sn.sent_date DESC
    `;
    try {
        const results = await query(sql);
        if (results.length === 0) {
            return res.status(404).json({ error: 'No notifications found' });
        }
        res.json(results);
    } catch (error) {
        console.error('Error fetching notification history:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/notification-templates', async (req, res) => {
    try {
        const results = await query('SELECT * FROM notification_templates');
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/notification-templates', async (req, res) => {
    const { 
        template_name, 
        age_condition, 
        vaccine_name, 
        subject, 
        message_body, 
        is_active = 1 // Default to active if not specified
    } = req.body;

    // Validate required fields
    if (!template_name || !age_condition || !vaccine_name || !subject || !message_body) {
        return res.status(400).json({ 
            error: 'Missing required fields: template_name, age_condition, vaccine_name, subject, message_body' 
        });
    }

    try {
        const result = await query(
            `INSERT INTO notification_templates 
            (template_name, age_condition, vaccine_name, subject, message_body, is_active) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [template_name, age_condition, vaccine_name, subject, message_body, is_active]
        );

        res.status(201).json({ 
            success: true, 
            message: 'Template created successfully',
            template_id: result.insertId 
        });
    } catch (error) {
        console.error('Error creating notification template:', error);
        res.status(500).json({ 
            error: 'Failed to create template',
            details: error.message 
        });
    }
});

router.put('/notification-templates/:id', async (req, res) => {
    const { subject, message_body, days_before, is_active } = req.body;
    try {
        await query(
            'UPDATE notification_templates SET subject = ?, message_body = ?, is_active = ? WHERE template_id = ?',
            [subject, message_body, is_active, req.params.id]
        );
        res.json({ success: true, message: 'Template updated successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const dailyNotificationCheck = () => {
    console.log('Setting up daily notification schedule...');
    processPendingNotifications().catch(console.error);
    cron.schedule('0 8 * * *', () => {
        console.log('Running scheduled daily notification check...');
        processPendingNotifications().catch(console.error);
    }, {
        timezone: "Asia/Colombo"
    });
};

module.exports = {
    router,
    dailyNotificationCheck
};
