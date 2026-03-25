const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/bills
router.get('/', authenticate, async (req, res) => {
  try {
    const { payment_status, date } = req.query;
    let query = `
      SELECT b.*, o.order_type, o.notes AS order_notes, t.table_number,
             u.name AS staff_name
      FROM bills b
      JOIN orders o ON b.order_id=o.id
      LEFT JOIN tables t ON o.table_id=t.id
      LEFT JOIN users u ON o.user_id=u.id
    `;
    const params = [];
    const conditions = [];
    if (payment_status) { params.push(payment_status); conditions.push(`b.payment_status=$${params.length}`); }
    if (date)           { params.push(date);            conditions.push(`DATE(b.created_at)=$${params.length}`); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY b.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/bills/generate/:orderId - generate bill for an order
router.post('/generate/:orderId', authenticate, async (req, res) => {
  const { tax_rate = 5, discount = 0, payment_method = 'cash' } = req.body;
  try {
    // Check if bill exists already
    const existing = await pool.query('SELECT * FROM bills WHERE order_id=$1', [req.params.orderId]);
    if (existing.rows[0]) return res.json(existing.rows[0]);

    const items = await pool.query(
      'SELECT quantity, unit_price FROM order_items WHERE order_id=$1', [req.params.orderId]
    );
    const subtotal = items.rows.reduce((sum, i) => sum + i.quantity * parseFloat(i.unit_price), 0);
    const taxAmount = (subtotal * tax_rate) / 100;
    const total = subtotal + taxAmount - parseFloat(discount);

    const result = await pool.query(
      `INSERT INTO bills (order_id, subtotal, tax_rate, tax_amount, discount, total, payment_method)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.params.orderId, subtotal.toFixed(2), tax_rate, taxAmount.toFixed(2), discount, total.toFixed(2), payment_method]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/bills/:id/pay
router.patch('/:id/pay', authenticate, async (req, res) => {
  const { payment_method } = req.body;
  try {
    const result = await pool.query(
      "UPDATE bills SET payment_status='paid', payment_method=$1 WHERE id=$2 RETURNING *",
      [payment_method || 'cash', req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Bill not found' });
    // Mark order as served
    await pool.query("UPDATE orders SET status='served', updated_at=NOW() WHERE id=$1", [result.rows[0].order_id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/bills/stats - daily revenue stats
router.get('/stats/daily', authenticate, authorize('admin','manager'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        DATE(created_at) AS date,
        COUNT(*) AS total_bills,
        SUM(total) AS revenue,
        SUM(CASE WHEN payment_status='paid' THEN total ELSE 0 END) AS collected,
        SUM(discount) AS total_discounts
      FROM bills
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
