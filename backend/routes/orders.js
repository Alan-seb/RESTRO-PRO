const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/orders
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, date } = req.query;
    let query = `
      SELECT o.*, t.table_number, u.name AS staff_name,
        COALESCE(json_agg(
          json_build_object('id',oi.id,'menu_item_id',oi.menu_item_id,
            'name',mi.name,'quantity',oi.quantity,'unit_price',oi.unit_price,'notes',oi.notes)
        ) FILTER (WHERE oi.id IS NOT NULL), '[]') AS items
      FROM orders o
      LEFT JOIN tables t ON o.table_id=t.id
      LEFT JOIN users u ON o.user_id=u.id
      LEFT JOIN order_items oi ON o.id=oi.order_id
      LEFT JOIN menu_items mi ON oi.menu_item_id=mi.id
    `;
    const params = [];
    const conditions = [];
    if (status) { params.push(status); conditions.push(`o.status=$${params.length}`); }
    if (date)   { params.push(date);   conditions.push(`DATE(o.created_at)=$${params.length}`); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' GROUP BY o.id, t.table_number, u.name ORDER BY o.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/orders/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await pool.query(`
      SELECT o.*, t.table_number, u.name AS staff_name
      FROM orders o
      LEFT JOIN tables t ON o.table_id=t.id
      LEFT JOIN users u ON o.user_id=u.id
      WHERE o.id=$1`, [req.params.id]);
    if (!order.rows[0]) return res.status(404).json({ error: 'Order not found' });
    const items = await pool.query(`
      SELECT oi.*, mi.name, mi.description FROM order_items oi
      LEFT JOIN menu_items mi ON oi.menu_item_id=mi.id
      WHERE oi.order_id=$1`, [req.params.id]);
    res.json({ ...order.rows[0], items: items.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/orders
router.post('/', authenticate, async (req, res) => {
  const { table_id, order_type, notes, items } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'Items required' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const orderRes = await client.query(
      'INSERT INTO orders (table_id, user_id, order_type, notes) VALUES ($1,$2,$3,$4) RETURNING *',
      [table_id, req.user.id, order_type || 'dine-in', notes]
    );
    const order = orderRes.rows[0];
    for (const item of items) {
      const menuItem = await client.query('SELECT price FROM menu_items WHERE id=$1', [item.menu_item_id]);
      if (!menuItem.rows[0]) throw new Error(`Menu item ${item.menu_item_id} not found`);
      await client.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, notes) VALUES ($1,$2,$3,$4,$5)',
        [order.id, item.menu_item_id, item.quantity, menuItem.rows[0].price, item.notes]
      );
    }
    if (table_id) await client.query("UPDATE tables SET status='occupied' WHERE id=$1", [table_id]);
    await client.query('COMMIT');
    res.status(201).json(order);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', authenticate, async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      "UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *",
      [status, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Order not found' });
    if (status === 'served' || status === 'cancelled') {
      const order = result.rows[0];
      if (order.table_id) await pool.query("UPDATE tables SET status='available' WHERE id=$1", [order.table_id]);
    }
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
