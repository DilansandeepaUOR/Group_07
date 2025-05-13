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


// Add this temporary test route at the top of your RecordSelection.js
router.get('/test-connection', async (req, res) => {
  try {
    const pool = mysql.createPool(dbConfig);
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    res.json({ 
      success: true,
      solution: rows[0].solution,
      dbConfig: dbConfig // This will show your actual DB config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search owners by name
router.post('/search-owners', async (req, res) => {
  const { searchTerm } = req.body;
  
  if (!searchTerm || searchTerm.trim() === '') {
    return res.status(400).json({ 
      success: false,
      error: 'Search term is required',
      details: 'Please enter a name to search for owners' 
    });
  }
  
  try {
    const pool = mysql.createPool(dbConfig);
    const [rows] = await pool.query(
      'SELECT * FROM pet_owner WHERE Owner_name LIKE ?',
      [`%${searchTerm}%`]
    );
    
    if (rows.length === 0) {
      return res.json({ 
        success: false,
        message: 'No matching owners found',
        data: []
      });
    }
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error searching owners:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error searching owners',
      details: error.message 
    });
  }
});

// Get pets by owner ID
router.post('/get-pets', async (req, res) => {
  const { ownerId } = req.body;
  
  if (!ownerId) {
    return res.status(400).json({ 
      error: 'Owner ID is required',
      details: 'Please select an owner first' 
    });
  }
  
  try {
    const pool = mysql.createPool(dbConfig);
    const [rows] = await pool.query(
      'SELECT * FROM pet WHERE Owner_id = ?',
      [ownerId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        error: 'No pets found',
        details: 'This owner has no registered pets' 
      });
    }
    
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
  
  if (!petId) {
    return res.status(400).json({ 
      error: 'Pet ID is required',
      details: 'Please select a pet first' 
    });
  }
  
  try {
    const pool = mysql.createPool(dbConfig);
    const [rows] = await pool.query(
      'SELECT * FROM record WHERE Pet_id = ? ORDER BY date DESC',
      [petId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        error: 'No records found',
        details: 'No medical records found for this pet' 
      });
    }
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ 
      error: 'Error fetching records',
      details: error.message 
    });
  }
});


// Get all records with optional filtering
router.get('/all-records', async (req, res) => {  // Changed to GET
  try {
    const pool = mysql.createPool(dbConfig);
    const query = `
      SELECT r.*, p.Pet_name, p.Pet_type, o.Owner_name, o.E_mail 
      FROM record r
      JOIN pet p ON r.Pet_id = p.Pet_id
      JOIN pet_owner o ON p.Owner_id = o.Owner_id
      ORDER BY r.date DESC
    `;
    
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching all records:', error);
    res.status(500).json({ 
      error: 'Error fetching records',
      details: error.message 
    });
  }
});

// Add this new endpoint for filtered searches
router.post('/filtered-records', async (req, res) => {
  const { searchTerm, year, month, date } = req.body;
  
  try {
    const pool = mysql.createPool(dbConfig);
    let query = `
      SELECT r.*, p.Pet_name, p.Pet_type, o.Owner_name, o.E_mail 
      FROM record r
      JOIN pet p ON r.Pet_id = p.Pet_id
      JOIN pet_owner o ON p.Owner_id = o.Owner_id
    `;
    
    const conditions = [];
    const params = [];
    
    if (searchTerm) {
      conditions.push('(o.Owner_name LIKE ? OR p.Pet_name LIKE ?)');
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }
    
    if (year) {
      conditions.push('YEAR(r.date) = ?');
      params.push(year);
    }
    
    if (month) {
      conditions.push('MONTH(r.date) = ?');
      params.push(month);
    }
    
    if (date) {
      conditions.push('DATE(r.date) = ?');
      params.push(date);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY r.date DESC';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching filtered records:', error);
    res.status(500).json({ 
      error: 'Error fetching records',
      details: error.message 
    });
  }
});

// Get years with records for filter dropdown
router.get('/record-years', async (req, res) => {
  try {
    const pool = mysql.createPool(dbConfig);
    const [rows] = await pool.query(
      'SELECT DISTINCT YEAR(date) as year FROM record ORDER BY year DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching record years:', error);
    res.status(500).json({ 
      error: 'Error fetching years',
      details: error.message 
    });
  }
});

// Delete record by ID
router.delete('/delete-record/:id', async (req, res) => {
  try {
    const pool = mysql.createPool(dbConfig);
    const [result] = await pool.query(
      'DELETE FROM record WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Record not found',
        details: 'No record exists with the specified ID' 
      });
    }
    
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ 
      error: 'Error deleting record',
      details: error.message 
    });
  }
});

// Get single record by ID (for editing)
router.get('/get-record/:id', async (req, res) => {
  try {
    const pool = mysql.createPool(dbConfig);
    const [rows] = await pool.query(
      'SELECT * FROM record WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        error: 'Record not found',
        details: 'No record exists with the specified ID' 
      });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching record:', error);
    res.status(500).json({ 
      error: 'Error fetching record',
      details: error.message 
    });
  }
});

// Update record
router.put('/update-record/:id', async (req, res) => {
  const { date, surgery, vaccination, other } = req.body;
  
  try {
    const pool = mysql.createPool(dbConfig);
    const [result] = await pool.query(
      `UPDATE record 
       SET date = ?, surgery = ?, vaccination = ?, other = ?
       WHERE id = ?`,
      [date, surgery, vaccination, other, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Record not found',
        details: 'No record exists with the specified ID' 
      });
    }
    
    res.json({ success: true, message: 'Record updated successfully' });
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({ 
      error: 'Error updating record',
      details: error.message 
    });
  }
});

// Get full record details with owner and pet info
router.get('/full-record/:id', async (req, res) => {
  try {
    const pool = mysql.createPool(dbConfig);
    const [rows] = await pool.query(
      `SELECT r.*, p.Pet_name, p.Pet_type, p.Owner_id, o.Owner_name, o.E_mail, o.Phone_number
       FROM record r
       JOIN pet p ON r.Pet_id = p.Pet_id
       JOIN pet_owner o ON p.Owner_id = o.Owner_id
       WHERE r.id = ?`,
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        error: 'Record not found',
        details: 'No record exists with the specified ID' 
      });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching record:', error);
    res.status(500).json({ 
      error: 'Error fetching record',
      details: error.message 
    });
  }
});

// Update record (modified to return full updated record)
router.put('/update-record/:id', async (req, res) => {
  const { date, surgery, vaccination, other } = req.body;
  
  try {
    const pool = mysql.createPool(dbConfig);
    
    // First update the record
    await pool.query(
      `UPDATE record 
       SET date = ?, surgery = ?, vaccination = ?, other = ?
       WHERE id = ?`,
      [date, surgery, vaccination, other, req.params.id]
    );
    
    // Then get the full updated record with joins
    const [updatedRecord] = await pool.query(
      `SELECT r.*, p.Pet_name, p.Pet_type, o.Owner_name, o.E_mail
       FROM record r
       JOIN pet p ON r.Pet_id = p.Pet_id
       JOIN pet_owner o ON p.Owner_id = o.Owner_id
       WHERE r.id = ?`,
      [req.params.id]
    );
    
    if (updatedRecord.length === 0) {
      return res.status(404).json({ 
        error: 'Record not found',
        details: 'No record exists with the specified ID' 
      });
    }
    
    res.json({ success: true, record: updatedRecord[0] });
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({ 
      error: 'Error updating record',
      details: error.message 
    });
  }
});


// Get all owners for dropdown
router.get('/all-owners', async (req, res) => {
  try {
    const pool = mysql.createPool(dbConfig);
    const [rows] = await pool.query(
      'SELECT Owner_id, Owner_name FROM pet_owner ORDER BY Owner_name'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching owners:', error);
    res.status(500).json({ 
      error: 'Error fetching owners',
      details: error.message 
    });
  }
});

// Create new record
// Create new record
router.post('/records', async (req, res) => {
  const { ownerId, petId, date, surgery, vaccination, other } = req.body;
  
  // Validate required fields
  if (!petId || !ownerId || !date) {
    return res.status(400).json({ 
      error: 'Validation error',
      details: 'Pet ID, Owner ID and date are required' 
    });
  }

  try {
    const pool = mysql.createPool(dbConfig);
    
    // Verify pet exists and belongs to owner
    const [pet] = await pool.query(
      'SELECT * FROM pet WHERE Pet_id = ? AND Owner_id = ?',
      [petId, ownerId]
    );
    
    if (pet.length === 0) {
      return res.status(400).json({
        error: 'Invalid pet',
        details: 'The specified pet does not exist or does not belong to this owner'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO record 
       (Pet_id, Owner_id, date, surgery, vaccination, other, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        petId,
        ownerId,
        date, 
        surgery || null, 
        vaccination || null, 
        other || null
      ]
    );
    
    // Get the full created record with joins
    const [newRecord] = await pool.query(
      `SELECT r.*, p.Pet_name, p.Pet_type, o.Owner_name, o.E_mail
       FROM record r
       JOIN pet p ON r.Pet_id = p.Pet_id
       JOIN pet_owner o ON r.Owner_id = o.Owner_id
       WHERE r.id = ?`,
      [result.insertId]
    );
    
    res.status(201).json({ 
      success: true,
      record: newRecord[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Database operation failed',
      details: error.message,
      sqlMessage: error.sqlMessage
    });
  }
});


// In the /all-owners endpoint
router.get('/all-owners', async (req, res) => {
  try {
    const pool = mysql.createPool(dbConfig);
    const [rows] = await pool.query(
      'SELECT Owner_id, Owner_name, Owner_address FROM pet_owner ORDER BY Owner_name'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching owners:', error);
    res.status(500).json({ 
      error: 'Error fetching owners',
      details: error.message 
    });
  }
});

// In the /search-owners endpoint (already includes address since it selects *)
router.post('/search-owners', async (req, res) => {
  const { searchTerm } = req.body;
  
  if (!searchTerm || searchTerm.trim() === '') {
    return res.status(400).json({ 
      error: 'Search term is required',
      details: 'Please enter a name to search for owners' 
    });
  }
  
  try {
    const pool = mysql.createPool(dbConfig);
    const [rows] = await pool.query(
      'SELECT * FROM pet_owner WHERE Owner_name LIKE ?',
      [`%${searchTerm}%`]
    );
    
    res.json({
      success: true,
      data: rows,
      message: rows.length === 0 ? 'No matching owners found' : ''
    });
  } catch (error) {
    console.error('Error searching owners:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error searching owners',
      details: error.message 
    });
  }
});

module.exports = router;