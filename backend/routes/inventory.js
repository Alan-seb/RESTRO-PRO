const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/inventory
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory ORDER BY item_name');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/inventory/low-stock
router.get('/low-stock', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM inventory WHERE quantity <= min_threshold ORDER BY quantity ASC'
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/inventory
router.post('/', authenticate, authorize('admin','manager'), async (req, res) => {
  const { item_name, unit, quantity, min_threshold, cost_per_unit } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO inventory (item_name,unit,quantity,min_threshold,cost_per_unit) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [item_name, unit, quantity || 0, min_threshold || 5, cost_per_unit || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/inventory/:id
router.put('/:id', authenticate, authorize('admin','manager'), async (req, res) => {
  const { item_name, unit, quantity, min_threshold, cost_per_unit } = req.body;
  try {
    const result = await pool.query(
      `UPDATE inventory SET item_name=$1,unit=$2,quantity=$3,min_threshold=$4,
       cost_per_unit=$5,updated_at=NOW() WHERE id=$6 RETURNING *`,
      [item_name, unit, quantity, min_threshold, cost_per_unit, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Item not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/inventory/:id/restock
router.patch('/:id/restock', authenticate, authorize('admin','manager'), async (req, res) => {
  const { quantity } = req.body;
  try {
    const result = await pool.query(
      'UPDATE inventory SET quantity=quantity+$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [quantity, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/inventory/:id
router.delete('/:id', authenticate, authorize('admin','manager'), async (req, res) => {
  try {
    await pool.query('DELETE FROM inventory WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
