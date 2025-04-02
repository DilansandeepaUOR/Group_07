const express = require('express');
const router = express.Router();
const db = require('../../db');

// Middleware
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Request logging middleware
router.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});


// MySQL Connection Pool
// const pool = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: '1234',
//   database: 'pharmacy_dashboard',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// Test connection
// pool.getConnection()
//   .then(conn => {
//     console.log('Connected to MySQL');
//     conn.release();
//   })
//   .catch(err => {
//     console.error('Database connection failed:', err);
//   });

// GET all medicines (with optional search and pagination)
router.get('/api/medicines', async (req, res) => {
    try {
      const { search = '', page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
  
      // Get total count
      db.query(
        'SELECT COUNT(*) as total FROM medicines WHERE name LIKE ? OR category LIKE ?',
        [`%${search}%`, `%${search}%`],
        (countErr, countRows) => {
          if (countErr) {
            console.error(countErr);
            return res.status(500).json({ error: 'Failed to count medicines' });
          }
  
          const total = countRows[0].total;
          const totalPages = Math.ceil(total / limit);
  
          // Get paginated data
          db.query(
            `SELECT * FROM medicines 
            WHERE name LIKE ? OR category LIKE ?
            ORDER BY name ASC
            LIMIT ? OFFSET ?`,
            [`%${search}%`, `%${search}%`, parseInt(limit), parseInt(offset)],
            (medErr, medicines) => {
              if (medErr) {
                console.error(medErr);
                return res.status(500).json({ error: 'Failed to fetch medicines' });
              }
  
              res.json({
                data: medicines,
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages,
              });
            }
          );
        }
      );
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch medicines' });
    }
  });

// GET single medicine by ID
router.get('/api/medicines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM medicines WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch medicine' });
  }
});

// POST create new medicine
router.post('/api/medicines', async (req, res) => {
  try {
    const { name, category, price, stock, status } = req.body;
    
    // Basic validation
    if (!name || !category || !price || stock === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await pool.query(
      `INSERT INTO medicines (name, category, price, stock, status)
       VALUES (?, ?, ?, ?, ?)`,
      [name, category, price, stock, status || 'In Stock']
    );

    res.status(201).json({
      success: true,
      message: 'Medicine created successfully',
      id: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create medicine' });
  }
});

// PUT update medicine (your existing code)
router.put('/api/medicines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock, status } = req.body;
    
    const [result] = await pool.query(
      `UPDATE medicines 
       SET name = ?, category = ?, price = ?, stock = ?, status = ?
       WHERE id = ?`,
      [name, category, price, stock, status, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    
    res.json({ success: true, message: 'Medicine updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update medicine' });
  }
});

// DELETE medicine (your existing code)
router.delete('/api/medicines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      'DELETE FROM medicines WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    
    res.json({ success: true, message: 'Medicine deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete medicine' });
  }
});


module.exports = router;
