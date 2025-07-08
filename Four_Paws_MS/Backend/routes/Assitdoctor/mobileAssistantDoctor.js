const express = require('express');
const router = express.Router();
const db = require('../../db');

// Middleware
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Request logging middleware
router.use((req, res, next) => {
  console.log(`Mobile Service API - ${req.method} ${req.originalUrl}`);
  next();
});

// Get today's mobile service requests
router.get('/today', async (req, res) => {
  try {
    const [services] = await db.promise().query(`
      SELECT 
        ms.*, 
        p.Pet_name,
        po.Owner_name,
        po.Owner_address,
        po.Phone_number,
        po.E_mail
      FROM mobile_service ms
      LEFT JOIN pet p ON ms.pet_id = p.Pet_id
      LEFT JOIN pet_owner po ON ms.petOwnerID = po.Owner_id
      WHERE DATE(ms.created_at) = CURDATE()
      ORDER BY ms.created_at ASC
    `);

    res.json({
      success: true,
      services
    });
  } catch (err) {
    console.error('Mobile Service API - Database error:', err);
    res.status(500).json({
      success: false,
      error: 'Error retrieving today\'s mobile service requests'
    });
  }
});

// Get upcoming mobile service requests (after today)
router.get('/upcoming', async (req, res) => {
  try {
    const [services] = await db.promise().query(`
      SELECT 
        ms.*, 
        p.Pet_name,
        po.Owner_name,
        po.Phone_number,
        po.E_mail
      FROM mobile_service ms
      LEFT JOIN pet p ON ms.pet_id = p.Pet_id
      LEFT JOIN pet_owner po ON ms.petOwnerID = po.Owner_id
      WHERE DATE(ms.created_at)
      ORDER BY ms.created_at ASC
      LIMIT 50
    `);

    res.json({
      success: true,
      services
    });
  } catch (err) {
    console.error('Mobile Service API - Database error:', err);
    res.status(500).json({
      success: false,
      error: 'Error retrieving upcoming mobile services'
    });
  }
});

// Update mobile service status
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, special_notes } = req.body;

  try {
    await db.promise().query(
      'UPDATE mobile_service SET status = ?, special_notes = ? WHERE id = ?',
      [status, special_notes, id]
    );

    res.json({
      success: true,
      message: 'Mobile service updated successfully'
    });
  } catch (error) {
    console.error('Mobile Service API - Update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update mobile service',
      details: error.message
    });
  }
});

router.get('/all', async (req, res) => {
  console.log("Fetching all mobile services");
  try {
    const [services] = await db.promise().query(`
      SELECT * FROM mobile_service
    `);

    res.json({
      success: true,
      services
    });
  } catch (err) {
    console.error('Mobile Service API - Database error:', err); 
    res.status(500).json({
      success: false,
      error: 'Error retrieving all mobile services',
      details: err.message
    });
  }
});

// Get single mobile service details
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [services] = await db.promise().query(`
      SELECT 
        ms.*, 
        p.Pet_name,
        po.Owner_name,
        po.Phone_number,
        po.E_mail
      FROM mobile_service ms
      LEFT JOIN pet p ON ms.pet_id = p.Pet_id
      LEFT JOIN pet_owner po ON ms.petOwnerID = po.Owner_id
      WHERE ms.id = ?
    `, [id]);

    if (services.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Mobile service not found'
      });
    }

    res.json({
      success: true,
      service: services[0]
    });
  } catch (error) {
    console.error('Mobile Service API - Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Error retrieving mobile service details',
      details: error.message
    });
  }
});




router.put('/appointment/:id', async (req, res) => {
  const { status, special_notes, date, time } = req.body;

  try {
    const { id } = req.params;

    // Build the update query and values array dynamically
    let updateFields = [];
    let values = [];

    if (status !== undefined) {
      updateFields.push('status = ?');
      values.push(status);
    }
    if (special_notes !== undefined) {
      updateFields.push('special_notes = ?');
      values.push(special_notes);
    }
    if (date !== undefined) {
      updateFields.push('date = ?');
      values.push(date);
    }
    if (time !== undefined) {
      updateFields.push('time = ?');
      values.push(time);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    values.push(id); // Add the ID to the end

    const updateQuery = `
      UPDATE mobile_service
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    const [result] = await db.promise().query(updateQuery, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Mobile service not found'
      });
    }

    res.json({
      success: true,
      message: 'Mobile service updated successfully'
    });

  } catch (error) {
    console.error('Error updating mobile service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update mobile service',
      details: error.message
    });
  }

});






module.exports = router;
