
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initDb = async () => {
  const client = await pool.connect();
  try {
    console.log('Beginning database initialization...');
    await client.query('BEGIN');

    // Create roles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL
      );
    `);

    // Insert default roles
    const roles = ['Admin', 'Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'];
    for (const role of roles) {
      await client.query(`
        INSERT INTO roles (name) VALUES ($1) ON CONFLICT (name) DO NOTHING;
      `, [role]);
    }

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create user_roles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, role_id)
      );
    `);

    await client.query('COMMIT');
    console.log('Database initialization completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error initializing database:', error);
  } finally {
    client.release();
    pool.end();
  }
};

initDb();
