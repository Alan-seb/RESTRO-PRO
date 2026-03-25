const { pool } = require('../db');
const bcrypt = require('bcryptjs');

async function seed() {
  const password = 'admin123';
  const hashed = await bcrypt.hash(password, 10);

  const users = [
    { name: 'Admin', email: 'admin@restaurant.com', role: 'admin' },
    { name: 'Manager', email: 'manager@restaurant.com', role: 'manager' },
    { name: 'Cashier', email: 'cashier@restaurant.com', role: 'cashier' },
    { name: 'Staff', email: 'staff@restaurant.com', role: 'staff' }
  ];

  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing users to avoid conflicts
    await pool.query('DELETE FROM users');
    console.log('🗑️  Cleared existing users');

    for (const user of users) {
      await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
        [user.name, user.email, hashed, user.role]
      );
      console.log(`✅ Created ${user.role}: ${user.email}`);
    }

    console.log('✨ Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
