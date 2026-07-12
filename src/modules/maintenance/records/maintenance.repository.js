const dbPool = require('../../../config/database');

const create = async (data) => {
  const { vehicle_id, maintenance_type, description, estimated_cost, created_by } = data;
  const query = `
    INSERT INTO maintenance_records (vehicle_id, maintenance_type, description, estimated_cost, created_by)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [vehicle_id, maintenance_type, description, estimated_cost, created_by];
  const { rows } = await dbPool.query(query, values);
  return rows[0];
};

const findById = async (id) => {
  const query = `
    SELECT m.*, v.registration_number, w.name as workshop_name 
    FROM maintenance_records m
    LEFT JOIN vehicles v ON m.vehicle_id = v.id
    LEFT JOIN workshops w ON m.workshop_id = w.id
    WHERE m.id = $1 AND m.is_deleted = false;
  `;
  const { rows } = await dbPool.query(query, [id]);
  return rows[0];
};

const findActiveByVehicleId = async (vehicleId) => {
  const query = `
    SELECT * FROM maintenance_records 
    WHERE vehicle_id = $1 
    AND status IN ('Scheduled', 'In Progress') 
    AND is_deleted = false;
  `;
  const { rows } = await dbPool.query(query, [vehicleId]);
  return rows[0];
};

const findAll = async (limit = 10, offset = 0, filters = {}) => {
  let query = `
    SELECT m.*, v.registration_number, w.name as workshop_name 
    FROM maintenance_records m
    LEFT JOIN vehicles v ON m.vehicle_id = v.id
    LEFT JOIN workshops w ON m.workshop_id = w.id
    WHERE m.is_deleted = false
  `;
  const values = [];
  let paramCount = 1;

  if (filters.status) {
    query += ` AND m.status = $${paramCount++}`;
    values.push(filters.status);
  }
  if (filters.vehicle_id) {
    query += ` AND m.vehicle_id = $${paramCount++}`;
    values.push(filters.vehicle_id);
  }
  if (filters.workshop_id) {
    query += ` AND m.workshop_id = $${paramCount++}`;
    values.push(filters.workshop_id);
  }

  query += ` ORDER BY m.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
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
    UPDATE maintenance_records
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
  findActiveByVehicleId,
  findAll,
  update
};
