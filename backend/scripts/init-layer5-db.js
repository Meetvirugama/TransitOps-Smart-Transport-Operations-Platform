const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const createLayer5Tables = async () => {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('Connected successfully. Creating Layer 5 tables...');

    // Fuel Logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS fuel_logs (
        id SERIAL PRIMARY KEY,
        vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE RESTRICT NOT NULL,
        trip_id INTEGER REFERENCES trips(id) ON DELETE SET NULL,
        driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
        fuel_station VARCHAR(150),
        quantity NUMERIC(10,2) NOT NULL,
        price_per_liter NUMERIC(10,2) NOT NULL,
        total_cost NUMERIC(10,2) NOT NULL,
        odometer_reading NUMERIC(10,2) NOT NULL,
        fuel_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        remarks TEXT,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT false
      );
    `);
    console.log('Created fuel_logs table.');

    // Expenses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE RESTRICT NOT NULL,
        trip_id INTEGER REFERENCES trips(id) ON DELETE SET NULL,
        expense_type VARCHAR(100) NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        expense_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        description TEXT,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT false
      );
    `);
    console.log('Created expenses table.');

    // Revenues table
    await client.query(`
      CREATE TABLE IF NOT EXISTS revenues (
        id SERIAL PRIMARY KEY,
        trip_id INTEGER REFERENCES trips(id) ON DELETE RESTRICT NOT NULL,
        vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE RESTRICT NOT NULL,
        customer_name VARCHAR(150),
        amount NUMERIC(10,2) NOT NULL,
        payment_status VARCHAR(50) DEFAULT 'Pending',
        invoice_number VARCHAR(100),
        received_date TIMESTAMP,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT false
      );
    `);
    console.log('Created revenues table.');

    client.release();
    console.log('Layer 5 Database initialization complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error initializing Layer 5 database:', err);
    process.exit(1);
  }
};

createLayer5Tables();
