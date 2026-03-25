const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'staff' CHECK (role IN ('admin','manager','staff','cashier')),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        price NUMERIC(10,2) NOT NULL,
        category_id INT REFERENCES categories(id) ON DELETE SET NULL,
        available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        item_name VARCHAR(150) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        quantity NUMERIC(10,2) DEFAULT 0,
        min_threshold NUMERIC(10,2) DEFAULT 5,
        cost_per_unit NUMERIC(10,2) DEFAULT 0,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS tables (
        id SERIAL PRIMARY KEY,
        table_number VARCHAR(20) UNIQUE NOT NULL,
        capacity INT NOT NULL,
        status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available','occupied','reserved','cleaning'))
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        table_id INT REFERENCES tables(id) ON DELETE SET NULL,
        user_id INT REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','preparing','ready','served','cancelled')),
        order_type VARCHAR(20) DEFAULT 'dine-in' CHECK (order_type IN ('dine-in','takeaway','delivery')),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id) ON DELETE CASCADE,
        menu_item_id INT REFERENCES menu_items(id) ON DELETE SET NULL,
        quantity INT NOT NULL DEFAULT 1,
        unit_price NUMERIC(10,2) NOT NULL,
        notes TEXT
      );

      CREATE TABLE IF NOT EXISTS bills (
        id SERIAL PRIMARY KEY,
        order_id INT UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
        subtotal NUMERIC(10,2) NOT NULL,
        tax_rate NUMERIC(5,2) DEFAULT 5.00,
        tax_amount NUMERIC(10,2) NOT NULL,
        discount NUMERIC(10,2) DEFAULT 0,
        total NUMERIC(10,2) NOT NULL,
        payment_method VARCHAR(30) DEFAULT 'cash' CHECK (payment_method IN ('cash','card','upi','wallet')),
        payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid','refunded')),
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Seed default admin if not exists
      INSERT INTO users (name, email, password, role)
      SELECT 'Admin', 'admin@restaurant.com', '$2a$10$rQ3HkY8mPz.JXqXKkqrQYubLU8q0pv3p.5BQ0RxAVZnZ7cJhEfXWi', 'admin'
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@restaurant.com');

      -- Seed categories
      INSERT INTO categories (name)
      SELECT unnest(ARRAY['Starters','Main Course','Beverages','Desserts','Breads'])
      WHERE NOT EXISTS (SELECT 1 FROM categories LIMIT 1);

      -- Seed tables
      INSERT INTO tables (table_number, capacity)
      SELECT t.num, t.cap FROM (VALUES
        ('T1',2),('T2',2),('T3',4),('T4',4),('T5',6),('T6',6),('T7',8),('T8',8)
      ) AS t(num,cap)
      WHERE NOT EXISTS (SELECT 1 FROM tables LIMIT 1);
    `);
    console.log('✅ Database initialized successfully');
  } catch (err) {
    console.error('❌ DB Init Error:', err.message);
  } finally {
    client.release();
  }
};

module.exports = { pool, initDB };
