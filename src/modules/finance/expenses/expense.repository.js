const dbPool = require('../../../config/database');

const create = async (data) => {
  const { vehicle_id, trip_id, expense_type, amount, expense_date, description, created_by } = data;
  const query = `
    INSERT INTO expenses (vehicle_id, trip_id, expense_type, amount, expense_date, description, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const values = [vehicle_id, trip_id, expense_type, amount, expense_date || new Date(), description, created_by];
  const { rows } = await dbPool.query(query, values);
  return rows[0];
};

const findById = async (id) => {
  const query = `SELECT * FROM expenses WHERE id = $1 AND is_deleted = false;`;
  const { rows } = await dbPool.query(query, [id]);
  return rows[0];
};

const findAll = async (limit = 10, offset = 0, filters = {}) => {
  let query = `SELECT * FROM expenses WHERE is_deleted = false`;
  const values = [];
  let paramCount = 1;

  if (filters.vehicle_id) {
    query += ` AND vehicle_id = $${paramCount++}`;
    values.push(filters.vehicle_id);
  }
  if (filters.trip_id) {
    query += ` AND trip_id = $${paramCount++}`;
    values.push(filters.trip_id);
  }
  if (filters.expense_type) {
    query += ` AND expense_type = $${paramCount++}`;
    values.push(filters.expense_type);
  }

  query += ` ORDER BY expense_date DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
  values.push(limit, offset);
  
  const { rows } = await dbPool.query(query, values);
  return rows;
};

const update = async (id, data) => {
  const fields = [];
  const values = [];
  let paramCount = 1;
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = $${paramCount++}`);
      values.push(value);
    }
  }
  if (fields.length === 0) return await findById(id);
  
  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE expenses
    SET ${fields.join(', ')}
    WHERE id = $${paramCount} AND is_deleted = false
    RETURNING *;
  `;
  const { rows } = await dbPool.query(query, values);
  return rows[0];
};

const softDelete = async (id) => {
  const query = `
    UPDATE expenses
    SET is_deleted = true, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND is_deleted = false
    RETURNING *;
  `;
  const { rows } = await dbPool.query(query, [id]);
  return rows[0];
};

module.exports = {
  create,
  findById,
  findAll,
  update,
  softDelete
};
