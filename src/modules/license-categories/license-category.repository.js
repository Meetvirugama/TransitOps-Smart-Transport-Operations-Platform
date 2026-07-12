const dbPool = require('../../config/database');

const create = async (name, description) => {
  const query = `
    INSERT INTO license_categories (name, description)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const { rows } = await dbPool.query(query, [name, description]);
  return rows[0];
};

const findAll = async (limit = 10, offset = 0) => {
  const query = `
    SELECT * FROM license_categories
    WHERE is_deleted = false
    ORDER BY id ASC
    LIMIT $1 OFFSET $2;
  `;
  const { rows } = await dbPool.query(query, [limit, offset]);
  return rows;
};

const findById = async (id) => {
  const query = `
    SELECT * FROM license_categories
    WHERE id = $1 AND is_deleted = false;
  `;
  const { rows } = await dbPool.query(query, [id]);
  return rows[0];
};

const update = async (id, name, description) => {
  const query = `
    UPDATE license_categories
    SET name = COALESCE($2, name),
        description = COALESCE($3, description),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND is_deleted = false
    RETURNING *;
  `;
  const { rows } = await dbPool.query(query, [id, name, description]);
  return rows[0];
};

const softDelete = async (id) => {
  const query = `
    UPDATE license_categories
    SET is_deleted = true,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND is_deleted = false
    RETURNING *;
  `;
  const { rows } = await dbPool.query(query, [id]);
  return rows[0];
};

const findByName = async (name) => {
  const query = `
    SELECT * FROM license_categories
    WHERE name = $1 AND is_deleted = false;
  `;
  const { rows } = await dbPool.query(query, [name]);
  return rows[0];
};

module.exports = {
  create,
  findAll,
  findById,
  update,
  softDelete,
  findByName
};
