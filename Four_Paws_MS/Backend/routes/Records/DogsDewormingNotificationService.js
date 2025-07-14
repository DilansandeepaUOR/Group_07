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
        console.error('Error with mail transporter for deworming:', error);
    } else {
        console.log('Mail transporter for deworming (Dog) is ready');
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
    return moment().diff(moment(dob), 'weeks')+1;
};

/**
 * Step 5 & 6: Send the email with all placeholders replaced and save the record.
 */
const sendDewormingEmail = async (owner, pet, template, petAge, lastDewormDate, nextDewormDate) => {
    // Replace all placeholders
    const subject = template.subject.replace(/{pet_name}/g, pet.Pet_name);
    let message = template.message_body
        .replace(/{pet_name}/g, pet.Pet_name)
        .replace(/{pet_age}/g, `${petAge} weeks`)
        .replace(/{last_deworm}/g, lastDewormDate ? moment(lastDewormDate).format('YYYY-MM-DD') : 'No previous record')
        .replace(/{next_deworm}/g, nextDewormDate ? moment(nextDewormDate).format('YYYY-MM-DD') : 'As per vet recommendation');

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: owner.E_mail,
        subject: subject,
        text: message
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Deworming email sent successfully to ${owner.E_mail} for pet ${pet.Pet_name}`);
        // Save to the sent log
        await query(
            'INSERT INTO dog_deworm_sent (pet_id, template_id, owner_id, sent_date, status) VALUES (?, ?, ?, ?, ?)',
            [pet.Pet_id, template.id, owner.Owner_id, new Date(), 'sent']
        );
    } catch (error) {
        console.error(`Error sending deworming email for pet ${pet.Pet_id}:`, error);
        await query(
            'INSERT INTO dog_deworm_sent (pet_id, template_id, owner_id, sent_date, status, error_message) VALUES (?, ?, ?, ?, ?, ?)',
            [pet.Pet_id, template.id, owner.Owner_id, new Date(), 'failed', error.message]
        );
    }
};


// --- Main Notification Processing Logic ---
const processPendingDewormingNotifications = async () => {
    console.log('Starting deworming notification processing cycle...');
    try {
        // Fetch all necessary data in parallel
        const [templates, allPets, allSentDeworming, allDewormRecords] = await Promise.all([
            query('SELECT * FROM dog_deworm_templates WHERE is_active = 1 ORDER BY id ASC'), // Order by ID to calculate next deworm date easily
            query('SELECT p.*, po.Owner_id, po.E_mail, po.Owner_name FROM pet p JOIN pet_owner po ON p.Owner_id = po.Owner_id WHERE p.Pet_type = "Dog"'),
            query('SELECT * FROM dog_deworm_sent'),
            query('SELECT * FROM deworm ORDER BY date DESC') // Fetch last deworming records
        ]);

        // --- Data Structuring for easy lookup ---
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

        const lastDewormByPet = allDewormRecords.reduce((acc, record) => {
            if (!acc[record.pet_id]) {
                acc[record.pet_id] = record.date;
            }
            return acc;
        }, {});


        let notificationsSentThisCycle = 0;

        for (const pet of allPets) {
            if (!pet.Pet_dob) continue;

            // Step 1: Calculate pet's current age
            const ageInWeeks = calculatePetAgeInWeeks(pet.Pet_dob);
            const petSentHistory = sentByPet[pet.Pet_id] || [];
            
            for (let i = 0; i < templates.length; i++) {
                const template = templates[i];
                const sentKey = `${pet.Pet_id}-${template.id}`;

                // Step 4: Check if this template was already sent to this pet
                if (sentByPetAndTemplate[sentKey]) {
                    continue;
                }

                const ageCondition = template.age_condition;
                let conditionMet = false;

                // Step 2: Compare age with the age condition
                if (!isNaN(ageCondition)) { // Handles simple age conditions like '2', '4', '10'
                    if (ageInWeeks === parseInt(ageCondition, 10)) {
                        conditionMet = true;
                    }
                } 
                else if (ageCondition.startsWith('last notified+')) { // Handles recurring conditions
                    if (petSentHistory.length > 0) {
                        petSentHistory.sort((a, b) => new Date(b.sent_date) - new Date(a.sent_date));
                        const lastSentDate = moment(petSentHistory[0].sent_date);
                        
                        const weeksToAdd = parseInt(ageCondition.split('+')[1], 10);
                        const nextNotificationDate = lastSentDate.clone().add(weeksToAdd, 'weeks');

                        if (moment().isSameOrAfter(nextNotificationDate, 'day')) {
                           conditionMet = true;
                        }
                    }
                }
                
                // Step 3: If condition is met, prepare and send the email
                if (conditionMet) {
                    console.log(`Pet ${pet.Pet_name} (Age: ${ageInWeeks} weeks) qualifies for deworming: ${template.deworm_name}`);

                    // --- Calculate placeholder values ---
                    const lastDewormDate = lastDewormByPet[pet.Pet_id] || null;

                    // Calculate the NEXT deworming date by looking at the *next* template
                    let nextDewormDate = null;
                    if (i + 1 < templates.length) {
                        const nextTemplate = templates[i+1];
                        const nextAgeCondition = nextTemplate.age_condition;
                        if (!isNaN(nextAgeCondition)) {
                            nextDewormDate = moment(pet.Pet_dob).add(parseInt(nextAgeCondition, 10), 'weeks').toDate();
                        } else if (nextAgeCondition.startsWith('last notified+')) {
                            const weeksToAdd = parseInt(nextAgeCondition.split('+')[1], 10);
                            // The next deworming will be based on today's sent date
                            nextDewormDate = moment().add(weeksToAdd, 'weeks').toDate();
                        }
                    }

                    await sendDewormingEmail(pet, pet, template, ageInWeeks, lastDewormDate, nextDewormDate);
                    notificationsSentThisCycle++;
                    
                    // Break to send only one notification per pet per cycle
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
router.post('/trigger-deworming-notifications-dogs', async (req, res) => {
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
        ds.notification_id, ds.sent_date, ds.status,
        p.Pet_name, po.Owner_name, dt.deworm_name
      FROM dog_deworm_sent ds
      JOIN pet p ON ds.pet_id = p.Pet_id
      JOIN pet_owner po ON ds.owner_id = po.Owner_id
      JOIN dog_deworm_templates dt ON ds.template_id = dt.id
      ORDER BY ds.sent_date DESC
    `;
    try {
        const results = await query(sql);
        res.json(results);
    } catch (error) {
        console.error('Error fetching deworming notification history:', error);
        res.status(500).json({ error: error.message });
    }
});

// Scheduled daily check to run at 8:05 AM
const dailyDewormingCheck = () => {
    console.log('Setting up daily deworming notification schedule...');
    // Schedule to run at 8:05 AM daily
    cron.schedule('5 8 * * *', () => {
        console.log('Running scheduled daily deworming notification check...');
        processPendingDewormingNotifications().catch(console.error);
    }, {
        timezone: "Asia/Colombo"
    });
};

module.exports = {
    router,
    dailyDewormingCheck,
    processPendingDewormingNotifications
};