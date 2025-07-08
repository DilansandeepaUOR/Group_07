require('dotenv').config();

const mysql = require('mysql2');

// Create a connection pool instead of a single connection
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'fourpaws',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'fourpaws_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Successfully connected to the database');
  connection.release();
});

module.exports = db;
