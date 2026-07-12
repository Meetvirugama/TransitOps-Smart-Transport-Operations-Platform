const dbPool = require('../config/database');

const getUserByEmail = async (email) => {
  const query = `
    SELECT u.id, u.email, u.password_hash, r.name as role
    FROM users u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN roles r ON ur.role_id = r.id
    WHERE u.email = $1;
  `;
  const { rows } = await dbPool.query(query, [email]);
  return rows[0] || null;
};

const createUser = async (email, passwordHash, roleName = 'Admin') => {
  const client = await dbPool.connect();
  try {
    await client.query('BEGIN');

    // Insert user
    const userQuery = `
      INSERT INTO users (email, password_hash)
      VALUES ($1, $2)
      RETURNING id, email;
    `;
    const userResult = await client.query(userQuery, [email, passwordHash]);
    const user = userResult.rows[0];

    // Get role ID
    const roleQuery = `SELECT id FROM roles WHERE name = $1`;
    const roleResult = await client.query(roleQuery, [roleName]);
    if (roleResult.rowCount === 0) {
      throw new Error(`Role ${roleName} not found`);
    }
    const roleId = roleResult.rows[0].id;

    // Assign role
    const userRoleQuery = `
      INSERT INTO user_roles (user_id, role_id)
      VALUES ($1, $2);
    `;
    await client.query(userRoleQuery, [user.id, roleId]);

    await client.query('COMMIT');
    return { ...user, role: roleName };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  getUserByEmail,
  createUser
};
