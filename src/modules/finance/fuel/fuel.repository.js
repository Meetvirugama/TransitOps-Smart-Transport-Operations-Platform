const dbPool = require('../../../config/database');

const create = async (data) => {
  const { vehicle_id, trip_id, driver_id, fuel_station, quantity, price_per_liter, total_cost, odometer_reading, fuel_date, remarks, created_by } = data;
  const query = `
    INSERT INTO fuel_logs (vehicle_id, trip_id, driver_id, fuel_station, quantity, price_per_liter, total_cost, odometer_reading, fuel_date, remarks, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *;
  `;
  const values = [vehicle_id, trip_id, driver_id, fuel_station, quantity, price_per_liter, total_cost, odometer_reading, fuel_date || new Date(), remarks, created_by];
  const { rows } = await dbPool.query(query, values);
  return rows[0];
};

const findById = async (id) => {
  const query = `SELECT * FROM fuel_logs WHERE id = $1 AND is_deleted = false;`;
  const { rows } = await dbPool.query(query, [id]);
  return rows[0];
};

const findAll = async (limit = 10, offset = 0, filters = {}) => {
  let query = `SELECT * FROM fuel_logs WHERE is_deleted = false`;
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
  if (filters.driver_id) {
    query += ` AND driver_id = $${paramCount++}`;
    values.push(filters.driver_id);
  }

  query += ` ORDER BY fuel_date DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
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
    UPDATE fuel_logs
    SET ${fields.join(', ')}
    WHERE id = $${paramCount} AND is_deleted = false
    RETURNING *;
  `;
  const { rows } = await dbPool.query(query, values);
  return rows[0];
};

const softDelete = async (id) => {
  const query = `
    UPDATE fuel_logs
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
