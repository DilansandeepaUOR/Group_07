const express = require('express');
const router = express.Router();
const db = require('../../db');

// Get all services
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.promise().query('SELECT * FROM reasons ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch services' });
  }
});

// Add a new service
router.post('/', async (req, res) => {
  const { reason_name, ServiceType } = req.body;
  if (!reason_name || !ServiceType) {
    return res.status(400).json({ message: 'reason_name and ServiceType are required' });
  }
  try {
    const [result] = await db.promise().query(
      'INSERT INTO reasons (reason_name, ServiceType) VALUES (?, ?)',
      [reason_name, ServiceType]
    );
    res.status(201).json({ id: result.insertId, reason_name, ServiceType });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'Service name must be unique' });
    } else {
      res.status(500).json({ message: 'Failed to add service' });
    }
  }
});

// Update a service
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { reason_name, ServiceType } = req.body;
  if (!reason_name || !ServiceType) {
    return res.status(400).json({ message: 'reason_name and ServiceType are required' });
  }
  try {
    const [result] = await db.promise().query(
      'UPDATE reasons SET reason_name = ?, ServiceType = ? WHERE id = ?',
      [reason_name, ServiceType, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ id, reason_name, ServiceType });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'Service name must be unique' });
    } else {
      res.status(500).json({ message: 'Failed to update service' });
    }
  }
});

// Delete a service
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.promise().query('DELETE FROM reasons WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete service' });
  }
});

module.exports = router;