const nodemailer = require('nodemailer');
const express = require('express');
const router = express.Router();
const moment = require('moment');
const cron = require('node-cron');
require('dotenv').config();
const db = require('../../db');

// --- Nodemailer Transporter Setup ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error('Error with mail transporter:', error);
    } else {
        console.log('Mail transporter is ready');
    }
});

// --- Database Utility ---
const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (error, results) => {
            if (error) reject(error);
            else resolve(results);
        });
    });
};

// --- Core Helper Functions ---
const calculatePetAgeInWeeks = (dob) => {
    return moment().diff(moment(dob), 'weeks') + 1; // Adding 1 to include the current week
};

const parseAgeCondition = (condition) => {
    const cleanCondition = condition.replace(/\s/g, '');
    const rangeMatch = cleanCondition.match(/^(\d+)(?:>=|-)(\d+)$/);
    if (rangeMatch) {
        return { type: 'range', min: parseInt(rangeMatch[1], 10), max: parseInt(rangeMatch[2], 10) };
    }
    const operatorMatch = cleanCondition.match(/^(>=|<=|>|<|=)(\d+\.?\d*)$/);
    if (operatorMatch) {
        return { type: 'operator', operator: operatorMatch[1], value: parseFloat(operatorMatch[2]) };
    }
    console.warn(`Invalid age condition format: "${condition}"`);
    return null;
};

const calculateNextVaccinationDate = (dob, ageCondition) => {
    const condition = parseAgeCondition(ageCondition);
    if (!condition) return null;
    const birthDate = moment(dob);
    let weeksToAdd = condition.type === 'range' ? condition.min : condition.value;
    return birthDate.add(weeksToAdd, 'weeks').toDate();
};

const sendEmailNotification = async (owner, pet, template, lastVaccinationDate = null) => {
    let nextVaccinationDate;
    
    if (template.template_name.toLowerCase().includes('annual') && lastVaccinationDate) {
        nextVaccinationDate = moment(lastVaccinationDate).add(1, 'year').toDate();
    } else {
        nextVaccinationDate = calculateNextVaccinationDate(pet.Pet_dob, template.age_condition);
    }

    const subject = template.subject.replace(/{pet_name}/g, pet.Pet_name);
    let message = template.message_body.replace(/{pet_name}/g, pet.Pet_name);
    
    const formattedDate = nextVaccinationDate ? moment(nextVaccinationDate).format('YYYY-MM-DD') : '[Date not available]';
    message = message.replace(/{next_vaccination_date}/g, formattedDate);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: owner.E_mail,
        subject: subject,
        text: message
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${owner.E_mail} for pet ${pet.Pet_name} for template ${template.template_id}`);
        await query(
            'INSERT INTO sent_notifications (template_id, pet_id, owner_id, scheduled_date, sent_date, email, subject, message, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [template.template_id, pet.Pet_id, owner.Owner_id, new Date(), new Date(), owner.E_mail, subject, message, 'sent']
        );
    } catch (error) {
        console.error(`Error sending email for pet ${pet.Pet_id}:`, error);
        await query(
            'INSERT INTO sent_notifications (template_id, pet_id, owner_id, scheduled_date, sent_date, email, subject, message, status, error_message) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [template.template_id, pet.Pet_id, owner.Owner_id, new Date(), new Date(), owner.E_mail, subject, message, 'failed', error.message]
        );
    }
};

// --- Main Notification Processing Logic ---

const processPendingNotifications = async () => {
    console.log('Starting notification processing cycle...');
    try {
        const [templates, allPets, allVaccinations, allSentNotifications] = await Promise.all([
            query('SELECT * FROM notification_templates WHERE is_active = 1'),
            query('SELECT p.*, po.Owner_id, po.E_mail, po.Owner_name FROM pet p JOIN pet_owner po ON p.Owner_id = po.Owner_id'),
            query('SELECT * FROM vaccination'),
            query('SELECT * FROM sent_notifications')
        ]);

        const vaccinationsByPet = allVaccinations.reduce((acc, v) => {
            if (!acc[v.pet_id]) acc[v.pet_id] = [];
            acc[v.pet_id].push(v);
            return acc;
        }, {});

        const sentNotificationsByPetAndTemplate = allSentNotifications.reduce((acc, n) => {
            const key = `${n.pet_id}-${n.template_id}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(n);
            return acc;
        }, {});

        let notificationsSentThisCycle = 0;

        const firstDoseTemplates = templates.filter(t => t.template_name.toLowerCase().includes('first dose'));

        for (const pet of allPets) {
            if (!pet.Pet_dob) continue;

            const ageInWeeks = calculatePetAgeInWeeks(pet.Pet_dob);
            const petVaccinations = vaccinationsByPet[pet.Pet_id] || [];
            
            // --- Part A: Check for NEW First Dose reminders ---
            for (const template of firstDoseTemplates) {
                const hasHadVaccine = petVaccinations.some(v => v.vaccine_name.toLowerCase() === template.vaccine_name.toLowerCase());
                if (hasHadVaccine) continue; // Skip, this vaccine series has already started.

                const sentKey = `${pet.Pet_id}-${template.template_id}`;
                const alreadySent = sentNotificationsByPetAndTemplate[sentKey]?.some(n => n.status === 'sent');
                if (alreadySent) continue; // Skip, this specific first dose reminder was already sent.
                
                const ageCondition = parseAgeCondition(template.age_condition);
                if (!ageCondition) continue;

                let conditionMet = false;
                if (ageCondition.type === 'range') {
                    conditionMet = ageInWeeks >= ageCondition.min; // Reminder is valid from the start of the window onwards
                } else if (ageCondition.type === 'operator') {
                     switch (ageCondition.operator) {
                        case '>': conditionMet = ageInWeeks > ageCondition.value; break;
                        case '>=': conditionMet = ageInWeeks >= ageCondition.value; break;
                        case '<': conditionMet = ageInWeeks < ageCondition.value; break;
                        case '<=': conditionMet = ageInWeeks <= ageCondition.value; break;
                        case '=': conditionMet = ageInWeeks === ageCondition.value; break;
                    }
                }

                if (conditionMet) {
                    console.log(`Pet ${pet.Pet_name} qualifies for a NEW series: ${template.template_name}`);
                    await sendEmailNotification(pet, pet, template);
                    notificationsSentThisCycle++;
                }
            }


            // --- Part B: Check for Follow-up Dose reminders ---
            const vaccinesGroupedByName = petVaccinations.reduce((acc, v) => {
                const name = v.vaccine_name.toLowerCase();
                if (!acc[name]) acc[name] = [];
                acc[name].push(v);
                return acc;
            }, {});

            for (const vaccineName in vaccinesGroupedByName) {
                const historyForVaccine = vaccinesGroupedByName[vaccineName];
                historyForVaccine.sort((a, b) => new Date(b.vaccination_date) - new Date(a.vaccination_date));
                const lastVaccination = historyForVaccine[0];
                const doseCount = historyForVaccine.length;

                let nextDoseKeyword;
                if (doseCount === 1) nextDoseKeyword = 'second dose';
                else if (doseCount === 2) nextDoseKeyword = 'third dose';
                else nextDoseKeyword = 'annual';

                const nextTemplate = templates.find(t => 
                    t.vaccine_name.toLowerCase() === vaccineName && 
                    t.template_name.toLowerCase().includes(nextDoseKeyword)
                );

                if (!nextTemplate) continue;

                const sentKey = `${pet.Pet_id}-${nextTemplate.template_id}`;
                const sentRecords = sentNotificationsByPetAndTemplate[sentKey] || [];
                
                if (sentRecords.some(n => n.status === 'sent') && !nextTemplate.template_name.toLowerCase().includes('annual')) {
                    continue;
                }

                let conditionMet = false;
                if (nextTemplate.template_name.toLowerCase().includes('annual')) {
                    const monthsSinceLastDose = moment().diff(moment(lastVaccination.vaccination_date), 'months');
                    if (monthsSinceLastDose >= 11) {
                        const lastSentForThisAnnual = sentRecords.filter(n => n.status === 'sent').sort((a, b) => new Date(b.sent_date) - new Date(a.sent_date))[0];
                        if (!lastSentForThisAnnual || moment().diff(moment(lastSentForThisAnnual.sent_date), 'months') >= 11) {
                            conditionMet = true;
                        }
                    }
                } else {
                    const ageCondition = parseAgeCondition(nextTemplate.age_condition);
                    if (!ageCondition) continue;

                    if (ageCondition.type === 'range') {
                        conditionMet = ageInWeeks >= ageCondition.min; // Now sends even if past the 'max' date
                    } else if (ageCondition.type === 'operator') {
                        switch (ageCondition.operator) {
                            case '>': conditionMet = ageInWeeks > ageCondition.value; break;
                            case '>=': conditionMet = ageInWeeks >= ageCondition.value; break;
                            case '<': conditionMet = ageInWeeks < ageCondition.value; break;
                            case '<=': conditionMet = ageInWeeks <= ageCondition.value; break;
                            case '=': conditionMet = ageInWeeks === ageCondition.value; break;
                        }
                    }
                }

                if (conditionMet) {
                    console.log(`Pet ${pet.Pet_name} qualifies for a FOLLOW-UP: ${nextTemplate.template_name}`);
                    await sendEmailNotification(pet, pet, nextTemplate, lastVaccination.vaccination_date);
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
            'UPDATE notification_templates SET subject = ?, message_body = ?, days_before = ?, is_active = ? WHERE template_id = ?',
            [subject, message_body, days_before, is_active, req.params.id]
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
