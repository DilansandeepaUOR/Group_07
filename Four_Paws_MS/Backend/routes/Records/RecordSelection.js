const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// Database configuration (should move to environment variables in production)
const dbConfig = {
  host: 'localhost',
  user: 'fourpaws_user',
  password: '1234',
  database: 'fourpaws_db'
};

// Search owners by name
router.post('/search-owners', async (req, res) => {
  const { searchTerm } = req.body;
  
  try {
    const pool = mysql.createPool(dbConfig);
    const [rows] = await pool.query(
      'SELECT * FROM pet_owner WHERE Owner_name LIKE ?',
      [`%${searchTerm}%`]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error searching owners:', error);
    res.status(500).json({ 
      error: 'Error searching owners',
      details: error.message 
    });
  }
});

// Get pets by owner ID
router.post('/get-pets', async (req, res) => {
  const { ownerId } = req.body;
  
  try {
    const pool = mysql.createPool(dbConfig);
    const [rows] = await pool.query(
      'SELECT * FROM pet WHERE Owner_id = ?',
      [ownerId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching pets:', error);
    res.status(500).json({ 
      error: 'Error fetching pets',
      details: error.message 
    });
  }
});

// Get records by pet ID
router.post('/get-records', async (req, res) => {
  const { petId } = req.body;
  
  try {
    const pool = mysql.createPool(dbConfig);
    const [rows] = await pool.query(
      'SELECT * FROM record WHERE Pet_id = ? ORDER BY date DESC',
      [petId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ 
      error: 'Error fetching records',
      details: error.message 
    });
  }
});

module.exports = router;