const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => Number((Math.random() * (max - min) + min).toFixed(2));
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomDateInPast = (daysLimit) => {
  const d = new Date();
  d.setDate(d.getDate() - randomInt(1, daysLimit));
  return d.toISOString();
};

const seedMoreData = async () => {
  const client = await pool.connect();
  try {
    console.log('Seeding MORE dummy data...');
    await client.query('BEGIN');

    const { rows: vehicleTypes } = await client.query('SELECT id FROM vehicle_types');
    const { rows: regions } = await client.query('SELECT id FROM regions');
    const { rows: licenseCategories } = await client.query('SELECT id FROM license_categories');
    const { rows: workshops } = await client.query('SELECT id FROM workshops');

    // 1. Insert 20 Vehicles
    for (let i = 0; i < 20; i++) {
      await client.query(`
        INSERT INTO vehicles (registration_number, name, model, vehicle_type_id, max_capacity, odometer, acquisition_cost, status, region_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (registration_number) DO NOTHING;
      `, [
        `MH-${randomInt(10,99)}-XX-${randomInt(1000,9999)}`,
        `Fleet Vehicle ${i}`,
        randomElement(['Tata Signa', 'Ashok Leyland 1920', 'Mahindra Furio', 'Eicher Pro']),
        randomElement(vehicleTypes).id,
        randomInt(5000, 20000),
        randomInt(1000, 150000),
        randomInt(1000000, 5000000),
        randomElement(['Available', 'On Trip', 'In Shop']),
        randomElement(regions).id
      ]);
    }

    // 2. Insert 20 Drivers
    for (let i = 0; i < 20; i++) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + randomInt(-10, 365)); // some expiring or expired
      
      await client.query(`
        INSERT INTO drivers (full_name, license_number, license_category_id, license_expiry_date, phone, safety_score, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (license_number) DO NOTHING;
      `, [
        `Driver Name ${i}`,
        `DL-XX-${randomInt(100000,999999)}`,
        randomElement(licenseCategories).id,
        expiry.toISOString(),
        `98${randomInt(10000000, 99999999)}`,
        randomInt(60, 100),
        randomElement(['Available', 'On Trip', 'Off Duty'])
      ]);
    }

    const { rows: vRows } = await client.query('SELECT id FROM vehicles');
    const { rows: dRows } = await client.query('SELECT id FROM drivers');

    // 3. Insert 100 Trips
    for (let i = 0; i < 100; i++) {
      await client.query(`
        INSERT INTO trips (trip_number, vehicle_id, driver_id, source, destination, cargo_weight, planned_distance, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (trip_number) DO NOTHING;
      `, [
        `TRP-BIG-${i}-${randomInt(1000,9999)}`,
        randomElement(vRows).id,
        randomElement(dRows).id,
        randomElement(['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune']),
        randomElement(['Surat', 'Ahmedabad', 'Hyderabad', 'Kolkata', 'Nagpur']),
        randomInt(1000, 15000),
        randomInt(50, 1500),
        randomElement(['Completed', 'Completed', 'Completed', 'Dispatched', 'Draft'])
      ]);
    }

    // 4. Insert 100 Fuel Logs
    for (let i = 0; i < 100; i++) {
      const qty = randomFloat(20, 150);
      const price = randomFloat(85, 100);
      await client.query(`
        INSERT INTO fuel_logs (vehicle_id, quantity, price_per_liter, total_cost, odometer_reading, fuel_station, fuel_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        randomElement(vRows).id,
        qty,
        price,
        qty * price,
        randomInt(10000, 150000),
        randomElement(['Reliance Petro', 'Indian Oil', 'HP', 'Shell']),
        randomDateInPast(60)
      ]);
    }

    // 5. Insert 50 Expenses
    for (let i = 0; i < 50; i++) {
      await client.query(`
        INSERT INTO expenses (vehicle_id, expense_type, amount, description, expense_date)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        randomElement(vRows).id,
        randomElement(['Tolls', 'Fines', 'Parking', 'Other']),
        randomFloat(100, 2000),
        `Misc expense ${i}`,
        randomDateInPast(60)
      ]);
    }

    // 6. Insert 50 Revenues
    const { rows: tRows } = await client.query('SELECT id, vehicle_id FROM trips WHERE status = \'Completed\'');
    for (let i = 0; i < 50; i++) {
      if (tRows.length === 0) break;
      const trip = randomElement(tRows);
      await client.query(`
        INSERT INTO revenues (trip_id, vehicle_id, amount, customer_name, payment_status, received_date)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        trip.id,
        trip.vehicle_id,
        randomFloat(5000, 50000),
        randomElement(['Freight Corp', 'Logistics LLC']),
        'Paid',
        randomDateInPast(30)
      ]);
    }

    // 7. Insert 20 Maintenance Records
    for (let i = 0; i < 20; i++) {
      await client.query(`
        INSERT INTO maintenance_records (vehicle_id, workshop_id, maintenance_type, description, estimated_cost, actual_cost, technician_name, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        randomElement(vRows).id,
        workshops.length > 0 ? randomElement(workshops).id : null,
        randomElement(['Routine Service', 'Repair', 'Inspection']),
        `Maintenance task ${i}`,
        randomFloat(1000, 10000),
        randomFloat(1000, 12000),
        `Tech ${i}`,
        randomElement(['Completed', 'In Progress', 'Scheduled'])
      ]);
    }

    await client.query('COMMIT');
    console.log('Lots of dummy data seeded successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error seeding data:', err);
  } finally {
    client.release();
    await pool.end();
  }
};

seedMoreData();
