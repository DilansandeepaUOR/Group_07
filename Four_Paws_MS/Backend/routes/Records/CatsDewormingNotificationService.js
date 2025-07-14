const nodemailer = require('nodemailer');
const express = require('express');
const router = express.Router();
const moment = require('moment');
const cron = require('node-cron');
require('dotenv').config();
const db = require('../../db');

// --- Nodemailer Transporter Setup ---
// This reuses the same email configuration as your existing service.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error('Error with mail transporter for deworming:', error);
    } else {
        console.log('Mail transporter for deworming (Cat) is ready');
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
    if (!dob) return 0;
    return moment().diff(moment(dob), 'weeks');
};

const sendDewormingEmail = async (owner, pet, template) => {
    const subject = `Deworming Reminder for ${pet.Pet_name}`;
    const message = `Dear ${owner.Owner_name},\n\nThis is a friendly reminder for your pet, ${pet.Pet_name}'s, upcoming deworming schedule.\n\nThe recommended task is: "${template.deworm_name}".\n\nPlease consult your veterinarian for specific product recommendations and procedures.\n\nThank you,\nYour Pet Care Clinic`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: owner.E_mail,
        subject: subject,
        text: message
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Deworming email sent successfully to ${owner.E_mail} for pet ${pet.Pet_name}`);
        await query(
            'INSERT INTO cat_deworm_sent (pet_id, template_id, owner_id, sent_date, status) VALUES (?, ?, ?, ?, ?)',
            [pet.Pet_id, template.id, owner.Owner_id, new Date(), 'sent']
        );
    } catch (error) {
        console.error(`Error sending deworming email for pet ${pet.Pet_id}:`, error);
        await query(
            'INSERT INTO cat_deworm_sent (pet_id, template_id, owner_id, sent_date, status, error_message) VALUES (?, ?, ?, ?, ?, ?)',
            [pet.Pet_id, template.id, owner.Owner_id, new Date(), 'failed', error.message]
        );
    }
};


// --- Main Notification Processing Logic ---
const processPendingDewormingNotifications = async () => {
    console.log('Starting deworming notification processing cycle...');
    try {
        const [templates, allPets, allSentDeworming] = await Promise.all([
            query('SELECT * FROM cat_deworm_templates WHERE is_active = 1'),
            query('SELECT p.*, po.Owner_id, po.E_mail, po.Owner_name FROM pet p JOIN pet_owner po ON p.Owner_id = po.Owner_id WHERE p.Pet_type = "Cat"'),
            query('SELECT * FROM cat_deworm_sent')
        ]);

        const sentByPetAndTemplate = allSentDeworming.reduce((acc, n) => {
            const key = `${n.pet_id}-${n.template_id}`;
            acc[key] = n;
            return acc;
        }, {});
        
        const sentByPet = allSentDeworming.reduce((acc, n) => {
            if (!acc[n.pet_id]) acc[n.pet_id] = [];
            acc[n.pet_id].push(n);
            return acc;
        }, {});


        let notificationsSentThisCycle = 0;

        for (const pet of allPets) {
            if (!pet.Pet_dob) continue;

            const ageInWeeks = calculatePetAgeInWeeks(pet.Pet_dob);
            const petSentHistory = sentByPet[pet.Pet_id] || [];

            for (const template of templates) {
                const sentKey = `${pet.Pet_id}-${template.id}`;
                if (sentByPetAndTemplate[sentKey]) {
                    continue; // This specific template has already been sent to this pet
                }

                const ageCondition = template.age_condition;
                let conditionMet = false;

                // Check for simple age conditions (e.g., '2', '4', '12')
                if (!isNaN(ageCondition)) {
                    if (ageInWeeks === parseInt(ageCondition, 10)) {
                        conditionMet = true;
                    }
                } 
                // Check for recurring conditions based on last notification
                else if (ageCondition.startsWith('last notified+')) {
                    if (petSentHistory.length > 0) {
                        // Find the most recent notification for this pet
                        petSentHistory.sort((a, b) => new Date(b.sent_date) - new Date(a.sent_date));
                        const lastSentDate = moment(petSentHistory[0].sent_date);
                        
                        const weeksToAdd = parseInt(ageCondition.split('+')[1], 10);
                        const nextNotificationDate = lastSentDate.add(weeksToAdd, 'weeks');

                        if (moment().isSameOrAfter(nextNotificationDate, 'day')) {
                           conditionMet = true;
                        }
                    }
                }
                
                if (conditionMet) {
                    console.log(`Pet ${pet.Pet_name} (Age: ${ageInWeeks} weeks) qualifies for deworming: ${template.deworm_name}`);
                    await sendDewormingEmail(pet, pet, template);
                    notificationsSentThisCycle++;
                    // Break after sending one notification per cycle to avoid sending multiple at once
                    break; 
                }
            }
        }

        console.log(`Deworming notification cycle finished. ${notificationsSentThisCycle} emails sent.`);
        return { success: true, message: `All pending deworming notifications processed. ${notificationsSentThisCycle} emails sent.` };
    } catch (error) {
        console.error('FATAL ERROR during deworming notification processing:', error);
        throw error;
    }
};

// --- API Endpoints & Scheduler ---

// Manual trigger endpoint
router.post('/trigger-deworming-notifications-cats', async (req, res) => {
    try {
        const result = await processPendingDewormingNotifications();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// History endpoint
router.get('/deworming-notification-history', async (req, res) => {
    const sql = `
      SELECT 
        cs.notification_id, cs.sent_date, cs.status,
        p.Pet_name, po.Owner_name, dt.deworm_name
      FROM cat_deworm_sent cs
      JOIN pet p ON cs.pet_id = p.Pet_id
      JOIN pet_owner po ON cs.owner_id = po.Owner_id
      JOIN cat_deworm_templates dt ON cs.template_id = dt.id
      ORDER BY cs.sent_date DESC
    `;
    try {
        const results = await query(sql);
        res.json(results);
    } catch (error) {
        console.error('Error fetching deworming notification history:', error);
        res.status(500).json({ error: error.message });
    }
});

// Scheduled daily check
const dailyDewormingCheck = () => {
    console.log('Setting up daily deworming notification schedule...');
    // Run once on startup
    processPendingDewormingNotifications().catch(console.error);
    
    // Schedule to run at 8:10 AM daily to avoid overlapping with the other service
    cron.schedule('10 8 * * *', () => {
        console.log('Running scheduled daily deworming notification check...');
        processPendingDewormingNotifications().catch(console.error);
    }, {
        timezone: "Asia/Colombo"
    });
};

module.exports = {
    router,
    dailyDewormingCheck
};
