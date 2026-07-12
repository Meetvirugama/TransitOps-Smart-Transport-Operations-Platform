const dbPool = require('../../config/database');
const BaseRepository = require('../../common/base.repository');

class RoleRepository extends BaseRepository {
  constructor() {
    super('roles');
  }

  // Override to include permissions in the search
  async findAll({ search, limit, offset }) {
    let query = `SELECT id, name, permissions FROM roles`;
    const params = [];
    
    if (search) {
      query += ` WHERE name ILIKE $1`;
      params.push(`%${search}%`);
    }
    
    query += ` ORDER BY id ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const { rows } = await dbPool.query(query, params);
    
    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) FROM roles`;
    const countParams = [];
    if (search) {
      countQuery += ` WHERE name ILIKE $1`;
      countParams.push(`%${search}%`);
    }
    const { rows: countRows } = await dbPool.query(countQuery, countParams);
    
    return { rows, total: parseInt(countRows[0].count, 10) };
  }
}

module.exports = new RoleRepository();
