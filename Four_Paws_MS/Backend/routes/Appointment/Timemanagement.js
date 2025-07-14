const express = require('express');
const router = express.Router();
const db = require('../../db');



router.get('/', async (req, res) => {
    try {
      const [rows] = await db.promise().query('SELECT * FROM time_slots ORDER BY id');
      res.json(rows);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch services' });
    }
  });

// Add slot
router.post('/', async (req, res) => {
  const { time_slot, enabled } = req.body;
  if (!time_slot) return res.status(400).json({ message: 'Time is required' });
  await db.promise().query('INSERT INTO time_slots (time_slot, enabled) VALUES (?, ?)', [time_slot, enabled ? 1 : 0]);
  res.json({ message: 'Added' });
});

// Update slot
router.put('/:id', async (req, res) => {
  const { time_slot, enabled } = req.body;
  await db.promise().query('UPDATE time_slots SET time_slot=?, enabled=? WHERE id=?', [time_slot, enabled ? 1 : 0, req.params.id]);
  res.json({ message: 'Updated' });
});

// Delete slot
router.delete('/:id', async (req, res) => {
  await db.promise().query('DELETE FROM time_slots WHERE id=?', [req.params.id]);
  res.json({ message: 'Deleted' });
});

module.exports = router;