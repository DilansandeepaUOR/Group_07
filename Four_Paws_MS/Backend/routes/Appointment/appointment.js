const express = require('express');
const router = express.Router();
const db = require('../../db');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { formatDate, formatTime } = require('../Utils/dateFormatter');
// Middleware
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Request logging middleware
router.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Utility functions
const formatTimeToMySQL = (time) => {
  if (!time) return null;
  
  const [timePart, period] = time.split(' ');
  let [hours, minutes] = timePart.split(':');
  
  if (period?.toLowerCase() === 'pm' && hours !== '12') {
    hours = String(Number(hours) + 12);
  } else if (period?.toLowerCase() === 'am' && hours === '12') {
    hours = '00';
  }

  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
};

// Routes
router.get('/', async (req, res) => {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'ID query parameter is required' });
  }

  try {
    const [results] = await db.promise().query(
      'SELECT appointments.*, pet.Pet_name FROM appointments JOIN pet ON appointments.pet_type = pet.Pet_id WHERE appointments.owner_id = ?', 
      [id]
    );
    
    if (results.length === 0) {
      // The frontend expects { msg: false } when no appointments are found
      return res.json({ msg: false });
    }
    
    // Return the results directly as an array when appointments exist
    res.json(results);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Error retrieving appointment' });
  }
});

router.get('/pets', async (req, res) => {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'ID query parameter is required' });
  }

  try {
    const [results] = await db.promise().query(
      'SELECT Pet_id,Pet_name FROM pet WHERE owner_id = ?', 
      [id]
    );
    
    if (results.length === 0) {
      // The frontend expects { msg: false } when no appointments are found
      return res.json({ msg: false });
    }
    
    // Return the results directly as an array when appointments exist
    res.json(results);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Error retrieving appointment' });
  }
});

router.get('/checkdatetime', async (req, res) => {
  const { date, time } = req.query;

  if (!date || !time) {
    return res.status(400).json({ error: 'Date and time are required' });
  }

  try {
    const currentTime = new Date();
    const requestedDateTime = new Date(`${date}T${time}`);

    // Add 1 hour buffer
    const minimumAllowedTime = new Date(currentTime.getTime() + 60 * 60 * 1000);

    // Block past dates or times within the next hour
    if (requestedDateTime < minimumAllowedTime) {
      return res.json({ available: false, reason: 'Cannot book in the past or within 1 hour' });
    }

    // Check DB for existing appointment (excluding cancelled ones)
    const [results] = await db.promise().query(
      `SELECT 1 
       FROM appointments 
       WHERE appointment_date = ? 
       AND appointment_time = ? 
       AND status != 'Cancelled'`,
      [date, time]
    );

    return res.json({ available: results.length === 0 });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Error checking availability' });
  }
});



router.get('/timeslots', async (req, res) => {
  try {
    const [results] = await db.promise().query(
      'SELECT time_slot FROM time_slots'
    );
    res.json(results);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Error fetching time slots' });
  }
});

router.get('/reasons', async (req, res) => {
  try {
    const [results] = await db.promise().query(
      'SELECT * FROM reasons ORDER BY id'
    );
    res.json(results);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Error fetching reasons' });
  }
});

router.post('/appointment', async (req, res) => {
  const { pet_id, time, date, reason, user_id, additional_note } = req.body;
  console.log(pet_id, date, time, reason, additional_note, user_id);
  let result;

  if (!pet_id || !time || !date || !reason) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const mysqlTime = formatTimeToMySQL(time);
    if (!mysqlTime) {
      return res.status(400).json({ error: 'Invalid time format' });
    }

    
    
    // Check if additional_note is provided
    if (!additional_note) {
      [result] = await db.promise().query(
        `INSERT INTO appointments 
         (pet_type, appointment_time, appointment_date, reason, owner_id) 
         VALUES (?, ?, ?, ?, ?)`,
        [pet_id, mysqlTime, date, reason, user_id]
      );
    } else {
      [result] = await db.promise().query(
        `INSERT INTO appointments 
         (pet_type, appointment_time, appointment_date, reason, additional_note, owner_id) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [pet_id, mysqlTime, date, reason, additional_note, user_id]
      );
    }
    
    // Fetch the newly created appointment to return complete data
    const [newAppointment] = await db.promise().query(
      'SELECT appointments.*, pet.Pet_name FROM appointments JOIN pet ON appointments.pet_type = pet.Pet_id WHERE appointment_id = ?',
      [result.insertId]
    );

    
    
    res.json({ 
      success: true, 
      message: 'Appointment added successfully',
      appointment_id: result.insertId,
      status: 'Scheduled',
      petType: newAppointment[0].Pet_name,
      date: date,
      time: mysqlTime,
      reason: reason,
      Pet_name: newAppointment[0].Pet_name,
      additional_note: additional_note || null
    });

    
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Error creating appointment' });
  }

  const fullDateTime = `${date}T${time}`;

  const [emailRows] = await db.promise().query(
    'SELECT E_mail FROM pet_owner WHERE Owner_id=?',[user_id]
  );

  const userEmail = emailRows[0]?.E_mail;

  if (!userEmail) {
    throw new Error("Recipient email not found for user ID: " + user_id);
  }

  try{

   
    const [GetPetName] = await db.promise().query(
      'SELECT Pet_name FROM pet WHERE Pet_id=?',[pet_id]
    );
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    if (!transporter) {
      throw new Error("Email service not available");
    }
    let subject = 'Clinic Appointment Completed Scheduled - Four Paws Clinic';
    let Message = `Your appointment is scheduled on ${formatDate(fullDateTime)} at ${formatTime(fullDateTime)}. Please arrive at least 10 minutes early. Thank you!`;
    let Location ='526/A, Colombo Rd,Rathnapura';
    // Styled HTML content for the email
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; min-width: 600px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0;">
        <!-- Header -->
        <div style="background-color: #028478; color: #fff; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Four Paws Clinic</h1>
          <p style="margin: 5px 0 0; font-size: 14px;">Mobile Veterinary Service</p>
        </div>

        <!-- Body -->
        <div style="background-color: #fff; padding: 25px;">
          <h2 style="color: #028478; font-size: 20px; margin-top: 0;">Appointment Update</h2>

          <!-- Status Message -->
          <div style="background-color: #e6f4f1; padding: 15px 20px; border-radius: 6px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 16px; font-weight: 600;">${Message}</p>
          </div>

          <!-- Pet Info -->
          <div style="margin-bottom: 20px;">
            <h3 style="color: #028478; font-size: 16px; margin-bottom: 10px;">Pet Information</h3>
            <p style="margin: 0;"><strong>Pet Name:</strong> ${GetPetName.Pet_name || 'Not specified'}</p>
          </div>

          <!-- Location Info -->
          <div style="margin-bottom: 20px;">
            <h3 style="color: #028478; font-size: 16px; margin-bottom: 10px;">Location</h3>
            <p style="margin: 0;">${Location}</p>
          </div>


          <!-- Footer Info -->
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 13px; color: #6c757d; text-align: center;">
            <p style="margin: 0; font-weght:bold;">Appointment ID: ${result.insertId}</p>
            <p style="margin: 5px 0 0;">Contact: ${process.env.EMAIL_USER}</p>
          </div>
        </div>
      </div>
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject,
      html: htmlContent,
    });

    return true;


  }
  catch(err){
    console.error('Database error:', err);
  }
});

router.put('/cancel/:id', async (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ error: 'Appointment ID is required' });
  }

  try {
    // First, check if the appointment exists and is in a cancellable state
    const [appointment] = await db.promise().query(
      'SELECT * FROM appointments WHERE appointment_id = ?',
      [id]
    );

    if (appointment.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment[0].status === 'Cancelled') {
      return res.status(400).json({ error: 'Appointment is already cancelled' });
    }

    if (appointment[0].status === 'Completed') {
      return res.status(400).json({ error: 'Cannot cancel completed appointments' });
    }

    // Update the appointment status to "Cancelled"
    const [result] = await db.promise().query(
      'UPDATE appointments SET status = ? WHERE appointment_id = ?',
      ['Cancelled', id]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ error: 'Failed to cancel appointment' });
    }

    res.json({ 
      success: true, 
      message: 'Appointment cancelled successfully',
      appointment_id: parseInt(id)
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Error cancelling appointment' });
  }
});

// Add pet endpoint
router.post('/pets', async (req, res) => {
  const { Pet_name, Pet_type, gender, dob, user_id } = req.body;

  if (!Pet_name || !Pet_type || !gender || !dob || !user_id) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // const sql = `
    //   INSERT INTO pet (Pet_name, Pet_type, Pet_gender, Pet_dob, Owner_id)
    //   VALUES (?, ?, ?, ?, ?)
    // `;
    // await db.execute(sql, [Pet_name, Pet_type, gender, dob, user_id]);
    [result] = await db.promise().query(
      ' INSERT INTO pet (Pet_name, Pet_type, Pet_gender, Pet_dob, Owner_id) VALUES (?, ?, ?, ?, ?)',
      [Pet_name, Pet_type, gender, dob, user_id]
    );

    res.status(201).json({ message: 'Pet added successfully.' });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ message: 'Failed to add pet. Server error.' });
  }
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = router;