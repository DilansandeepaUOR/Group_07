const express = require('express');
const router = express.Router();
const db = require('../../db');

// Helper function to promisify db.query
const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Test database connection
router.get('/test-connection', async (req, res) => {
  try {
    const results = await query('SELECT 1 + 1 AS solution');
    res.json({ 
      success: true,
      solution: results[0].solution
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
    const results = await query(
      'SELECT * FROM pet_owner WHERE Owner_name LIKE ?',
      [`%${searchTerm}%`]
    );
    
    if (results.length === 0) {
      return res.json({ 
        success: false,
        message: 'No matching owners found',
        data: []
      });
    }
    
    res.json({
      success: true,
      data: results
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
  const { searchTerm } = req.body;
  
  if (!searchTerm || searchTerm.trim() === '') {
    return res.status(400).json({ 
      success: false,
      error: 'Search term is required'
    });
  }
  
  try {
    const results = await query(
      'SELECT Owner_id, Owner_name, Owner_address, Phone_number, E_mail FROM pet_owner WHERE Owner_name LIKE ?',
      [`%${searchTerm}%`]
    );
    
    if (results.length === 0) {
      return res.json({ 
        success: true,
        data: [],
        message: 'No matching owners found'
      });
    }
    
    res.json({
      success: true,
      data: results
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
    const results = await query(
      'SELECT * FROM pet WHERE Owner_id = ?',
      [ownerId]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ 
        error: 'No pets found',
        details: 'This owner has no registered pets' 
      });
    }
    
    res.json(results);
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
    const results = await query(
      'SELECT * FROM record WHERE Pet_id = ? ORDER BY date DESC',
      [petId]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ 
        error: 'No records found',
        details: 'No medical records found for this pet' 
      });
    }
    
    res.json(results);
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
    const queryStr = `
      SELECT 
        r.id, 
        r.date, 
        r.weight,
        r.surgery, 
        r.other,
        r.vaccination_id,
        p.Pet_id, 
        p.Pet_name, 
        p.Pet_type, 
        p.Pet_dob,
        o.Owner_id, 
        o.Owner_name, 
        o.E_mail, 
        o.Phone_number,
        v.vaccine_type, 
        v.vaccine_name, 
        v.other_vaccine, 
        v.vaccination_date, 
        v.notes AS vaccination_notes
      FROM record r
      JOIN pet p ON r.Pet_id = p.Pet_id
      JOIN pet_owner o ON p.Owner_id = o.Owner_id
      LEFT JOIN vaccination v ON r.vaccination_id = v.vaccination_id
      ORDER BY r.date DESC
    `;
    
    const results = await query(queryStr);
    res.json(results);
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
    let queryStr = `
      SELECT 
        r.id, 
        r.date, 
        r.surgery, 
        r.other,
        r.vaccination_id,
        p.Pet_id, 
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
      LEFT JOIN vaccination v ON r.vaccination_id = v.vaccination_id
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
      queryStr += ' WHERE ' + conditions.join(' AND ');
    }
    
    queryStr += ' ORDER BY r.date DESC';
    
    const results = await query(queryStr, params);
    res.json(results);
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
    const results = await query(
      'SELECT DISTINCT YEAR(date) as year FROM record ORDER BY year DESC'
    );
    res.json(results);
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
    const results = await query(
      'DELETE FROM record WHERE id = ?',
      [req.params.id]
    );
    
    if (results.affectedRows === 0) {
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
    const results = await query(
      'SELECT * FROM record WHERE id = ?',
      [req.params.id]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ 
        error: 'Record not found',
        details: 'No record exists with the specified ID' 
      });
    }
    
    res.json(results[0]);
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
    // Get existing record
    const existingRecord = await query(
      `SELECT * FROM record WHERE id = ?`,
      [req.params.id]
    );

    if (existingRecord.length === 0) {
      return res.status(404).json({ 
        error: 'Record not found',
        details: 'No record exists with the specified ID' 
      });
    }

    let vaccinationId = existingRecord[0].vaccination_id || null;

    // Handle vaccination data if provided
    if (vaccineType) {
      const vaccineName = vaccineType === 'core' ? coreVaccine : 
                       vaccineType === 'lifestyle' ? lifestyleVaccine : 
                       otherVaccine;

      if (vaccinationId) {
        // Update existing vaccination record
        await query(
          `UPDATE vaccination 
           SET vaccine_type = ?, vaccine_name = ?, other_vaccine = ?, vaccination_date = ?, notes = ?
           WHERE vaccination_id = ?`,
          [vaccineType, vaccineName, otherVaccine || null, date, other || null, vaccinationId]
        );
      } else {
        // Create new vaccination record
        const vaccinationResult = await query(
          `INSERT INTO vaccination 
           (pet_id, vaccine_type, vaccine_name, other_vaccine, vaccination_date, notes) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [petId, vaccineType, vaccineName, otherVaccine || null, date, other || null]
        );
        vaccinationId = vaccinationResult.insertId;
      }
    } else if (vaccinationId) {
      // If no vaccine data provided but record had vaccination, delete it
      await query(
        `DELETE FROM vaccination WHERE vaccination_id = ?`,
        [vaccinationId]
      );
      vaccinationId = null;
    }

    // Update the main record
    await query(
      `UPDATE record 
       SET date = ?, surgery = ?, other = ?, vaccination_id = ?
       WHERE id = ?`,
      [date, surgery || null, other || null, vaccinationId, req.params.id]
    );
    
    res.json({ 
      success: true, 
      message: 'Record updated successfully',
      vaccinationId: vaccinationId
    });
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
router.get('/full-record/:id', async (req, res) => {
  try {
    // Get the basic record information
    const recordRows = await query(
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
      const vaccineRows = await query(
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

// Get all owners for dropdown
router.get('/all-owners', async (req, res) => {
  try {
    const results = await query(
      'SELECT Owner_id, Owner_name, Owner_address FROM pet_owner ORDER BY Owner_name'
    );
    res.json(results);
  } catch (error) {
    console.error('Error fetching owners:', error);
    res.status(500).json({ 
      error: 'Error fetching owners',
      details: error.message 
    });
  }
});

// Create new record with vaccination
router.post('/records', async (req, res) => {
  try {
    let vaccinationId = null;
    
    // Handle vaccination if provided
    if (req.body.vaccineType) {
      const vaccResult = await query(
        `INSERT INTO vaccination 
         (pet_id, vaccine_type, vaccine_name, other_vaccine, vaccination_date, notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          req.body.petId,
          req.body.vaccineType,
          req.body.vaccineType === 'core' ? req.body.coreVaccine : req.body.lifestyleVaccine,
          req.body.otherVaccine || null,
          req.body.date,
          req.body.other || null
        ]
      );
      vaccinationId = vaccResult.insertId;
    }

    // Create the record
    const recordResult = await query(
      `INSERT INTO record 
       (Pet_id, Owner_id, date, weight, surgery, other, vaccination_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.body.petId,
        req.body.ownerId,
        req.body.date,
        req.body.weight || null,
        req.body.surgery || null,
        req.body.other || null,
        vaccinationId
      ]
    );

    res.status(201).json({ 
      success: true,
      recordId: recordResult.insertId,
      vaccinationId
    });
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error creating record',
      details: error.message
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
    const records = await query(
      'SELECT * FROM record WHERE Pet_id = ? ORDER BY date DESC',
      [petId]
    );

    // Then get all vaccinations for the pet
    const vaccinations = await query(
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



router.get('/sent-notifications', async (req, res) => {
  const { pet_id, owner_id, status } = req.query;
  let queryStr = 'SELECT n.*, p.Pet_name, o.Owner_name FROM sent_notifications n ' +
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
    queryStr += ' WHERE ' + conditions.join(' AND ');
  }
  
  queryStr += ' ORDER BY n.sent_date DESC';
  
  try {
    const results = await query(queryStr, params);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vaccination by ID
router.get('/vaccination/:id', async (req, res) => {
  try {
    const results = await query(
      'SELECT * FROM vaccination WHERE vaccination_id = ?',
      [req.params.id]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ 
        error: 'Vaccination not found',
        details: 'No vaccination exists with the specified ID' 
      });
    }
    
    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching vaccination:', error);
    res.status(500).json({ 
      error: 'Error fetching vaccination',
      details: error.message 
    });
  }
});


// POST /api/deworm - Create a new deworming record
router.post('/deworm', async (req, res) => {
  // Destructure the expected fields from the request body
  const { pet_id, owner_id, date, weight, wormer } = req.body;

  // --- Basic Validation ---
  // Check if all required fields are provided
  if (!pet_id || !owner_id || !date || !weight || !wormer) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields. Please provide pet_id, owner_id, date, weight, and wormer.'
    });
  }

  try {
    // The SQL query to insert data into the deworm table
    const sqlQuery = `
      INSERT INTO deworm (pet_id, owner_id, date, weight, wormer)
      VALUES (?, ?, ?, ?, ?)
    `;

    // Execute the query with the provided data
    const result = await query(sqlQuery, [pet_id, owner_id, date, weight, wormer]);

    // Send a success response
    res.status(201).json({
      success: true,
      message: 'Deworming record created successfully.',
      dewormId: result.insertId // The ID of the new row
    });

  } catch (error) {
    console.error('Error creating deworming record:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create deworming record.',
      details: error.message
    });
  }
});


// GET all deworming records with pet and owner names
router.get('/deworm-records', async (req, res) => {
  try {
    const queryStr = `
      SELECT 
        d.deworm_id,
        d.date,
        d.weight,
        d.wormer,
        p.Pet_name,
        o.Owner_name
      FROM deworm d
      JOIN pet p ON d.pet_id = p.Pet_id
      JOIN pet_owner o ON d.owner_id = o.Owner_id
      ORDER BY d.date DESC
    `;
    const records = await query(queryStr);
    res.json(records);
  } catch (error) {
    console.error('Error fetching deworming records:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

// GET a single deworming record by ID
router.get('/deworm-records/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const queryStr = `
            SELECT 
                d.deworm_id,
                d.date,
                d.weight,
                d.wormer,
                p.Pet_name,
                o.Owner_name
            FROM deworm d
            JOIN pet p ON d.pet_id = p.Pet_id
            JOIN pet_owner o ON d.owner_id = o.Owner_id
            WHERE d.deworm_id = ?
        `;
        const results = await query(queryStr, [id]);
        if (results.length > 0) {
            // Format date to YYYY-MM-DD for the input[type="date"]
            const record = results[0];
            record.date = new Date(record.date).toISOString().split('T')[0];
            res.json(record);
        } else {
            res.status(404).json({ message: 'Record not found' });
        }
    } catch (error) {
        console.error('Error fetching deworming record:', error);
        res.status(500).json({ error: 'Database error' });
    }
});


// UPDATE a deworming record
router.put('/deworm-records/:id', async (req, res) => {
  const { id } = req.params;
  const { date, weight, wormer } = req.body;

  if (!date || !weight || !wormer) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const queryStr = `
      UPDATE deworm 
      SET date = ?, weight = ?, wormer = ?
      WHERE deworm_id = ?
    `;
    await query(queryStr, [date, weight, wormer, id]);
    res.json({ message: 'Record updated successfully' });
  } catch (error) {
    console.error('Error updating deworming record:', error);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// DELETE a deworming record
router.delete('/deworm-records/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const queryStr = 'DELETE FROM deworm WHERE deworm_id = ?';
    await query(queryStr, [id]);
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting deworming record:', error);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});


// GET Dog Deworming Templates (Static Route)
router.get("/dog-templates", (req, res) => {
  const q = `SELECT * FROM dog_deworm_templates ORDER BY id ASC`;
  db.query(q, (err, data) => {
    if (err) {
      console.error("Error fetching from dog_deworm_templates:", err);
      return res.status(500).json({ error: "Database query failed." });
    }
    res.json(data);
  });
});

// GET Cat Deworming Templates (Static Route)
router.get("/cat-templates", (req, res) => {
  const q = `SELECT * FROM cat_deworm_templates ORDER BY id ASC`;
  db.query(q, (err, data) => {
    if (err) {
      console.error("Error fetching from cat_deworm_templates:", err);
      return res.status(500).json({ error: "Database query failed." });
    }
    res.json(data);
  });
});

// --- PUT ROUTES ---

// UPDATE Dog Deworming Template (Static Route)
router.put("/dog-templates/:id", (req, res) => {
  const { id } = req.params;
  const { deworm_name, age_condition } = req.body;

  if (!deworm_name || !age_condition) {
    return res.status(400).json({ error: "Both fields are required." });
  }

  const q = `UPDATE dog_deworm_templates SET deworm_name = ?, age_condition = ? WHERE id = ?`;
  db.query(q, [deworm_name, age_condition, id], (err, result) => {
    if (err) {
      console.error("Error updating dog_deworm_templates:", err);
      return res.status(500).json({ error: "Failed to update the template." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Template not found" });
    }
    res.json({ message: "Template updated successfully" });
  });
});

// UPDATE Cat Deworming Template (Static Route)
router.put("/cat-templates/:id", (req, res) => {
  const { id } = req.params;
  const { deworm_name, age_condition } = req.body;

  if (!deworm_name || !age_condition) {
    return res.status(400).json({ error: "Both fields are required." });
  }

  const q = `UPDATE cat_deworm_templates SET deworm_name = ?, age_condition = ? WHERE id = ?`;
  db.query(q, [deworm_name, age_condition, id], (err, result) => {
    if (err) {
      console.error("Error updating cat_deworm_templates:", err);
      return res.status(500).json({ error: "Failed to update the template." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Template not found" });
    }
    res.json({ message: "Template updated successfully" });
  });
});


module.exports = router;