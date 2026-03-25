const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/menu - all items with category
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, c.name AS category_name
      FROM menu_items m LEFT JOIN categories c ON m.category_id=c.id
      ORDER BY c.name, m.name
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/menu/categories
router.get('/categories', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/menu
router.post('/', authenticate, authorize('admin','manager'), async (req, res) => {
  const { name, description, price, category_id, available } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO menu_items (name,description,price,category_id,available) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, description, price, category_id, available !== false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/menu/:id
router.put('/:id', authenticate, authorize('admin','manager'), async (req, res) => {
  const { name, description, price, category_id, available } = req.body;
  try {
    const result = await pool.query(
      'UPDATE menu_items SET name=$1,description=$2,price=$3,category_id=$4,available=$5 WHERE id=$6 RETURNING *',
      [name, description, price, category_id, available, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Item not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/menu/:id
router.delete('/:id', authenticate, authorize('admin','manager'), async (req, res) => {
  try {
    await pool.query('DELETE FROM menu_items WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
