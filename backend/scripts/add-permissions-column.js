const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const run = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Add column
    await client.query(`
      ALTER TABLE roles 
      ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb;
    `);
    
    console.log('Added permissions column to roles table.');

    // 2. Define default permissions mapping
    const defaultPermissions = {
      'Admin': {
        can_view_dashboard: true,
        can_view_fleet: true,
        can_manage_fleet: true,
        can_view_drivers: true,
        can_manage_drivers: true,
        can_view_trips: true,
        can_manage_trips: true,
        can_view_maintenance: true,
        can_manage_maintenance: true,
        can_view_finance: true,
        can_manage_finance: true,
        can_view_analytics: true,
        can_manage_settings: true
      },
      'Fleet Manager': {
        can_view_dashboard: true,
        can_view_fleet: true,
        can_manage_fleet: true,
        can_view_drivers: true,
        can_manage_drivers: true,
        can_view_trips: true,
        can_manage_trips: false,
        can_view_maintenance: true,
        can_manage_maintenance: true,
        can_view_finance: true,
        can_manage_finance: false,
        can_view_analytics: true,
        can_manage_settings: false
      },
      'Dispatcher': {
        can_view_dashboard: true,
        can_view_fleet: true,
        can_manage_fleet: false,
        can_view_drivers: true,
        can_manage_drivers: false,
        can_view_trips: true,
        can_manage_trips: true,
        can_view_maintenance: false,
        can_manage_maintenance: false,
        can_view_finance: true,
        can_manage_finance: true,
        can_view_analytics: false,
        can_manage_settings: false
      },
      'Safety Officer': {
        can_view_dashboard: true,
        can_view_fleet: true,
        can_manage_fleet: false,
        can_view_drivers: true,
        can_manage_drivers: false,
        can_view_trips: true,
        can_manage_trips: false,
        can_view_maintenance: true,
        can_manage_maintenance: false,
        can_view_finance: false,
        can_manage_finance: false,
        can_view_analytics: true,
        can_manage_settings: false
      },
      'Financial Analyst': {
        can_view_dashboard: true,
        can_view_fleet: true,
        can_manage_fleet: false,
        can_view_drivers: true,
        can_manage_drivers: false,
        can_view_trips: true,
        can_manage_trips: false,
        can_view_maintenance: true,
        can_manage_maintenance: false,
        can_view_finance: true,
        can_manage_finance: false,
        can_view_analytics: true,
        can_manage_settings: false
      }
    };

    // 3. Update existing roles
    for (const [roleName, perms] of Object.entries(defaultPermissions)) {
      await client.query(
        'UPDATE roles SET permissions = $1 WHERE name = $2',
        [JSON.stringify(perms), roleName]
      );
      console.log(`Updated permissions for ${roleName}`);
    }

    await client.query('COMMIT');
    console.log('Migration completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
  } finally {
    client.release();
    pool.end();
  }
};

run();
