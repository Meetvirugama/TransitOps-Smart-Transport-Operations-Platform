const dbPool = require('../../config/database');

const create = async (vehicleData) => {
  const { registration_number, name, model, vehicle_type_id, max_capacity, odometer, acquisition_cost, purchase_date, region_id, description } = vehicleData;
  const query = `
    INSERT INTO vehicles (registration_number, name, model, vehicle_type_id, max_capacity, odometer, acquisition_cost, purchase_date, region_id, description)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;
  const values = [registration_number, name, model, vehicle_type_id, max_capacity, odometer || 0, acquisition_cost || 0, purchase_date, region_id, description];
  const { rows } = await dbPool.query(query, values);
  return rows[0];
};

const findAll = async (limit = 10, offset = 0, filters = {}) => {
  let query = `
    SELECT v.*, vt.name as vehicle_type_name, r.name as region_name
    FROM vehicles v
    LEFT JOIN vehicle_types vt ON v.vehicle_type_id = vt.id
    LEFT JOIN regions r ON v.region_id = r.id
    WHERE v.is_deleted = false
  `;
  const values = [];
  let paramCount = 1;

  if (filters.status) {
    query += ` AND v.status = $${paramCount++}`;
    values.push(filters.status);
  }
  if (filters.region_id) {
    query += ` AND v.region_id = $${paramCount++}`;
    values.push(filters.region_id);
  }
  if (filters.vehicle_type_id) {
    query += ` AND v.vehicle_type_id = $${paramCount++}`;
    values.push(filters.vehicle_type_id);
  }

  query += ` ORDER BY v.id ASC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
  values.push(limit, offset);

  const { rows } = await dbPool.query(query, values);
  return rows;
};

const findById = async (id) => {
  const query = `
    SELECT v.*, vt.name as vehicle_type_name, r.name as region_name
    FROM vehicles v
    LEFT JOIN vehicle_types vt ON v.vehicle_type_id = vt.id
    LEFT JOIN regions r ON v.region_id = r.id
    WHERE v.id = $1 AND v.is_deleted = false;
  `;
  const { rows } = await dbPool.query(query, [id]);
  return rows[0];
};

const findByRegistration = async (regNum) => {
  const query = `SELECT * FROM vehicles WHERE registration_number = $1 AND is_deleted = false;`;
  const { rows } = await dbPool.query(query, [regNum]);
  return rows[0];
};

const update = async (id, vehicleData) => {
  const fields = [];
  const values = [];
  let paramCount = 1;
  
  for (const [key, value] of Object.entries(vehicleData)) {
    if (value !== undefined) {
      fields.push(`${key} = $${paramCount++}`);
      values.push(value);
    }
  }
  if (fields.length === 0) return await findById(id);
  
  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE vehicles
    SET ${fields.join(', ')}
    WHERE id = $${paramCount} AND is_deleted = false
    RETURNING *;
  `;
  const { rows } = await dbPool.query(query, values);
  return rows[0];
};

const softDelete = async (id) => {
  const query = `
    UPDATE vehicles
    SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND is_deleted = false
    RETURNING *;
  `;
  const { rows } = await dbPool.query(query, [id]);
  return rows[0];
};

module.exports = {
  create,
  findAll,
  findById,
  findByRegistration,
  update,
  softDelete
};
