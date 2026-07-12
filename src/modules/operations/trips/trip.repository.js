const dbPool = require('../../../config/database');

const create = async (tripData) => {
  const { trip_number, source, destination, cargo_weight, planned_distance, created_by } = tripData;
  const query = `
    INSERT INTO trips (trip_number, source, destination, cargo_weight, planned_distance, created_by)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const values = [trip_number, source, destination, cargo_weight, planned_distance, created_by];
  const { rows } = await dbPool.query(query, values);
  return rows[0];
};

const findById = async (id) => {
  const query = `
    SELECT t.*, v.registration_number, d.full_name as driver_name 
    FROM trips t
    LEFT JOIN vehicles v ON t.vehicle_id = v.id
    LEFT JOIN drivers d ON t.driver_id = d.id
    WHERE t.id = $1 AND t.is_deleted = false;
  `;
  const { rows } = await dbPool.query(query, [id]);
  return rows[0];
};

const findByNumber = async (trip_number) => {
  const query = `SELECT * FROM trips WHERE trip_number = $1 AND is_deleted = false;`;
  const { rows } = await dbPool.query(query, [trip_number]);
  return rows[0];
};

const findAll = async (limit = 10, offset = 0, filters = {}) => {
  let query = `
    SELECT t.*, v.registration_number, d.full_name as driver_name 
    FROM trips t
    LEFT JOIN vehicles v ON t.vehicle_id = v.id
    LEFT JOIN drivers d ON t.driver_id = d.id
    WHERE t.is_deleted = false
  `;
  const values = [];
  let paramCount = 1;

  if (filters.status) {
    query += ` AND t.status = $${paramCount++}`;
    values.push(filters.status);
  }
  if (filters.driver_id) {
    query += ` AND t.driver_id = $${paramCount++}`;
    values.push(filters.driver_id);
  }
  if (filters.vehicle_id) {
    query += ` AND t.vehicle_id = $${paramCount++}`;
    values.push(filters.vehicle_id);
  }

  query += ` ORDER BY t.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
  values.push(limit, offset);

  const { rows } = await dbPool.query(query, values);
  return rows;
};

const update = async (id, tripData) => {
  const fields = [];
  const values = [];
  let paramCount = 1;
  
  for (const [key, value] of Object.entries(tripData)) {
    if (value !== undefined) {
      fields.push(`${key} = $${paramCount++}`);
      values.push(value);
    }
  }
  if (fields.length === 0) return await findById(id);
  
  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE trips
    SET ${fields.join(', ')}
    WHERE id = $${paramCount} AND is_deleted = false
    RETURNING *;
  `;
  const { rows } = await dbPool.query(query, values);
  return rows[0];
};

module.exports = {
  create,
  findById,
  findByNumber,
  findAll,
  update
};
