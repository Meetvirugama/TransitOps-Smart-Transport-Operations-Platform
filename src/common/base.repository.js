const dbPool = require('../config/database');

/**
 * Generic repository for standard CRUD on any table.
 * Subclasses only need to define the table name and any custom queries.
 */
class BaseRepository {
  constructor(table) {
    this.table = table;
  }

  async findById(id) {
    const { rows } = await dbPool.query(
      `SELECT * FROM ${this.table} WHERE id = $1 AND is_deleted = false`,
      [id]
    );
    return rows[0];
  }

  async findAll(limit = 10, offset = 0, conditions = '', params = []) {
    const { rows } = await dbPool.query(
      `SELECT * FROM ${this.table} WHERE is_deleted = false${conditions} ORDER BY id ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );
    return rows;
  }

  async findOneWhere(conditions, params) {
    const { rows } = await dbPool.query(
      `SELECT * FROM ${this.table} WHERE ${conditions} AND is_deleted = false LIMIT 1`,
      params
    );
    return rows[0];
  }

  async insert(columns, values) {
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const { rows } = await dbPool.query(
      `INSERT INTO ${this.table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    return rows[0];
  }

  async update(id, data) {
    const entries = Object.entries(data).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return this.findById(id);
    const sets = entries.map(([k], i) => `${k} = $${i + 1}`).join(', ');
    const vals = entries.map(([, v]) => v);
    const { rows } = await dbPool.query(
      `UPDATE ${this.table} SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE id = $${vals.length + 1} AND is_deleted = false RETURNING *`,
      [...vals, id]
    );
    return rows[0];
  }

  async softDelete(id) {
    const { rows } = await dbPool.query(
      `UPDATE ${this.table} SET is_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND is_deleted = false RETURNING *`,
      [id]
    );
    return rows[0];
  }
}

module.exports = BaseRepository;
