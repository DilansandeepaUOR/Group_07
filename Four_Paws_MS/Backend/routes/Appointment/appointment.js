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
  
  if (!pet_id || !time || !date || !reason) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const mysqlTime = formatTimeToMySQL(time);
    if (!mysqlTime) {
      return res.status(400).json({ error: 'Invalid time format' });
    }

    let result;
    
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