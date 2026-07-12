const dbPool = require('../../config/database');

const create = async (driverData) => {
  const { full_name, license_number, license_category_id, license_expiry_date, phone, email, safety_score, address, joining_date } = driverData;
  const query = `
    INSERT INTO drivers (full_name, license_number, license_category_id, license_expiry_date, phone, email, safety_score, address, joining_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `;
  const values = [full_name, license_number, license_category_id, license_expiry_date, phone, email, safety_score || 100, address, joining_date];
  const { rows } = await dbPool.query(query, values);
  return rows[0];
};

const findAll = async (limit = 10, offset = 0, filters = {}) => {
  let query = `
    SELECT d.*, lc.name as license_category_name
    FROM drivers d
    LEFT JOIN license_categories lc ON d.license_category_id = lc.id
    WHERE d.is_deleted = false
  `;
  const values = [];
  let paramCount = 1;

  if (filters.status) {
    query += ` AND d.status = $${paramCount++}`;
    values.push(filters.status);
  }
  if (filters.license_category_id) {
    query += ` AND d.license_category_id = $${paramCount++}`;
    values.push(filters.license_category_id);
  }

  query += ` ORDER BY d.id ASC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
  values.push(limit, offset);

  const { rows } = await dbPool.query(query, values);
  return rows;
};

const findById = async (id) => {
  const query = `
    SELECT d.*, lc.name as license_category_name
    FROM drivers d
    LEFT JOIN license_categories lc ON d.license_category_id = lc.id
    WHERE d.id = $1 AND d.is_deleted = false;
  `;
  const { rows } = await dbPool.query(query, [id]);
  return rows[0];
};

const findByLicense = async (licenseNum) => {
  const query = `SELECT * FROM drivers WHERE license_number = $1 AND is_deleted = false;`;
  const { rows } = await dbPool.query(query, [licenseNum]);
  return rows[0];
};

const update = async (id, driverData) => {
  const fields = [];
  const values = [];
  let paramCount = 1;
  
  for (const [key, value] of Object.entries(driverData)) {
    if (value !== undefined) {
      fields.push(`${key} = $${paramCount++}`);
      values.push(value);
    }
  }
  if (fields.length === 0) return await findById(id);
  
  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE drivers
    SET ${fields.join(', ')}
    WHERE id = $${paramCount} AND is_deleted = false
    RETURNING *;
  `;
  const { rows } = await dbPool.query(query, values);
  return rows[0];
};

const softDelete = async (id) => {
  const query = `
    UPDATE drivers
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
  findByLicense,
  update,
  softDelete
};
