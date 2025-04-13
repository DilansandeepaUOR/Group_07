const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const db = require('../../db');



const router = express.Router();
router.use(cors());
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Middleware to log requests
router.use((req, res, next) => {
  if (db.state === 'disconnected') {
    console.error('Database is disconnected!');
    return res.status(500).json({ error: 'Database connection lost' });
  }
  next();
});
// MySQL connection
// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'fourpaws',
//   password: '1234',
//   database: 'fourpaws'
// });

// db.connect(err => {
//   if (err) {
//     console.error('Database connection failed:', err.stack);
//     return;
//   }
//   console.log('Connected to database.');
// });

// Test route to check server running
// router.get('/', (req, res) => {
//   res.send('Welcome to the Pet Services API!');
// });
// Endpoint to fetch all records from pet_services table
router.get('/', (req, res) => {
  const query = 'SELECT * FROM pet_services';
  
  db.query(query, (err, results) => {
      if (err) {
          console.error('Database Error:', err);
          return res.status(500).json({ error: 'Database error', details: err.message });
      }
      res.json(results); // Send records as JSON response
  });
});


// Add these new endpoints to your Express router:

// Search records by owner name
// In your recordHandle.js
// Add this route before module.exports
router.get('/search', (req, res) => {
  const owner = req.query.owner;
  if (!owner) {
    return res.status(400).json({ error: 'Owner name required' });
  }

  const query = 'SELECT * FROM pet_services WHERE owner_name LIKE ?';
  db.query(query, [`%${owner}%`], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get single record
router.get('/:id', (req, res) => {
  const query = 'SELECT * FROM pet_services WHERE id = ?';
  db.query(query, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json(results[0]);
  });
});
// Update record
router.put('/:id', (req, res) => {
  const { owner_name, pet_name, date, surgery, vaccination, other } = req.body;

  const query = `
    UPDATE pet_services 
    SET owner_name = ?, pet_name = ?, date = ?, 
        surgery = ?, vaccination = ?, other = ?
    WHERE id = ?
  `;
  db.query(query, 
    [owner_name, pet_name, date, surgery, vaccination, other, req.params.id], 
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Record updated successfully' });
    }
  );
});

// In your backend routes file (e.g., recordRoutes.js)
router.delete('/:id', async (req, res) => {

  const query = 'DELETE FROM pet_services WHERE id = ?';
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.status(204).send(); // Successful deletion (no content)
  });
});

// Endpoint to handle form submissions
router.post('/', (req, res) => {
  const { 
    ownerName = '', 
    petName = '', 
    date = '', 
    Surgery = '', 
    Vaccination = '', 
    Other = '' 
  } = req.body;

  console.log('Received Data:', { ownerName, petName, date, Surgery, Vaccination, Other });

  if (!ownerName || !petName || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `
      INSERT INTO pet_services 
      (owner_name, pet_name, date, surgery, vaccination, other) 
      VALUES (?, ?, ?, ?, ?, ?)
  `;

  const values = [
      ownerName,
      petName,
      date,
      Surgery,
      Vaccination,
      Other
  ];

  console.log('Executing query with values:', values); // Add this line

  db.query(
      query,
      values,
      (err, results) => {
          if (err) {
              console.error('Database Error:', err);
              console.error('Full error object:', err); // More detailed error
              console.error('SQL:', err.sql); // Show the actual SQL query
              console.error('Parameters:', err.parameters); // Show parameters
              return res.status(500).json({ 
                  error: 'Database error',
                  details: err.message,
                  sql: err.sql,
                  parameters: err.parameters
              });
          }
          console.log('Insert results:', results); // Log successful insertion
          res.json({ 
              message: 'Record saved successfully', 
              id: results.insertId 
          });
      }
  );
});


module.exports = router;

