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

// GET all medicines (with optional search and pagination)
router.get('/api/medicines', (req, res) => {
  try {
    const { search = '', page = 1, limit = 5 } = req.query;
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

            // Process medicines to include status based on stock
            const processedMedicines = medicines.map(medicine => {
              let status = 'In Stock';
              const stock = parseInt(medicine.stock);
              if (stock === 0) {
                status = 'Out of Stock';
              } else if (stock > 0 && stock <= 15) {
                status = 'Low Stock';
              }
              return { ...medicine, status };
            });

            res.json({
              data: processedMedicines,
              totalCount: total,
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
router.get('/api/medicines/:id', (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM medicines WHERE id = ?', [id], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch medicine' });
    }
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    // Process status based on stock
    const medicine = rows[0];
    let status = 'In Stock';
    const stock = parseInt(medicine.stock);
    if (stock === 0) {
      status = 'Out of Stock';
    } else if (stock > 0 && stock <= 15) {
      status = 'Low Stock';
    }

    res.json({ ...medicine, status });
  });
});

// POST create new medicine
router.post('/api/medicines', (req, res) => {
  try {
    const { name, category, price, stock } = req.body;
    
    // Basic validation
    if (!name || !category || price === undefined || stock === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate status based on stock
    let status = 'In Stock';
    const stockNum = parseInt(stock);
    if (stockNum === 0) {
      status = 'Out of Stock';
    } else if (stockNum > 0 && stockNum <= 15) {
      status = 'Low Stock';
    }

    db.query(
      `INSERT INTO medicines (name, category, price, stock, status)
       VALUES (?, ?, ?, ?, ?)`,
      [name, category, parseFloat(price), stockNum, status],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to create medicine' });
        }

        res.status(201).json({
          success: true,
          message: 'Medicine created successfully',
          id: result.insertId,
          status
        });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create medicine' });
  }
});

// PUT update medicine
router.put('/api/medicines/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock } = req.body;
    
    // Basic validation
    if (!name || !category || price === undefined || stock === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate status based on stock
    let status = 'In Stock';
    const stockNum = parseInt(stock);
    if (stockNum === 0) {
      status = 'Out of Stock';
    } else if (stockNum > 0 && stockNum <= 15) {
      status = 'Low Stock';
    }

    db.query(
      `UPDATE medicines 
       SET name = ?, category = ?, price = ?, stock = ?, status = ?
       WHERE id = ?`,
      [name, category, parseFloat(price), stockNum, status, id],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to update medicine' });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Medicine not found' });
        }
        
        res.json({ 
          success: true, 
          message: 'Medicine updated successfully',
          status
        });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update medicine' });
  }
});

// DELETE medicine
router.delete('/api/medicines/:id', (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    
    db.query(
      'DELETE FROM medicines WHERE id = ?',
      [id],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to delete medicine' });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Medicine not found' });
        }
        
        res.json({ success: true, message: 'Medicine deleted successfully' });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete medicine' });
  }
});

// GET all medicine groups (with optional search and pagination)
router.get('/api/medicine-groups', (req, res) => {
  try {
    const { search = '', page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * limit;

    // Get total count
    db.query(
      'SELECT COUNT(*) as total FROM medicine_groups WHERE name LIKE ?',
      [`%${search}%`],
      (countErr, countRows) => {
        if (countErr) {
          console.error(countErr);
          return res.status(500).json({ error: 'Failed to count medicine groups' });
        }

        const total = countRows[0].total;
        const totalPages = Math.ceil(total / limit);

        // Get paginated data
        db.query(
          `SELECT mg.*, COUNT(mgm.medicine_id) as medicine_count 
           FROM medicine_groups mg
           LEFT JOIN medicine_group_members mgm ON mg.id = mgm.group_id
           WHERE mg.name LIKE ?
           GROUP BY mg.id
           ORDER BY mg.name ASC
           LIMIT ? OFFSET ?`,
          [`%${search}%`, parseInt(limit), parseInt(offset)],
          (groupErr, groups) => {
            if (groupErr) {
              console.error(groupErr);
              return res.status(500).json({ error: 'Failed to fetch medicine groups' });
            }

            res.json({
              data: groups,
              totalCount: total,
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
    res.status(500).json({ error: 'Failed to fetch medicine groups' });
  }
});

// GET single medicine group by ID with its medicines
router.get('/api/medicine-groups/:id', (req, res) => {
  const { id } = req.params;

  // First get the group details
  db.query('SELECT * FROM medicine_groups WHERE id = ?', [id], (groupErr, groupRows) => {
    if (groupErr) {
      console.error(groupErr);
      return res.status(500).json({ error: 'Failed to fetch medicine group' });
    }
    
    if (groupRows.length === 0) {
      return res.status(404).json({ error: 'Medicine group not found' });
    }

    const group = groupRows[0];

    // Then get all medicines in this group
    db.query(
      `SELECT m.* FROM medicines m
       JOIN medicine_group_members mgm ON m.id = mgm.medicine_id
       WHERE mgm.group_id = ?`,
      [id],
      (medErr, medicines) => {
        if (medErr) {
          console.error(medErr);
          return res.status(500).json({ error: 'Failed to fetch group medicines' });
        }

        // Process medicines to include status based on stock
        const processedMedicines = medicines.map(medicine => {
          let status = 'In Stock';
          const stock = parseInt(medicine.stock);
          if (stock === 0) {
            status = 'Out of Stock';
          } else if (stock > 0 && stock <= 15) {
            status = 'Low Stock';
          }
          return { ...medicine, status };
        });

        res.json({
          ...group,
          medicines: processedMedicines,
          medicine_count: processedMedicines.length
        });
      }
    );
  });
});

// GET all medicines not in a specific group (for adding medicines to group)
router.get('/api/medicine-groups/:id/available-medicines', (req, res) => {
  const { id } = req.params;
  const { search = '' } = req.query;

  db.query(
    `SELECT m.* FROM medicines m
     WHERE m.id NOT IN (
       SELECT medicine_id FROM medicine_group_members WHERE group_id = ?
     )
     AND (m.name LIKE ? OR m.category LIKE ?)`,
    [id, `%${search}%`, `%${search}%`],
    (err, medicines) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch available medicines' });
      }

      // Process medicines to include status based on stock
      const processedMedicines = medicines.map(medicine => {
        let status = 'In Stock';
        const stock = parseInt(medicine.stock);
        if (stock === 0) {
          status = 'Out of Stock';
        } else if (stock > 0 && stock <= 15) {
          status = 'Low Stock';
        }
        return { ...medicine, status };
      });

      res.json(processedMedicines);
    }
  );
});

module.exports = router;