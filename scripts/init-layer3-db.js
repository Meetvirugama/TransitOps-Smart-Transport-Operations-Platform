const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const createLayer3Tables = async () => {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('Connected successfully. Creating Layer 3 tables...');

    // Trips table
    await client.query(`
      CREATE TABLE IF NOT EXISTS trips (
        id SERIAL PRIMARY KEY,
        trip_number VARCHAR(50) UNIQUE NOT NULL,
        source VARCHAR(150) NOT NULL,
        destination VARCHAR(150) NOT NULL,
        vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
        driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
        cargo_weight NUMERIC(10,2) NOT NULL,
        planned_distance NUMERIC(10,2),
        actual_distance NUMERIC(10,2),
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        status VARCHAR(50) DEFAULT 'Draft',
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT false
      );
    `);
    console.log('Created trips table.');

    client.release();
    console.log('Layer 3 Database initialization complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error initializing Layer 3 database:', err);
    process.exit(1);
  }
};

createLayer3Tables();
