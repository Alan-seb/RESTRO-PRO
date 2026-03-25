const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDB } = require('./db');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/menu',      require('./routes/menu'));
app.use('/api/orders',    require('./routes/orders'));
app.use('/api/bills',     require('./routes/bills'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/tables',    require('./routes/tables'));
app.use('/api/users',     require('./routes/users'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// 404 handler
app.use('/api/*', (req, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

initDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}).catch(err => {
  console.error('Failed to initialize DB:', err);
  process.exit(1);
});
