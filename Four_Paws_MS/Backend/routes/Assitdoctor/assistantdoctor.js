const express = require('express');
const router = express.Router();
const db = require('../../db');
const e = require('express');

// Middleware
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Request logging middleware
router.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

router.get('/', async (req, res) => {
    
    
    try {
        const [counts] = await db.promise().query(`
            SELECT
              COUNT(*) AS total,
              SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed,
              SUM(CASE WHEN status = 'Scheduled' THEN 1 ELSE 0 END) AS scheduled,
              SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled
            FROM appointments
            WHERE DATE(appointment_date) = CURDATE()
          `);
          
          const [appointments] = await db.promise().query(`
            SELECT * FROM appointments
            WHERE DATE(appointment_date) = CURDATE()
          `);
          
          res.json({
            total: counts[0].total,
            completed: counts[0].completed,
            scheduled: counts[0].scheduled,
            cancelled: counts[0].cancelled,
            appointments: appointments
          });
          
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Error retrieving appointment' });
    }

})

router.get('/all', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 30;
        const offset = (page - 1) * limit;

        // Get total counts
        const [counts] = await db.promise().query(`
            SELECT
              COUNT(*) AS total,
              SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed,
              SUM(CASE WHEN status = 'Scheduled' THEN 1 ELSE 0 END) AS scheduled,
              SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled
            FROM appointments
        `);
          
        // Get paginated appointments
        const [appointments] = await db.promise().query(`
            SELECT * FROM appointments
            ORDER BY appointment_date DESC, appointment_time DESC
            LIMIT ? OFFSET ?
        `, [limit, offset]);
          
        res.json({
            total: counts[0].total,
            completed: counts[0].completed,
            scheduled: counts[0].scheduled,
            cancelled: counts[0].cancelled,
            appointments: appointments
        });
          
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Error retrieving appointments' });
    }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.promise().query('UPDATE appointments SET status = ? WHERE appointment_id = ?', [status, id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Database update failed', details: error.message });
  }
});


module.exports = router;
