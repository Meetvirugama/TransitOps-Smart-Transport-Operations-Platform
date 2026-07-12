const dbPool = require('../../../config/database');

const create = async (workshopData) => {
  const { name, address, contact_number, manager } = workshopData;
  const query = `
    INSERT INTO workshops (name, address, contact_number, manager)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [name, address, contact_number, manager];
  const { rows } = await dbPool.query(query, values);
  return rows[0];
};

const findById = async (id) => {
  const query = `SELECT * FROM workshops WHERE id = $1 AND is_deleted = false;`;
  const { rows } = await dbPool.query(query, [id]);
  return rows[0];
};

const findAll = async (limit = 10, offset = 0, status = null) => {
  let query = `SELECT * FROM workshops WHERE is_deleted = false`;
  const params = [];
  
  if (status) {
    query += ` AND status = $1`;
    params.push(status);
  }
  
  query += ` ORDER BY name ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);
  
  const { rows } = await dbPool.query(query, params);
  return rows;
};

const update = async (id, workshopData) => {
  const fields = [];
  const values = [];
  let paramCount = 1;
  
  for (const [key, value] of Object.entries(workshopData)) {
    if (value !== undefined) {
      fields.push(`${key} = $${paramCount++}`);
      values.push(value);
    }
  }
  if (fields.length === 0) return await findById(id);
  
  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE workshops
    SET ${fields.join(', ')}
    WHERE id = $${paramCount} AND is_deleted = false
    RETURNING *;
  `;
  const { rows } = await dbPool.query(query, values);
  return rows[0];
};

const softDelete = async (id) => {
  const query = `
    UPDATE workshops
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
