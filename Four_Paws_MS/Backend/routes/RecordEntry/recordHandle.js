const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const router = express.Router();  // Correctly use router
router.use(cors());
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Middleware to log requests
router.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'fourpaws',
  password: '1234',
  database: 'fourpaws'
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database.');
});

// Test route to check server running
router.get('/', (req, res) => {
  res.send('Welcome to the Pet Services API!');
});

// Endpoint to handle form submissions
router.post('/', (req, res) => {
  const { ownerName, petName, date, services, serviceDetails } = req.body;
  console.log('Received Data:', ownerName, petName, date, services, serviceDetails);

  if (!ownerName || !petName || !date || !services) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `
    INSERT INTO pet_services 
    (owner_name, pet_name, date, services, service_details) 
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [ownerName, petName, date, JSON.stringify(services), JSON.stringify(serviceDetails)],
    (err, results) => {
      if (err) {
        console.error('Database Error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Record saved successfully', id: results.insertId });
    }
  );
});

module.exports = router;
