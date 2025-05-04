const express = require('express');
const router = express.Router();
const db = require('../../db');

// Test database connection
router.get('/test-connection', async (req, res) => {
  try {
    const [rows] = await db.promise().query('SELECT 1 + 1 AS solution');
    res.json({ 
      success: true,
      solution: rows[0].solution
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search owners by name
router.get('/search-owners', async (req, res) => {
  const { searchTerm } = req.query;
  
  
  if (!searchTerm || searchTerm.trim() === '') {
    return res.status(400).json({ 
      success: false,
      error: 'Search term is required',
      details: 'Please enter a name to search for owners' 
    });
  }
  
  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM pet_owner WHERE Owner_name LIKE ?',
      [`%${searchTerm}%`]
    );
    
    console.log('Received search term:', searchTerm);
    console.log('Query result:', rows);
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



// Get owner by ID
router.post('/search-owners-new', async (req, res) => {
  const { searchTerm } = req.body; // Changed from req.query to req.body
  
  if (!searchTerm || searchTerm.trim() === '') {
    return res.status(400).json({ 
      success: false,
      error: 'Search term is required'
    });
  }
  
  try {
    const [rows] = await db.promise().query(
      'SELECT Owner_id, Owner_name, Owner_address, Phone_number, E_mail FROM pet_owner WHERE Owner_name LIKE ?',
      [`%${searchTerm}%`]
    );
    
    if (rows.length === 0) {
      return res.json({ 
        success: true, // Still success even if no results
        data: [],
        message: 'No matching owners found'
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
      error: 'Error searching owners'
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
    const [rows] = await db.promise().query(
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
    const [rows] = await db.promise().query(
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
router.get('/all-records', async (req, res) => {
  try {
    const query = `
      SELECT 
        r.*, 
        p.Pet_name, 
        p.Pet_type, 
        o.Owner_name, 
        o.E_mail,
        v.vaccine_type,
        v.vaccine_name,
        v.other_vaccine,
        v.vaccination_date,
        v.notes AS vaccination_notes
      FROM record r
      JOIN pet p ON r.Pet_id = p.Pet_id
      JOIN pet_owner o ON p.Owner_id = o.Owner_id
      LEFT JOIN vaccination v ON r.Pet_id = v.pet_id AND r.date = v.vaccination_date
      ORDER BY r.date DESC
    `;
    
    const [rows] = await db.promise().query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching all records:', error);
    res.status(500).json({ 
      error: 'Error fetching records',
      details: error.message 
    });
  }
});

// Endpoint for filtered searches
router.post('/filtered-records', async (req, res) => {
  const { searchTerm, year, month, date } = req.body;
  
  try {
    let query = `
      SELECT 
        r.*, 
        p.Pet_name, 
        p.Pet_type, 
        o.Owner_name, 
        o.E_mail,
        v.vaccine_type,
        v.vaccine_name,
        v.other_vaccine,
        v.vaccination_date,
        v.notes AS vaccination_notes
      FROM record r
      JOIN pet p ON r.Pet_id = p.Pet_id
      JOIN pet_owner o ON p.Owner_id = o.Owner_id
      LEFT JOIN vaccination v ON r.Pet_id = v.pet_id AND r.date = v.vaccination_date
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
    
    const [rows] = await db.promise().query(query, params);
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
    const [rows] = await db.promise().query(
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
    const [result] = await db.promise().query(
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
    const [rows] = await db.promise().query(
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
  const { date, surgery, other, vaccineType, coreVaccine, lifestyleVaccine, otherVaccine, petId } = req.body;
  
  try {
    // Get a connection from the pool
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1. First get the existing record to check for existing vaccination
      const [existingRecord] = await connection.query(
        `SELECT * FROM record WHERE id = ?`,
        [req.params.id]
      );

      if (existingRecord.length === 0) {
        await connection.rollback();
        return res.status(404).json({ 
          error: 'Record not found',
          details: 'No record exists with the specified ID' 
        });
      }

      let vaccinationId = existingRecord[0].vaccination_id || null;

      // 2. Handle vaccination data if provided
      if (vaccineType) {
        const vaccineName = vaccineType === 'core' ? coreVaccine : 
                         vaccineType === 'lifestyle' ? lifestyleVaccine : 
                         otherVaccine;

        if (vaccinationId) {
          // Update existing vaccination record
          await connection.query(
            `UPDATE vaccination 
             SET vaccine_type = ?, vaccine_name = ?, other_vaccine = ?, vaccination_date = ?, notes = ?
             WHERE vaccination_id = ?`,
            [vaccineType, vaccineName, otherVaccine || null, date, other || null, vaccinationId]
          );
        } else {
          // Create new vaccination record
          const [vaccinationResult] = await connection.query(
            `INSERT INTO vaccination 
             (pet_id, vaccine_type, vaccine_name, other_vaccine, vaccination_date, notes) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [petId, vaccineType, vaccineName, otherVaccine || null, date, other || null]
          );
          vaccinationId = vaccinationResult.insertId;
        }
      } else if (vaccinationId) {
        // If no vaccine data provided but record had vaccination, delete it
        await connection.query(
          `DELETE FROM vaccination WHERE vaccination_id = ?`,
          [vaccinationId]
        );
        vaccinationId = null;
      }

      // 3. Update the main record
      const [result] = await connection.query(
        `UPDATE record 
         SET date = ?, surgery = ?, other = ?, vaccination_id = ?
         WHERE id = ?`,
        [date, surgery || null, other || null, vaccinationId, req.params.id]
      );
      
      await connection.commit();
      res.json({ 
        success: true, 
        message: 'Record updated successfully',
        vaccinationId: vaccinationId
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({ 
      error: 'Error updating record',
      details: error.message,
      sqlMessage: error.sqlMessage
    });
  }
});

// Get full record details with owner and pet info
// Update the full-record endpoint
router.get('/full-record/:id', async (req, res) => {
  try {
    // Get the basic record information
    const [recordRows] = await db.promise().query(
      `SELECT r.id, r.date, r.surgery, r.other, r.vaccination_id,
              p.Pet_id, p.Pet_name, p.Pet_type, p.Pet_dob,
              o.Owner_id, o.Owner_name, o.E_mail, o.Phone_number
       FROM record r
       JOIN pet p ON r.Pet_id = p.Pet_id
       JOIN pet_owner o ON p.Owner_id = o.Owner_id
       WHERE r.id = ?`,
      [req.params.id]
    );
    
    if (recordRows.length === 0) {
      return res.status(404).json({ 
        error: 'Record not found',
        details: 'No record exists with the specified ID' 
      });
    }
    
    const record = recordRows[0];
    
    // Get vaccination data if exists
    if (record.vaccination_id) {
      const [vaccineRows] = await db.promise().query(
        'SELECT * FROM vaccination WHERE vaccination_id = ?',
        [record.vaccination_id]
      );
      
      if (vaccineRows.length > 0) {
        record.vaccine_type = vaccineRows[0].vaccine_type;
        record.vaccine_name = vaccineRows[0].vaccine_name;
        record.other_vaccine = vaccineRows[0].other_vaccine;
        record.vaccination_notes = vaccineRows[0].notes;
      }
    }
    
    res.json(record);
  } catch (error) {
    console.error('Error fetching record:', error);
    res.status(500).json({ 
      error: 'Error fetching record',
      details: error.message 
    });
  }
});

// Update the update-record endpoint
router.put('/update-record/:id', async (req, res) => {
  const { date, surgery, other, vaccineType, coreVaccine, lifestyleVaccine, otherVaccine, petId } = req.body;
  
  try {
    // Start transaction using the pool directly
    await db.promise().query('START TRANSACTION');

    try {
      // 1. First get the existing record to check for existing vaccination
      const [existingRecord] = await db.promise().query(
        `SELECT * FROM record WHERE id = ?`,
        [req.params.id]
      );

      if (existingRecord.length === 0) {
        await db.promise().query('ROLLBACK');
        return res.status(404).json({ 
          error: 'Record not found',
          details: 'No record exists with the specified ID' 
        });
      }

      let vaccinationId = existingRecord[0].vaccination_id || null;

      // 2. Handle vaccination data if provided
      if (vaccineType) {
        const vaccineName = vaccineType === 'core' ? coreVaccine : 
                         vaccineType === 'lifestyle' ? lifestyleVaccine : 
                         otherVaccine;

        if (vaccinationId) {
          // Update existing vaccination record
          await db.promise().query(
            `UPDATE vaccination 
             SET vaccine_type = ?, vaccine_name = ?, other_vaccine = ?, vaccination_date = ?, notes = ?
             WHERE vaccination_id = ?`,
            [vaccineType, vaccineName, otherVaccine || null, date, other || null, vaccinationId]
          );
        } else {
          // Create new vaccination record
          const [vaccinationResult] = await db.promise().query(
            `INSERT INTO vaccination 
             (pet_id, vaccine_type, vaccine_name, other_vaccine, vaccination_date, notes) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [petId, vaccineType, vaccineName, otherVaccine || null, date, other || null]
          );
          vaccinationId = vaccinationResult.insertId;
        }
      } else if (vaccinationId) {
        // If no vaccine data provided but record had vaccination, delete it
        await db.promise().query(
          `DELETE FROM vaccination WHERE vaccination_id = ?`,
          [vaccinationId]
        );
        vaccinationId = null;
      }

      // 3. Update the main record
      const [result] = await db.promise().query(
        `UPDATE record 
         SET date = ?, surgery = ?, other = ?, vaccination_id = ?
         WHERE id = ?`,
        [date, surgery || null, other || null, vaccinationId, req.params.id]
      );
      
      await db.promise().query('COMMIT');
      res.json({ 
        success: true, 
        message: 'Record updated successfully',
        vaccinationId: vaccinationId
      });
    } catch (error) {
      await db.promise().query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({ 
      error: 'Error updating record',
      details: error.message,
      sqlMessage: error.sqlMessage
    });
  }
});

// Get all owners for dropdown
router.get('/all-owners', async (req, res) => {
  try {
    const [rows] = await db.promise().query(
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

// Create new record
// Modify the /records endpoint to properly link vaccination records
router.post('/records', async (req, res) => {
  const { ownerId, petId, date, surgery, vaccineType, coreVaccine, lifestyleVaccine, otherVaccine, other } = req.body;
  
  if (!petId || !ownerId || !date) {
    return res.status(400).json({ 
      error: 'Validation error',
      details: 'Pet ID, Owner ID and date are required' 
    });
  }

  const connection = await db.promise();
  
  try {
    await connection.beginTransaction();

    // Verify pet exists and belongs to owner
    const [pet] = await connection.query(
      'SELECT * FROM pet WHERE Pet_id = ? AND Owner_id = ?',
      [petId, ownerId]
    );
    
    if (pet.length === 0) {
      return res.status(400).json({
        error: 'Invalid pet',
        details: 'The specified pet does not exist or does not belong to this owner'
      });
    }

    // Insert vaccination first if provided
    let vaccinationId = null;
    if (vaccineType) {
      const vaccineName = vaccineType === 'core' ? coreVaccine : lifestyleVaccine;
      const [vaccinationResult] = await connection.query(
        `INSERT INTO vaccination 
         (pet_id, vaccine_type, vaccine_name, other_vaccine, vaccination_date, notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          petId,
          vaccineType,
          vaccineName || null,
          otherVaccine || null,
          date,
          other || null
        ]
      );
      vaccinationId = vaccinationResult.insertId;
    }

    // Insert medical record with vaccination_id reference
    const [recordResult] = await connection.query(
      `INSERT INTO record 
       (Pet_id, Owner_id, date, surgery, other, vaccination_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [petId, ownerId, date, surgery || null, other || null, vaccinationId]
    );

    await connection.commit();

    res.status(201).json({ 
      success: true,
      recordId: recordResult.insertId,
      vaccinationId: vaccinationId,
      message: 'Record created successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Database operation failed',
      details: error.message,
      sqlMessage: error.sqlMessage
    });
  }
});

// Get records with vaccination data by pet ID
router.get('/get-records-with-vaccination', async (req, res) => {
  const { petId } = req.query;
  
  if (!petId) {
    return res.status(400).json({ 
      error: 'Pet ID is required',
      details: 'Please select a pet first' 
    });
  }

  try {
    // First get all records for the pet
    const [records] = await db.promise().query(
      'SELECT * FROM record WHERE Pet_id = ? ORDER BY date DESC',
      [petId]
    );

    // Then get all vaccinations for the pet
    const [vaccinations] = await db.promise().query(
      'SELECT * FROM vaccination WHERE pet_id = ? ORDER BY vaccination_date DESC',
      [petId]
    );

    // Combine the data
    const combinedData = records.map(record => {
      // Find matching vaccination if vaccination_id exists
      const vaccination = record.vaccination_id 
        ? vaccinations.find(v => v.vaccination_id === record.vaccination_id)
        : null;

      return {
        ...record,
        vaccine_type: vaccination?.vaccine_type || null,
        vaccine_name: vaccination?.vaccine_name || null,
        other_vaccine: vaccination?.other_vaccine || null,
        vaccination_date: vaccination?.vaccination_date || null,
        vaccination_notes: vaccination?.notes || null
      };
    });

    res.json(combinedData);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ 
      error: 'Error fetching records',
      details: error.message 
    });
  }
});


// Notification routes
router.get('/notification-templates', async (req, res) => {
  try {
    const [templates] = await db.promise().query('SELECT * FROM notification_templates');
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/notification-templates/:id', async (req, res) => {
  const { subject, message_body, days_before, is_active } = req.body;
  
  try {
    await db.promise().query(
      'UPDATE notification_templates SET subject = ?, message_body = ?, days_before = ?, is_active = ? WHERE template_id = ?',
      [subject, message_body, days_before, is_active, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sent-notifications', async (req, res) => {
  const { pet_id, owner_id, status } = req.query;
  let query = 'SELECT n.*, p.Pet_name, o.Owner_name FROM sent_notifications n ' +
              'JOIN pet p ON n.pet_id = p.Pet_id ' +
              'JOIN pet_owner o ON n.owner_id = o.Owner_id ';
  const conditions = [];
  const params = [];
  
  if (pet_id) {
    conditions.push('n.pet_id = ?');
    params.push(pet_id);
  }
  
  if (owner_id) {
    conditions.push('n.owner_id = ?');
    params.push(owner_id);
  }
  
  if (status) {
    conditions.push('n.status = ?');
    params.push(status);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY n.sent_date DESC';
  
  try {
    const [notifications] = await db.promise().query(query, params);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to manually trigger notification check (for testing)
router.post('/check-notifications', async (req, res) => {
  try {
    await notificationService.dailyNotificationCheck();
    res.json({ success: true, message: 'Notification check completed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Add this new route to handle vaccination data
router.get('/vaccination/:id', async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM vaccination WHERE vaccination_id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        error: 'Vaccination not found',
        details: 'No vaccination exists with the specified ID' 
      });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching vaccination:', error);
    res.status(500).json({ 
      error: 'Error fetching vaccination',
      details: error.message 
    });
  }
});

// Update the update-record endpoint to handle vaccination data
router.put('/update-record/:id', async (req, res) => {
  const { 
    ownerId, 
    petId, 
    date, 
    surgery, 
    vaccineType, 
    coreVaccine, 
    lifestyleVaccine, 
    otherVaccine, 
    other 
  } = req.body;
  
  const connection = await db.promise();
  
  try {
    await connection.beginTransaction();

    // First get the existing record to check for vaccination_id
    const [existingRecord] = await connection.query(
      'SELECT * FROM record WHERE id = ?',
      [req.params.id]
    );
    
    if (existingRecord.length === 0) {
      return res.status(404).json({ 
        error: 'Record not found',
        details: 'No record exists with the specified ID' 
      });
    }

    // Handle vaccination data
    let vaccinationId = existingRecord[0].vaccination_id;
    
    if (vaccineType) {
      const vaccineName = vaccineType === 'core' ? coreVaccine : lifestyleVaccine;
      
      if (vaccinationId) {
        // Update existing vaccination
        await connection.query(
          `UPDATE vaccination SET
           vaccine_type = ?,
           vaccine_name = ?,
           other_vaccine = ?,
           vaccination_date = ?,
           notes = ?
           WHERE vaccination_id = ?`,
          [
            vaccineType,
            vaccineName || null,
            otherVaccine || null,
            date,
            other || null,
            vaccinationId
          ]
        );
      } else {
        // Create new vaccination
        const [vaccinationResult] = await connection.query(
          `INSERT INTO vaccination 
           (pet_id, vaccine_type, vaccine_name, other_vaccine, vaccination_date, notes)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            petId,
            vaccineType,
            vaccineName || null,
            otherVaccine || null,
            date,
            other || null
          ]
        );
        vaccinationId = vaccinationResult.insertId;
      }
    } else if (vaccinationId) {
      // Remove vaccination if it exists but vaccineType is not provided
      await connection.query(
        'DELETE FROM vaccination WHERE vaccination_id = ?',
        [vaccinationId]
      );
      vaccinationId = null;
    }

    // Update the medical record
    const [result] = await connection.query(
      `UPDATE record 
       SET date = ?, surgery = ?, other = ?, vaccination_id = ?
       WHERE id = ?`,
      [date, surgery || null, other || null, vaccinationId, req.params.id]
    );
    
    await connection.commit();

    res.json({ 
      success: true,
      message: 'Record updated successfully',
      recordId: req.params.id,
      vaccinationId: vaccinationId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating record:', error);
    res.status(500).json({ 
      error: 'Error updating record',
      details: error.message,
      sqlMessage: error.sqlMessage
    });
  }
});

module.exports = router;