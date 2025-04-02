const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db'); // Import the database connection
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.json());

// Endpoint to save pet service record
app.post('/api/pet-service', (req, res) => {
  const { ownerName, petName, date, services, serviceDetails } = req.body;

  // Insert into the database
  const query = 'INSERT INTO pet_services (owner_name, pet_name, date, services, service_details) VALUES (?, ?, ?, ?, ?)';
  const servicesString = services.join(', '); // Convert array to string
  const serviceDetailsString = JSON.stringify(serviceDetails); // Convert object to string

  db.query(query, [ownerName, petName, date, servicesString, serviceDetailsString], (err, results) => {
    if (err) {
      console.error('Error inserting data: ', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ message: 'Record saved successfully', id: results.insertId });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});