const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const seedDummyData = async () => {
  const client = await pool.connect();
  try {
    console.log('Seeding dummy data...');
    await client.query('BEGIN');

    // 1. Insert Regions
    await client.query(`
      INSERT INTO regions (name, description) VALUES
      ('North Hub', 'North region'),
      ('South Hub', 'South region'),
      ('East Hub', 'East region')
      ON CONFLICT (name) DO NOTHING;
    `);

    // 2. Insert Vehicle Types
    await client.query(`
      INSERT INTO vehicle_types (name, description, max_default_capacity) VALUES
      ('Van', 'Standard cargo van', 2500),
      ('Truck', 'Heavy duty truck', 15000),
      ('Reefer', 'Refrigerated truck', 10000)
      ON CONFLICT (name) DO NOTHING;
    `);

    // 3. Insert License Categories
    await client.query(`
      INSERT INTO license_categories (name, description) VALUES
      ('LMV', 'Light Motor Vehicle'),
      ('HMV', 'Heavy Motor Vehicle'),
      ('HAZMAT', 'Hazardous Materials')
      ON CONFLICT (name) DO NOTHING;
    `);

    // Get IDs
    const { rows: regions } = await client.query('SELECT id, name FROM regions');
    const { rows: vehicleTypes } = await client.query('SELECT id, name FROM vehicle_types');
    const { rows: licenseCategories } = await client.query('SELECT id, name FROM license_categories');

    // 4. Insert Vehicles
    const vehicles = [
      { reg: 'MH-04-AB-1234', name: 'Alpha Truck', model: 'Volvo FH16', type: 'Truck', cap: 15000, odo: 45000, cost: 8500000, status: 'Available', region: 'North Hub' },
      { reg: 'DL-01-XY-9876', name: 'Beta Van', model: 'Tata Ace', type: 'Van', cap: 2000, odo: 12000, cost: 650000, status: 'On Trip', region: 'South Hub' },
      { reg: 'GJ-12-CD-5678', name: 'Gamma Reefer', model: 'Ashok Leyland', type: 'Reefer', cap: 10000, odo: 89000, cost: 4500000, status: 'In Shop', region: 'East Hub' },
      { reg: 'KA-05-EF-1122', name: 'Delta Van', model: 'Mahindra Bolero', type: 'Van', cap: 2500, odo: 34000, cost: 800000, status: 'Available', region: 'North Hub' }
    ];

    for (const v of vehicles) {
      const typeId = vehicleTypes.find(t => t.name === v.type)?.id || 1;
      const regionId = regions.find(r => r.name === v.region)?.id || 1;
      await client.query(`
        INSERT INTO vehicles (registration_number, name, model, vehicle_type_id, max_capacity, odometer, acquisition_cost, status, region_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (registration_number) DO NOTHING;
      `, [v.reg, v.name, v.model, typeId, v.cap, v.odo, v.cost, v.status, regionId]);
    }

    // 5. Insert Drivers
    const drivers = [
      { name: 'Rajesh Kumar', lic: 'DL-RK-001', cat: 'HMV', exp: '2028-05-20', phone: '9876543210', score: 92, status: 'Available' },
      { name: 'Suresh Singh', lic: 'DL-SS-002', cat: 'LMV', exp: '2026-11-15', phone: '9876543211', score: 85, status: 'On Trip' },
      { name: 'Amit Patel', lic: 'DL-AP-003', cat: 'HAZMAT', exp: '2027-02-10', phone: '9876543212', score: 98, status: 'Available' },
      { name: 'Vijay Sharma', lic: 'DL-VS-004', cat: 'HMV', exp: '2025-08-30', phone: '9876543213', score: 76, status: 'Suspended' }
    ];

    for (const d of drivers) {
      const catId = licenseCategories.find(c => c.name === d.cat)?.id || 1;
      await client.query(`
        INSERT INTO drivers (full_name, license_number, license_category_id, license_expiry_date, phone, safety_score, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (license_number) DO NOTHING;
      `, [d.name, d.lic, catId, d.exp, d.phone, d.score, d.status]);
    }

    // Get Vehicle and Driver IDs for trips
    const { rows: vRows } = await client.query('SELECT id, registration_number FROM vehicles');
    const { rows: dRows } = await client.query('SELECT id, license_number FROM drivers');

    // 6. Insert Trips
    if (vRows.length >= 2 && dRows.length >= 2) {
      const trips = [
        { tripNo: 'TRIP-2001', vId: vRows[0].id, dId: dRows[0].id, src: 'Mumbai', dest: 'Delhi', weight: 12000, dist: 1400, status: 'Completed' },
        { tripNo: 'TRIP-2002', vId: vRows[1].id, dId: dRows[1].id, src: 'Bangalore', dest: 'Chennai', weight: 1500, dist: 350, status: 'Dispatched' },
        { tripNo: 'TRIP-2003', vId: vRows[3].id, dId: dRows[2].id, src: 'Ahmedabad', dest: 'Surat', weight: 2000, dist: 280, status: 'Draft' }
      ];

      for (const t of trips) {
        await client.query(`
          INSERT INTO trips (trip_number, vehicle_id, driver_id, source, destination, cargo_weight, planned_distance, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (trip_number) DO NOTHING;
        `, [t.tripNo, t.vId, t.dId, t.src, t.dest, t.weight, t.dist, t.status]);
      }
    }

    // 7. Insert Workshops
    await client.query(`
      INSERT INTO workshops (name, address, contact_number, manager)
      SELECT 'Central Auto Repair', 'Mumbai', '9876543001', 'Sunil Manager'
      WHERE NOT EXISTS (SELECT 1 FROM workshops WHERE name = 'Central Auto Repair');

      INSERT INTO workshops (name, address, contact_number, manager)
      SELECT 'Highway Diesel Tech', 'Delhi', '9876543002', 'Ramesh Manager'
      WHERE NOT EXISTS (SELECT 1 FROM workshops WHERE name = 'Highway Diesel Tech');

      INSERT INTO workshops (name, address, contact_number, manager)
      SELECT 'Rapid Service Hub', 'Bangalore', '9876543003', 'Rajesh Manager'
      WHERE NOT EXISTS (SELECT 1 FROM workshops WHERE name = 'Rapid Service Hub');
    `);

    const { rows: wRows } = await client.query('SELECT id FROM workshops');

    // 8. Insert Maintenance Records
    if (vRows.length >= 2 && wRows.length >= 2) {
      const records = [
        { vId: vRows[0].id, wId: wRows[0].id, type: 'Routine Service', desc: 'Oil change and filters', est: 5000, act: 5500, tech: 'Sunil', status: 'Completed' },
        { vId: vRows[1].id, wId: null, type: 'Inspection', desc: 'Pre-trip check', est: 1000, act: null, tech: null, status: 'Scheduled' },
        { vId: vRows[2].id, wId: wRows[1].id, type: 'Repair', desc: 'Engine overhaul', est: 45000, act: null, tech: 'Ramesh', status: 'In Progress' }
      ];

      for (const r of records) {
        await client.query(`
          INSERT INTO maintenance_records (vehicle_id, workshop_id, maintenance_type, description, estimated_cost, actual_cost, technician_name, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [r.vId, r.wId, r.type, r.desc, r.est, r.act, r.tech, r.status]);
      }
    }

    // 9. Insert Fuel Logs
    if (vRows.length >= 2) {
      const fuels = [
        { vId: vRows[0].id, qty: 150.5, price: 92.5, odo: 44500, station: 'Reliance Petro', date: new Date().toISOString() },
        { vId: vRows[1].id, qty: 45.0, price: 95.0, odo: 11950, station: 'Indian Oil', date: new Date().toISOString() }
      ];

      for (const f of fuels) {
        await client.query(`
          INSERT INTO fuel_logs (vehicle_id, quantity, price_per_liter, total_cost, odometer_reading, fuel_station, fuel_date)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [f.vId, f.qty, f.price, f.qty * f.price, f.odo, f.station, f.date]);
      }
    }

    // 10. Insert Expenses
    if (vRows.length >= 2) {
      const exps = [
        { vId: vRows[0].id, type: 'Tolls', amount: 1500, desc: 'Highway toll', date: new Date().toISOString() },
        { vId: vRows[1].id, type: 'Fines', amount: 500, desc: 'Speeding ticket', date: new Date().toISOString() }
      ];

      for (const e of exps) {
        await client.query(`
          INSERT INTO expenses (vehicle_id, expense_type, amount, description, expense_date)
          VALUES ($1, $2, $3, $4, $5)
        `, [e.vId, e.type, e.amount, e.desc, e.date]);
      }
    }

    await client.query('COMMIT');
    console.log('Dummy data seeded successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error seeding data:', err);
  } finally {
    client.release();
    await pool.end();
  }
};

seedDummyData();
