const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'four_paws_ms',
  multipleStatements: true
};

// Create connection
const connection = mysql.createConnection(dbConfig);

// Read and execute SQL file
const sqlFile = path.join(__dirname, 'schema.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

connection.query(sql, (err, results) => {
  if (err) {
    console.error('Error executing SQL:', err);
    process.exit(1);
  }
  
  console.log('Database tables created successfully!');
  console.log('Results:', results);
  
  connection.end();
}); 