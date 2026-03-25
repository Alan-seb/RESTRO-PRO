const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/tables
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tables ORDER BY table_number');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/tables
router.post('/', authenticate, authorize('admin','manager'), async (req, res) => {
  const { table_number, capacity } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tables (table_number, capacity) VALUES ($1,$2) RETURNING *',
      [table_number, capacity]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/tables/:id/status
router.patch('/:id/status', authenticate, async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tables SET status=$1 WHERE id=$2 RETURNING *',
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
