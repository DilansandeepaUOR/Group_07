const express = require('express');
const router = express.Router();
const db = require('../../db');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Middleware to log request details
router.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}'`);
  next();
});

// Route to get a specific appointment by ID
router.get('/', (req, res) => {
    const appointmentId = req.query.id;
    console.log(`Fetching appointment with ID: ${appointmentId}`);
  
    if (!appointmentId) {
      return res.status(400).send('ID query parameter is required');
    }

  db.query('SELECT * FROM appointments WHERE owner_id = ?', [appointmentId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error retrieving appointment');
    }

    if (results.length === 0) {
      return res.status(404).send('Appointment not found');
    }

    res.json(results[0]); // Send only the first matching appointment
  });
  
});

router.get('/checkdatetime', (req, res) => {
  const { date, time } = req.query;

  if (!date || !time) {
    return res.status(400).json({ error: "Date and time are required" });
  }

  console.log(`Checking availability for date: ${date}, time: ${time}`);
  db.query('SELECT * FROM appointments WHERE appointment_date = ? AND appointment_time = ?', [date, time], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      return res.status(409).json({ available: false });
    }

    res.json({ available: true });
  });
});

// Error-handling middleware (should be at the end)
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

router.get('/timeslots', (req, res) => {
  console.log(`Fetching available time slots`);

  db.query('SELECT time_slot, am_pm FROM time_slots', (err, results) => {
    if (err) {
      console.error('Database Error:', err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
});

module.exports = router;
