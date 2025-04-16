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



// Add this helper function to create notifications
const createNotification = async (title, description, type, related_id = null) => {
  await db.execute(
    'INSERT INTO notifications (title, description, type, related_id) VALUES (?, ?, ?, ?)',
    [title, description, type, related_id]
  );
};

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

// POST create new medicine with notification
router.post('/api/medicines', async (req, res) => {
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

    // Using async/await instead of callback
    const [result] = await db.promise().query(
      `INSERT INTO medicines (name, category, price, stock, status)
       VALUES (?, ?, ?, ?, ?)`,
      [name, category, parseFloat(price), stockNum, status]
    );

    // Create notification about the new medicine
    await db.promise().query(
      `INSERT INTO notifications (title, description, type, related_id)
       VALUES (?, ?, ?, ?)`,
      [
        'New Medicine Added',
        `Medicine "${name}" (${category}) has been added to inventory with ${stock} units`,
        'medicine_added',
        result.insertId
      ]
    );

    // If stock is low, create an additional notification
    if (status === 'Low Stock') {
      await db.promise().query(
        `INSERT INTO notifications (title, description, type, related_id)
         VALUES (?, ?, ?, ?)`,
        [
          'Low Stock Alert',
          `Medicine "${name}" is running low (${stock} units remaining)`,
          'medicine_updated', // or you could add 'low_stock' to your ENUM
          result.insertId
        ]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Medicine created successfully',
      id: result.insertId,
      status
    });

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

// GET all medicine groups (with accurate count)
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

        // Get paginated data with accurate medicine counts
        db.query(
          `SELECT mg.*, 
           (SELECT COUNT(*) FROM medicine_group_members WHERE group_id = mg.id) as count
           FROM medicine_groups mg
           WHERE mg.name LIKE ?
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


// POST endpoint to add medicines to group (improved)
router.post('/api/medicine-groups/:groupId/medicines', async (req, res) => {
  const { groupId } = req.params;
  const { medicineIds } = req.body;

  if (!Array.isArray(medicineIds)) {
    return res.status(400).json({ error: 'Medicine IDs must be an array' });
  }

  try {
    // Verify group exists
    const [group] = await db.promise().query(
      'SELECT id FROM medicine_groups WHERE id = ?', 
      [groupId]
    );
    if (!group.length) {
      return res.status(404).json({ error: 'Medicine group not found' });
    }

    // Verify medicines exist and aren't already in group
    const [existingMedicines] = await db.promise().query(
      `SELECT m.id FROM medicines m
       LEFT JOIN medicine_group_members mgm ON 
         m.id = mgm.medicine_id AND mgm.group_id = ?
       WHERE m.id IN (?) AND mgm.medicine_id IS NULL`,
      [groupId, medicineIds]
    );

    const validIds = existingMedicines.map(m => m.id);
    if (validIds.length === 0) {
      return res.status(400).json({ 
        error: 'No valid medicines to add (may already be in group)' 
      });
    }

    // Insert new members
    const values = validIds.map(id => [groupId, id]);
    const [result] = await db.promise().query(
      `INSERT INTO medicine_group_members (group_id, medicine_id) VALUES ?`,
      [values]
    );

    // Get updated count
    const [[count]] = await db.promise().query(
      `SELECT COUNT(*) as count FROM medicine_group_members WHERE group_id = ?`,
      [groupId]
    );

    res.json({
      success: true,
      message: `${result.affectedRows} medicine(s) added to group`,
      addedCount: result.affectedRows,
      newCount: count.count
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add medicines to group' });
  }
});

// GET medicines in a specific group
router.get('/api/medicine-groups/:groupId/medicines', (req, res) => {
  const { groupId } = req.params;

  db.query(
    `SELECT m.* FROM medicines m
     JOIN medicine_group_members mgm ON m.id = mgm.medicine_id
     WHERE mgm.group_id = ?`,
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

// GET available medicines (not in group) with search
router.get('/api/medicine-groups/:groupId/available-medicines', (req, res) => {
  const { groupId } = req.params;
  const { search = '' } = req.query;

  db.query(
    `SELECT m.* FROM medicines m
     WHERE (m.name LIKE ? OR m.category LIKE ?)
     AND m.id NOT IN (
       SELECT medicine_id FROM medicine_group_members WHERE group_id = ?
     )`,
    [`%${search}%`, `%${search}%`, groupId],
    (err, medicines) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch available medicines' });
      }

      const processedMedicines = medicines.map(medicine => {
        let status = 'In Stock';
        const stock = parseInt(medicine.stock);
        if (stock === 0) status = 'Out of Stock';
        else if (stock > 0 && stock <= 15) status = 'Low Stock';
        return { ...medicine, status };
      });

      res.json(processedMedicines);
    }
  );
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

// POST endpoint to add medicines to group
router.post('/api/medicine-groups/:groupId/medicines', (req, res) => {
  const { groupId } = req.params;
  const { medicineIds } = req.body;

  if (!Array.isArray(medicineIds) || medicineIds.length === 0) {
    return res.status(400).json({ error: 'Medicine IDs array required' });
  }

  const values = medicineIds.map(id => [groupId, id]);
  
  db.query(
    `INSERT IGNORE INTO medicine_group_members (group_id, medicine_id) VALUES ?`,
    [values],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to add medicines to group' });
      }

      res.json({
        success: true,
        message: 'Medicines added to group successfully',
        addedCount: result.affectedRows
      });
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
    `INSERT IGNORE INTO medicine_group_members (group_id, medicine_id) VALUES ?`,
    [values],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to add medicines to group' });
      }

      res.json({
        success: true,
        message: 'Medicines added to group successfully',
        addedCount: result.affectedRows
      });
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



/*- GET all notifications (with optional search and pagination)*/

// GET all notifications
router.get('/api/notifications', async (req, res) => {
  try {
    const [notifications] = await db.promise().query(
      'SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50'
    );
    res.json(notifications);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    res.status(500).json({ 
      error: 'Failed to fetch notifications',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Mark notification as read
router.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const [result] = await db.promise().query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    res.status(500).json({ 
      error: 'Failed to update notification',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Mark all notifications as read
router.patch('/api/notifications/mark-all-read', async (req, res) => {
  try {
    await db.promise().query(
      'UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE'
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    res.status(500).json({ 
      error: 'Failed to update notifications',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Debug endpoint
router.get('/api/notifications/debug', async (req, res) => {
  try {
    const [[{count}]] = await db.promise().query(
      'SELECT COUNT(*) as count FROM notifications'
    );
    const [recent] = await db.promise().query(
      'SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5'
    );
    
    res.json({
      success: true,
      count,
      recent_notifications: recent,
      table_exists: count >= 0
    });
  } catch (error) {
    console.error('Debug endpoint failed:', error);
    res.status(500).json({
      error: 'Debug check failed',
      details: error.message,
      table_exists: false
    });
  }
});

module.exports = router;