const dbPool = require('../../../config/database');

const create = async (data) => {
  const { trip_id, vehicle_id, customer_name, amount, payment_status, invoice_number, received_date, created_by } = data;
  const query = `
    INSERT INTO revenues (trip_id, vehicle_id, customer_name, amount, payment_status, invoice_number, received_date, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;
  const values = [trip_id, vehicle_id, customer_name, amount, payment_status, invoice_number, received_date, created_by];
  const { rows } = await dbPool.query(query, values);
  return rows[0];
};

const findById = async (id) => {
  const query = `SELECT * FROM revenues WHERE id = $1 AND is_deleted = false;`;
  const { rows } = await dbPool.query(query, [id]);
  return rows[0];
};

const findAll = async (limit = 10, offset = 0, filters = {}) => {
  let query = `SELECT * FROM revenues WHERE is_deleted = false`;
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
  if (filters.payment_status) {
    query += ` AND payment_status = $${paramCount++}`;
    values.push(filters.payment_status);
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
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
    UPDATE revenues
    SET ${fields.join(', ')}
    WHERE id = $${paramCount} AND is_deleted = false
    RETURNING *;
  `;
  const { rows } = await dbPool.query(query, values);
  return rows[0];
};

const softDelete = async (id) => {
  const query = `
    UPDATE revenues
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
