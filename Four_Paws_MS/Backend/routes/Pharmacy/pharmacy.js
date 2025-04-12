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
       JOIN medicine_group_members mgm ON m.id = mgm.id
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

// GET medicines in a specific group
router.get('/api/medicine-groups/:groupId/medicines', (req, res) => {
  const { groupId } = req.params;

  db.query(
    `SELECT m.* FROM medicines m
     JOIN group_medicines gm ON m.id = gm.medicine_id
     WHERE gm.group_id = ?`,
    [groupId],
    (err, medicines) => {
      if (err) {
        console.error(err);
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

      res.json(processedMedicines);
    }
  );
});

// POST create new medicine group
router.post('/api/medicine-groups', (req, res) => {
  try {
    const { name, description = '' } = req.body;
    
    // Basic validation
    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    db.query(
      `INSERT INTO medicine_groups (name, description)
       VALUES (?, ?)`,
      [name, description],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to create medicine group' });
        }

        // Return the newly created group data
        db.query(
          `SELECT * FROM medicine_groups WHERE id = ?`,
          [result.insertId],
          (err, rows) => {
            if (err || rows.length === 0) {
              return res.status(201).json({
                success: true,
                message: 'Medicine group created successfully',
                id: result.insertId
              });
            }
            
            res.status(201).json({
              success: true,
              data: rows[0],
              message: 'Medicine group created successfully'
            });
          }
        );
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create medicine group' });
  }
});

// PUT update medicine group
router.put('/api/medicine-groups/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description = '' } = req.body;
    
    // Basic validation
    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    db.query(
      `UPDATE medicine_groups 
       SET name = ?, description = ?
       WHERE id = ?`,
      [name, description, id],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to update medicine group' });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Medicine group not found' });
        }
        
        res.json({ 
          success: true, 
          message: 'Medicine group updated successfully'
        });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update medicine group' });
  }
});

// DELETE medicine group
router.delete('/api/medicine-groups/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // First delete all group members (due to foreign key constraints)
    db.beginTransaction(err => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to start transaction' });
      }

      db.query(
        'DELETE FROM medicine_group_members WHERE group_id = ?',
        [id],
        (memberErr, memberResult) => {
          if (memberErr) {
            return db.rollback(() => {
              console.error(memberErr);
              res.status(500).json({ error: 'Failed to delete group members' });
            });
          }

          // Then delete the group itself
          db.query(
            'DELETE FROM medicine_groups WHERE id = ?',
            [id],
            (groupErr, groupResult) => {
              if (groupErr) {
                return db.rollback(() => {
                  console.error(groupErr);
                  res.status(500).json({ error: 'Failed to delete medicine group' });
                });
              }
              
              if (groupResult.affectedRows === 0) {
                return db.rollback(() => {
                  res.status(404).json({ error: 'Medicine group not found' });
                });
              }

              db.commit(err => {
                if (err) {
                  return db.rollback(() => {
                    console.error(err);
                    res.status(500).json({ error: 'Failed to commit transaction' });
                  });
                }

                res.json({ 
                  success: true, 
                  message: 'Medicine group deleted successfully',
                  deletedMembers: memberResult.affectedRows
                });
              });
            }
          );
        }
      );
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete medicine group' });
  }
});

// POST endpoint to add medicines to group
router.post('/api/medicine-groups/:groupId/medicines', (req, res) => {
  const { groupId } = req.params;
  const { medicineIds } = req.body;

  if (!Array.isArray(medicineIds) || medicineIds.length === 0) {
    return res.status(400).json({ error: 'Medicine IDs array required' });
  }

  const values = medicineIds.map(id => [groupId, id]);
  
  db.query(
    `INSERT IGNORE INTO group_medicines (group_id, medicine_id) VALUES ?`,
    [values],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to add medicines' });
      }

      // Return the updated group with medicines
      db.query(
        `SELECT mg.*, 
                JSON_ARRAYAGG(
                  JSON_OBJECT(
                    'id', m.id,
                    'name', m.name,
                    'dosage', m.dosage
                  )
                ) as medicines
         FROM medicine_groups mg
         LEFT JOIN group_medicines gm ON mg.id = gm.group_id
         LEFT JOIN medicines m ON gm.medicine_id = m.id
         WHERE mg.id = ?
         GROUP BY mg.id`,
        [groupId],
        (err, results) => {
          if (err || results.length === 0) {
            return res.status(500).json({ error: 'Failed to fetch updated group' });
          }

          res.json({
            ...results[0],
            medicines: results[0].medicines[0]?.id ? results[0].medicines : []
          });
        }
      );
    }
  );
});

// DELETE remove medicine from group
router.delete('/api/medicine-groups/:groupId/medicines/:medicineId', (req, res) => {
  try {
    const { groupId, medicineId } = req.params;

    db.query(
      'DELETE FROM medicine_group_members WHERE group_id = ? AND medicine_id = ?',
      [groupId, medicineId],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to remove medicine from group' });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ 
            error: 'Medicine not found in this group or group does not exist' 
          });
        }
        
        res.json({ 
          success: true, 
          message: 'Medicine removed from group successfully'
        });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove medicine from group' });
  }
});

module.exports = router;