const dbPool = require('../../../config/database');
const { AppError, NotFoundError } = require('../../../common/exceptions');

// Helper to execute a query within a transaction
const withTransaction = async (callback) => {
  const client = await dbPool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getAvailableVehicles = async (regionId = null) => {
  let query = `
    SELECT v.*, vt.name as vehicle_type_name, r.name as region_name
    FROM vehicles v
    LEFT JOIN vehicle_types vt ON v.vehicle_type_id = vt.id
    LEFT JOIN regions r ON v.region_id = r.id
    WHERE v.status = 'Available' AND v.is_deleted = false
  `;
  const params = [];
  if (regionId) {
    query += ` AND v.region_id = $1`;
    params.push(regionId);
  }
  const { rows } = await dbPool.query(query, params);
  return rows;
};

const getAvailableDrivers = async (licenseCategoryId = null) => {
  let query = `
    SELECT d.*, lc.name as license_category_name
    FROM drivers d
    LEFT JOIN license_categories lc ON d.license_category_id = lc.id
    WHERE d.status = 'Available' AND d.is_deleted = false
  `;
  const params = [];
  if (licenseCategoryId) {
    query += ` AND d.license_category_id = $1`;
    params.push(licenseCategoryId);
  }
  const { rows } = await dbPool.query(query, params);
  return rows;
};

const reserveVehicle = async (vehicleId) => {
  return withTransaction(async (client) => {
    // SELECT FOR UPDATE locks the row to prevent race conditions
    const { rows } = await client.query(
      `SELECT status FROM vehicles WHERE id = $1 AND is_deleted = false FOR UPDATE`,
      [vehicleId]
    );

    if (rows.length === 0) throw new NotFoundError('Vehicle not found');
    if (rows[0].status !== 'Available') throw new AppError(`Cannot reserve vehicle. Current status is ${rows[0].status}`, 400);

    const updateRes = await client.query(
      `UPDATE vehicles SET status = 'Reserved', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [vehicleId]
    );
    return updateRes.rows[0];
  });
};

const releaseVehicle = async (vehicleId) => {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `SELECT status FROM vehicles WHERE id = $1 AND is_deleted = false FOR UPDATE`,
      [vehicleId]
    );

    if (rows.length === 0) throw new NotFoundError('Vehicle not found');
    
    // Can release if it was reserved or on trip. If it's In Shop, it stays In Shop until maintenance completes.
    const updateRes = await client.query(
      `UPDATE vehicles SET status = 'Available', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [vehicleId]
    );
    return updateRes.rows[0];
  });
};

const reserveDriver = async (driverId) => {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `SELECT status FROM drivers WHERE id = $1 AND is_deleted = false FOR UPDATE`,
      [driverId]
    );

    if (rows.length === 0) throw new NotFoundError('Driver not found');
    if (rows[0].status !== 'Available') throw new AppError(`Cannot reserve driver. Current status is ${rows[0].status}`, 400);

    const updateRes = await client.query(
      `UPDATE drivers SET status = 'Reserved', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [driverId]
    );
    return updateRes.rows[0];
  });
};

const releaseDriver = async (driverId) => {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `SELECT status FROM drivers WHERE id = $1 AND is_deleted = false FOR UPDATE`,
      [driverId]
    );

    if (rows.length === 0) throw new NotFoundError('Driver not found');

    const updateRes = await client.query(
      `UPDATE drivers SET status = 'Available', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [driverId]
    );
    return updateRes.rows[0];
  });
};

const changeVehicleStatus = async (vehicleId, status) => {
  const allowedStatuses = ['Available', 'On Trip', 'In Shop', 'Retired'];
  if (!allowedStatuses.includes(status)) throw new AppError('Invalid status', 400);

  const { rows } = await dbPool.query(
    `UPDATE vehicles SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND is_deleted = false RETURNING *`,
    [status, vehicleId]
  );
  if (rows.length === 0) throw new NotFoundError('Vehicle not found');
  return rows[0];
};

const changeDriverStatus = async (driverId, status) => {
  const allowedStatuses = ['Available', 'On Trip', 'Off Duty', 'Suspended'];
  if (!allowedStatuses.includes(status)) throw new AppError('Invalid status', 400);

  const { rows } = await dbPool.query(
    `UPDATE drivers SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND is_deleted = false RETURNING *`,
    [status, driverId]
  );
  if (rows.length === 0) throw new NotFoundError('Driver not found');
  return rows[0];
};

const getFleetStatistics = async () => {
  // Aggregate vehicle stats
  const vStats = await dbPool.query(`
    SELECT status, COUNT(*) as count 
    FROM vehicles 
    WHERE is_deleted = false 
    GROUP BY status
  `);
  
  // Aggregate driver stats
  const dStats = await dbPool.query(`
    SELECT status, COUNT(*) as count 
    FROM drivers 
    WHERE is_deleted = false 
    GROUP BY status
  `);

  const stats = {
    vehicles: {},
    drivers: {}
  };

  vStats.rows.forEach(r => stats.vehicles[r.status] = parseInt(r.count));
  dStats.rows.forEach(r => stats.drivers[r.status] = parseInt(r.count));

  return stats;
};

module.exports = {
  getAvailableVehicles,
  getAvailableDrivers,
  reserveVehicle,
  releaseVehicle,
  reserveDriver,
  releaseDriver,
  changeVehicleStatus,
  changeDriverStatus,
  getFleetStatistics
};
