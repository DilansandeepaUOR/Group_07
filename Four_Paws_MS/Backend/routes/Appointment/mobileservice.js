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

router.get('/user/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.promise().query(
      'SELECT mobile_service.*, pet.Pet_name FROM mobile_service JOIN pet ON mobile_service.pet_id = pet.Pet_id JOIN pet_owner ON mobile_service.petOwnerID = pet_owner.Owner_id',
      [id]
    );
    
    // Add `type` field to each result
    const updatedResults = results.map(row => ({
      ...row,
      type: row.address == null ? 'coordinates' : 'address'
    }));

    res.json(updatedResults);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Error fetching mobile services' });
  }
  
});


router.post('/', async (req, res) => {
  try {
    const {
      user_id,
      pet_id,       // assuming this is pet_id
      location,
      status,
      reason = '' // optional field from frontend
    } = req.body;

    // Extract location details
    const latitude = location.type === "coordinates" ? location.latitude : null;
    const longitude = location.type === "coordinates" ? location.longitude : null;
    const address = location.type === "address" ? location.value : null;

    // Create table if it does not exist
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS mobile_service (
        id INT AUTO_INCREMENT PRIMARY KEY,
        petOwnerID INT NOT NULL,
        pet_id INT NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        address TEXT,
        status ENUM('pending', 'confirmed', 'cancelled', 'complete') NOT NULL DEFAULT 'pending',
        special_notes TEXT,
        reason TEXT,
        date DATE,
        time TIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert appointment
    const [newAppointment] = await db.promise().query(`
      INSERT INTO mobile_service (petOwnerID, pet_id, latitude, longitude, address, status, reason)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      user_id,
      pet_id,
      latitude,
      longitude,
      address,
      status,
      reason,
    ]);

    res.status(201).json({ message: 'Mobile appointment booked successfully.', appointment_id: newAppointment.insertId });
  } catch (error) {
    console.error('Error booking mobile service:', error);
    res.status(500).json({ error: 'Failed to book mobile service.' });
  }
  
});

router.put('/cancel/:id', async (req, res) => {
  console.log("cancel")
  const { id } = req.params;
  try {
    const [results] = await db.promise().query(
      'UPDATE mobile_service SET status = "Cancelled" WHERE id = ?',
      [id]
    );
    res.json({ message: 'Mobile service cancelled successfully.' });
  } catch (error) {
    console.error('Error cancelling mobile service:', error);
    res.status(500).json({ error: 'Failed to cancel mobile service.' });
  }
});


// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = router;
