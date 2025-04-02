const express = require('express');
const router = express.Router();
const db = require('../../db');

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
      'SELECT * FROM appointments WHERE owner_id = ?', 
      [id]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
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
    const [results] = await db.promise().query(
      'SELECT 1 FROM appointments WHERE appointment_date = ? AND appointment_time = ?',
      [date, time]
    );
    
    res.json({ available: results.length === 0 });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Error checking availability' });
  }
});

router.get('/timeslots', async (req, res) => {
  try {
    const [results] = await db.promise().query(
      'SELECT time_slot, am_pm FROM time_slots'
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
  const { petType, time, date, reason, additional_note } = req.body;
  console.log(petType, date, time,reason, additional_note);
  
  if (!petType || !time || !date || !reason) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const mysqlTime = formatTimeToMySQL(time);
    if (!mysqlTime) {
      return res.status(400).json({ error: 'Invalid time format' });
    }

  if(!additional_note){
    const [result] = await db.promise().query(
      `INSERT INTO appointments 
       (pet_id, appointment_time, appointment_date, reason) 
       VALUES (?, ?, ?, ?, ?)`,
      [petType, mysqlTime, date, reason]
    );
  }
  const [result] = await db.promise().query(
    `INSERT INTO appointments 
     (pet_id, appointment_time, appointment_date, reason, additional_note) 
     VALUES (?, ?, ?, ?, ?)`,
    [petType, mysqlTime, date, additional_note, reason]
  );

    
    
    res.json({ 
      success: true, 
      message: 'Appointment added successfully',
      appointmentId: result.insertId 
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Error creating appointment' });
  }
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = router;