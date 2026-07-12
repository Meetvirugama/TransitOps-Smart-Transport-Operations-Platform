const dbPool = require('../../../config/database');

const getVehicleCounts = async (filters = {}) => {
  let query = `
    SELECT 
      COUNT(*) FILTER (WHERE is_deleted = false) as total,
      COUNT(*) FILTER (WHERE status = 'Available' AND is_deleted = false) as available,
      COUNT(*) FILTER (WHERE status = 'On Trip' AND is_deleted = false) as on_trip,
      COUNT(*) FILTER (WHERE status = 'In Shop' AND is_deleted = false) as in_shop,
      COUNT(*) FILTER (WHERE status = 'Retired' AND is_deleted = false) as retired
    FROM vehicles
    WHERE 1=1
  `;
  const params = [];
  let p = 1;
  if (filters.region_id) { query += ` AND region_id = $${p++}`; params.push(filters.region_id); }
  if (filters.vehicle_type_id) { query += ` AND vehicle_type_id = $${p++}`; params.push(filters.vehicle_type_id); }

  const { rows } = await dbPool.query(query, params);
  return {
    total: Number(rows[0].total),
    available: Number(rows[0].available),
    onTrip: Number(rows[0].on_trip),
    inShop: Number(rows[0].in_shop),
    retired: Number(rows[0].retired)
  };
};

const getTripCounts = async (filters = {}) => {
  let query = `
    SELECT 
      COUNT(*) FILTER (WHERE is_deleted = false) as total,
      COUNT(*) FILTER (WHERE status = 'Draft' AND is_deleted = false) as draft,
      COUNT(*) FILTER (WHERE status = 'Dispatched' AND is_deleted = false) as active,
      COUNT(*) FILTER (WHERE status = 'Completed' AND is_deleted = false) as completed,
      COUNT(*) FILTER (WHERE status = 'Cancelled' AND is_deleted = false) as cancelled
    FROM trips
    WHERE 1=1
  `;
  const params = [];
  let p = 1;
  if (filters.vehicle_id) { query += ` AND vehicle_id = $${p++}`; params.push(filters.vehicle_id); }

  const { rows } = await dbPool.query(query, params);
  return {
    total: Number(rows[0].total),
    draft: Number(rows[0].draft),
    active: Number(rows[0].active),
    completed: Number(rows[0].completed),
    cancelled: Number(rows[0].cancelled)
  };
};

const getDriverCounts = async () => {
  const query = `
    SELECT 
      COUNT(*) FILTER (WHERE is_deleted = false) as total,
      COUNT(*) FILTER (WHERE status = 'Available' AND is_deleted = false) as available,
      COUNT(*) FILTER (WHERE status = 'On Trip' AND is_deleted = false) as on_trip,
      COUNT(*) FILTER (WHERE status = 'Suspended' AND is_deleted = false) as suspended,
      COUNT(*) FILTER (WHERE status = 'Off Duty' AND is_deleted = false) as off_duty
    FROM drivers;
  `;
  const { rows } = await dbPool.query(query);
  return {
    total: Number(rows[0].total),
    available: Number(rows[0].available),
    onTrip: Number(rows[0].on_trip),
    suspended: Number(rows[0].suspended),
    offDuty: Number(rows[0].off_duty)
  };
};

const getFinancialMetrics = async () => {
  const query = `
    SELECT 
      COALESCE((SELECT SUM(amount) FROM revenues WHERE is_deleted = false), 0) as global_revenue,
      COALESCE((SELECT SUM(total_cost) FROM fuel_logs WHERE is_deleted = false), 0) as global_fuel,
      COALESCE((SELECT SUM(quantity) FROM fuel_logs WHERE is_deleted = false), 0) as global_fuel_liters,
      COALESCE((SELECT SUM(amount) FROM expenses WHERE is_deleted = false), 0) as global_expenses,
      COALESCE((SELECT SUM(actual_cost) FROM maintenance_records WHERE status = 'Completed' AND is_deleted = false), 0) as global_maintenance,
      COALESCE((SELECT SUM(planned_distance) FROM trips WHERE status = 'Completed' AND is_deleted = false), 0) as global_distance
  `;
  const { rows } = await dbPool.query(query);
  
  const revenue = Number(rows[0].global_revenue);
  const fuel = Number(rows[0].global_fuel);
  const fuelLiters = Number(rows[0].global_fuel_liters);
  const expenses = Number(rows[0].global_expenses);
  const maintenance = Number(rows[0].global_maintenance);
  const distance = Number(rows[0].global_distance);
  const totalCost = fuel + expenses + maintenance;

  return {
    revenue,
    totalCost,
    fuelCost: fuel,
    fuelLiters,
    distance,
    maintenanceCost: maintenance,
    otherExpenses: expenses,
    profit: revenue - totalCost
  };
};

// Get drivers whose license expires within N days
const getExpiringLicenses = async (daysAhead = 30) => {
  const query = `
    SELECT id, full_name, license_number, license_expiry_date, phone, email, status
    FROM drivers
    WHERE license_expiry_date <= NOW() + ($1 || ' days')::INTERVAL
      AND license_expiry_date >= NOW()
      AND is_deleted = false
    ORDER BY license_expiry_date ASC;
  `;
  const { rows } = await dbPool.query(query, [daysAhead]);
  return rows;
};

// Get expired licenses (already past)
const getExpiredLicenses = async () => {
  const query = `
    SELECT id, full_name, license_number, license_expiry_date, phone, email, status
    FROM drivers
    WHERE license_expiry_date < NOW()
      AND is_deleted = false
    ORDER BY license_expiry_date ASC;
  `;
  const { rows } = await dbPool.query(query);
  return rows;
};

// Top performer insights
const getInsights = async () => {
  const [mostActiveDriver, mostUsedVehicle, highestFuelVehicle] = await Promise.all([
    dbPool.query(`
      SELECT d.id, d.full_name, d.phone, COUNT(t.id) as trip_count
      FROM drivers d
      JOIN trips t ON t.driver_id = d.id AND t.status = 'Completed' AND t.is_deleted = false
      WHERE d.is_deleted = false
      GROUP BY d.id, d.full_name, d.phone
      ORDER BY trip_count DESC
      LIMIT 5;
    `),
    dbPool.query(`
      SELECT v.id, v.registration_number, v.name, COUNT(t.id) as trip_count
      FROM vehicles v
      JOIN trips t ON t.vehicle_id = v.id AND t.status = 'Completed' AND t.is_deleted = false
      WHERE v.is_deleted = false
      GROUP BY v.id, v.registration_number, v.name
      ORDER BY trip_count DESC
      LIMIT 5;
    `),
    dbPool.query(`
      SELECT v.id, v.registration_number, v.name, COALESCE(SUM(fl.total_cost), 0) as total_fuel_cost
      FROM vehicles v
      LEFT JOIN fuel_logs fl ON fl.vehicle_id = v.id AND fl.is_deleted = false
      WHERE v.is_deleted = false
      GROUP BY v.id, v.registration_number, v.name
      ORDER BY total_fuel_cost DESC
      LIMIT 5;
    `)
  ]);

  return {
    mostActiveDrivers: mostActiveDriver.rows,
    mostUsedVehicles: mostUsedVehicle.rows,
    highestFuelCostVehicles: highestFuelVehicle.rows
  };
};

module.exports = {
  getVehicleCounts,
  getTripCounts,
  getDriverCounts,
  getFinancialMetrics,
  getExpiringLicenses,
  getExpiredLicenses,
  getInsights
};

