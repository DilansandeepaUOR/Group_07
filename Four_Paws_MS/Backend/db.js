const { promise } = require('zod');

require('dotenv').config();

const mysql = require('mysql2/promise');

// Create a connection pool to the database using environment variables
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Test the connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Successfully connected to the database');
  connection.release(); // Release the connection back to the pool
});

module.exports = db;