const dbPool = require('../../config/database');

const createOrUpdate = async (userId, profileData) => {
  const { employee_name, phone, department, profile_photo } = profileData;
  const query = `
    INSERT INTO profiles (user_id, employee_name, phone, department, profile_photo)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      employee_name = EXCLUDED.employee_name,
      phone = EXCLUDED.phone,
      department = EXCLUDED.department,
      profile_photo = EXCLUDED.profile_photo,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;
  const values = [userId, employee_name, phone, department, profile_photo];
  const { rows } = await dbPool.query(query, values);
  return rows[0];
};

const findByUserId = async (userId) => {
  const query = `
    SELECT p.*, u.email, r.name as role
    FROM profiles p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
    WHERE p.user_id = $1;
  `;
  const { rows } = await dbPool.query(query, [userId]);
  return rows[0];
};

const findAll = async (limit = 10, offset = 0) => {
  const query = `
    SELECT p.*, u.email, r.name as role
    FROM profiles p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
    ORDER BY p.id ASC
    LIMIT $1 OFFSET $2;
  `;
  const { rows } = await dbPool.query(query, [limit, offset]);
  return rows;
};

module.exports = {
  createOrUpdate,
  findByUserId,
  findAll
};
