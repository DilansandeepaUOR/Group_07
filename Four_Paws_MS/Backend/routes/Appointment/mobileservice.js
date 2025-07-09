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


router.get('/address', async (req, res) => {
  const { id } = req.query;
  try {
    const [results] = await db.promise().query(
      'SELECT Owner_address FROM pet_owner WHERE Owner_id = ?',
      [id]
    );
    res.json(results);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Error fetching reasons' });
  }
});


router.post('/', async (req, res) => {
  try {
    const {
      user_id,
      pet_details,       // assuming this is pet_id
      location,
      status,
      special_notes = '' // optional field from frontend
    } = req.body;

    // Extract location details
    const latitude = location.type === "coordinates" ? location.latitude : null;
    const longitude = location.type === "coordinates" ? location.longitude : null;
    const address = location.type === "address" ? location.value : null;

    // Create table if it does not exist
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS mobileService (
        id INT AUTO_INCREMENT PRIMARY KEY,
        petOwnerID INT NOT NULL,
        pet_id INT NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        address TEXT,
        status VARCHAR(50),
        special_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    const pet_id=pet_details.pet_id;

    // Insert appointment
    const [newAppointment] = await db.promise().query(`
      INSERT INTO mobileService (petOwnerID, pet_id, latitude, longitude, address, status, special_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      user_id,
      pet_id,
      latitude,
      longitude,
      address,
      status,
      special_notes
    ]);

    res.status(201).json({ message: 'Mobile appointment booked successfully.', appointment_id: newAppointment.insertId });
  } catch (error) {
    console.error('Error booking mobile service:', error);
    res.status(500).json({ error: 'Failed to book mobile service.' });
  }
  
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = router;