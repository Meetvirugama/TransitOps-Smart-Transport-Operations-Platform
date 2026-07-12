const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initLayer1Db = async () => {
  const client = await pool.connect();
  try {
    console.log('Beginning Layer 1 database initialization...');
    await client.query('BEGIN');

    // Create Regions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS regions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        is_deleted BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Vehicle Types table
    await client.query(`
      CREATE TABLE IF NOT EXISTS vehicle_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        max_default_capacity NUMERIC NOT NULL,
        is_deleted BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create License Categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS license_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        is_deleted BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Vehicles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        registration_number VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(150) NOT NULL,
        model VARCHAR(100),
        vehicle_type_id INTEGER REFERENCES vehicle_types(id),
        max_capacity NUMERIC NOT NULL CHECK (max_capacity > 0),
        odometer NUMERIC DEFAULT 0 CHECK (odometer >= 0),
        acquisition_cost NUMERIC DEFAULT 0 CHECK (acquisition_cost >= 0),
        purchase_date DATE,
        status VARCHAR(50) DEFAULT 'Available',
        region_id INTEGER REFERENCES regions(id),
        description TEXT,
        is_deleted BOOLEAN DEFAULT false,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Drivers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS drivers (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL,
        license_number VARCHAR(100) UNIQUE NOT NULL,
        license_category_id INTEGER REFERENCES license_categories(id),
        license_expiry_date DATE NOT NULL,
        phone VARCHAR(50),
        email VARCHAR(150),
        safety_score NUMERIC DEFAULT 100 CHECK (safety_score >= 0 AND safety_score <= 100),
        status VARCHAR(50) DEFAULT 'Available',
        address TEXT,
        joining_date DATE,
        is_deleted BOOLEAN DEFAULT false,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Profiles table (linked to users from Layer 0)
    await client.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        employee_name VARCHAR(150),
        phone VARCHAR(50),
        department VARCHAR(100),
        profile_photo TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query('COMMIT');
    console.log('Layer 1 Database initialization completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error initializing Layer 1 database:', error);
  } finally {
    client.release();
    pool.end();
  }
};

initLayer1Db();
