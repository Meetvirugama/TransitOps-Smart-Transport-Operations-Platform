const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const seedUsers = async () => {
  const client = await pool.connect();
  try {
    console.log('Seeding demo users...');
    await client.query('BEGIN');

    const demoUsers = [
      { email: 'manager@transitops.in', role: 'Fleet Manager' },
      { email: 'dispatcher@transitops.in', role: 'Dispatcher' },
      { email: 'safety@transitops.in', role: 'Safety Officer' },
      { email: 'finance@transitops.in', role: 'Financial Analyst' },
      { email: 'raven.k@transitops.in', role: 'Fleet Manager' }
    ];

    const passwordHash = await bcrypt.hash('admin123', 10);

    for (const user of demoUsers) {
      // Get role ID
      const roleRes = await client.query('SELECT id FROM roles WHERE name = $1', [user.role]);
      let roleId;
      if (roleRes.rows.length > 0) {
        roleId = roleRes.rows[0].id;
      } else {
        const insertRole = await client.query('INSERT INTO roles (name) VALUES ($1) RETURNING id', [user.role]);
        roleId = insertRole.rows[0].id;
      }

      // Insert User
      const userRes = await client.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING RETURNING id',
        [user.email, passwordHash]
      );
      
      let userId;
      if (userRes.rows.length > 0) {
        userId = userRes.rows[0].id;
      } else {
        const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [user.email]);
        userId = existingUser.rows[0].id;
      }

      // Link User to Role
      await client.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT (user_id, role_id) DO NOTHING',
        [userId, roleId]
      );
      
      console.log(`Seeded user: ${user.email} as ${user.role}`);
    }

    // Seed some basic categories and regions so the app has data to pick from when creating vehicles
    const categories = ['LMV', 'HMV', 'HMV-Trailer'];
    for (const cat of categories) {
      await client.query('INSERT INTO license_categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [cat]);
    }
    
    const regions = ['North', 'South', 'East', 'West'];
    for (const region of regions) {
      await client.query('INSERT INTO regions (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [region]);
    }
    
    const vTypes = [
      { name: 'Van', cap: 1000 },
      { name: 'Truck', cap: 5000 },
      { name: 'Mini', cap: 500 }
    ];
    for (const vt of vTypes) {
      await client.query('INSERT INTO vehicle_types (name, max_default_capacity) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING', [vt.name, vt.cap]);
    }

    await client.query('COMMIT');
    console.log('Seed completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding users:', error);
  } finally {
    client.release();
    pool.end();
  }
};

seedUsers();
