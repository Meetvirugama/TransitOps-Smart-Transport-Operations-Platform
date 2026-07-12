const dbPool = require('../../config/database');
const BaseRepository = require('../../common/base.repository');

class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  // Override findAll to join with roles
  async findAll({ search, limit, offset }) {
    let query = `
      SELECT u.id, u.email, u.created_at, r.name as role, r.id as role_id, r.permissions
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
    `;
    const params = [];
    
    if (search) {
      query += ` WHERE u.email ILIKE $1`;
      params.push(`%${search}%`);
    }
    
    query += ` ORDER BY u.id ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const { rows } = await dbPool.query(query, params);
    
    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) FROM users u`;
    const countParams = [];
    if (search) {
      countQuery += ` WHERE u.email ILIKE $1`;
      countParams.push(`%${search}%`);
    }
    const { rows: countRows } = await dbPool.query(countQuery, countParams);
    
    return { rows, total: parseInt(countRows[0].count, 10) };
  }

  async updateUserRole(userId, roleId) {
    const query = `
      INSERT INTO user_roles (user_id, role_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id) 
      DO UPDATE SET role_id = EXCLUDED.role_id
      RETURNING *;
    `;
    const { rows } = await dbPool.query(query, [userId, roleId]);
    return rows[0];
  }
}

module.exports = new UserRepository();
