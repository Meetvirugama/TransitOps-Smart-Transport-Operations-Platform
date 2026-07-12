const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const createLayer4Tables = async () => {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('Connected successfully. Creating Layer 4 tables...');

    // Workshops table
    await client.query(`
      CREATE TABLE IF NOT EXISTS workshops (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        address TEXT NOT NULL,
        contact_number VARCHAR(50),
        manager VARCHAR(150),
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT false
      );
    `);
    console.log('Created workshops table.');

    // Maintenance Records table
    await client.query(`
      CREATE TABLE IF NOT EXISTS maintenance_records (
        id SERIAL PRIMARY KEY,
        vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE RESTRICT NOT NULL,
        workshop_id INTEGER REFERENCES workshops(id) ON DELETE SET NULL,
        maintenance_type VARCHAR(100) NOT NULL,
        description TEXT,
        technician_name VARCHAR(150),
        start_date TIMESTAMP,
        expected_completion_date TIMESTAMP,
        completed_date TIMESTAMP,
        estimated_cost NUMERIC(10,2),
        actual_cost NUMERIC(10,2),
        status VARCHAR(50) DEFAULT 'Scheduled',
        remarks TEXT,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT false
      );
    `);
    console.log('Created maintenance_records table.');

    client.release();
    console.log('Layer 4 Database initialization complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error initializing Layer 4 database:', err);
    process.exit(1);
  }
};

createLayer4Tables();
