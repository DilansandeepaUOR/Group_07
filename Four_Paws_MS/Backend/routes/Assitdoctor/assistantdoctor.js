const express = require('express');
const router = express.Router();
const db = require('../../db');
const e = require('express');
const calculateAge=require('../Utils/ageCalculator');
const { formatDate, formatTime} = require('../Utils/dateFormatter');
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
      // Get counts (unchanged)
      const [counts] = await db.promise().query(`
          SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed,
            SUM(CASE WHEN status = 'Scheduled' THEN 1 ELSE 0 END) AS scheduled,
            SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled
          FROM appointments
          WHERE DATE(appointment_date) = CURDATE()
      `);
      
      // Modified appointments query with LEFT JOIN and debugging info
      const [appointments] = await db.promise().query(`
          SELECT 
    a.*, 
    p.Pet_name,
    po.Owner_name,
    p.Pet_id as pet_table_id,
    po.Owner_address,
    po.Phone_number,
    po.E_mail,
    po.Owner_id as owner_table_id
FROM appointments a
LEFT JOIN pet p ON a.pet_type = p.Pet_id
LEFT JOIN pet_owner po ON a.owner_id = po.Owner_id
WHERE DATE(a.appointment_date) = CURDATE()
      `);
      
      console.log('Fetched appointments:', appointments); // Debug log
      
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
            SELECT 
                  a.*, 
                  p.Pet_name,
                  po.Owner_name,
                  p.Pet_id as pet_table_id,
                  po.Owner_address,
                  po.Phone_number,
                  po.E_mail,
                  po.Owner_id as owner_table_id
              FROM appointments a
              LEFT JOIN pet p ON a.pet_type = p.Pet_id
              LEFT JOIN pet_owner po ON a.owner_id = po.Owner_id
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

router.get('/petinfo/:id', async (req,res)=>{
  const {id}=req.params;

  try{
    const [row]= await db.promise().query('SELECT * FROM pet WHERE Pet_id=?;',[id]);
    const pet=row[0];
    pet.Pet_dob=formatDate(pet.Pet_dob);
    pet.Pet_age=calculateAge(pet.Pet_dob);

    res.status(200).json({
      pet
    });

  }catch(err){
    res.status(404).json({
      success:false,
      message:'No pet found'
    });
  }
})


module.exports = router;
