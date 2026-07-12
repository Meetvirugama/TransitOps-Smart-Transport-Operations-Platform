const dbPool = require('../../../config/database');

const getVehicleCounts = async () => {
  const query = `
    SELECT 
      COUNT(*) FILTER (WHERE is_deleted = false) as total,
      COUNT(*) FILTER (WHERE status = 'Available' AND is_deleted = false) as available,
      COUNT(*) FILTER (WHERE status = 'On Trip' AND is_deleted = false) as on_trip,
      COUNT(*) FILTER (WHERE status = 'In Shop' AND is_deleted = false) as in_shop
    FROM vehicles;
  `;
  const { rows } = await dbPool.query(query);
  return {
    total: Number(rows[0].total),
    available: Number(rows[0].available),
    onTrip: Number(rows[0].on_trip),
    inShop: Number(rows[0].in_shop)
  };
};

const getTripCounts = async () => {
  const query = `
    SELECT 
      COUNT(*) FILTER (WHERE is_deleted = false) as total,
      COUNT(*) FILTER (WHERE status = 'Draft' AND is_deleted = false) as draft,
      COUNT(*) FILTER (WHERE status = 'Dispatched' AND is_deleted = false) as active,
      COUNT(*) FILTER (WHERE status = 'Completed' AND is_deleted = false) as completed
    FROM trips;
  `;
  const { rows } = await dbPool.query(query);
  return {
    total: Number(rows[0].total),
    draft: Number(rows[0].draft),
    active: Number(rows[0].active),
    completed: Number(rows[0].completed)
  };
};

const getDriverCounts = async () => {
  const query = `
    SELECT 
      COUNT(*) FILTER (WHERE is_deleted = false) as total,
      COUNT(*) FILTER (WHERE status = 'Available' AND is_deleted = false) as available,
      COUNT(*) FILTER (WHERE status = 'On Trip' AND is_deleted = false) as on_trip
    FROM drivers;
  `;
  const { rows } = await dbPool.query(query);
  return {
    total: Number(rows[0].total),
    available: Number(rows[0].available),
    onTrip: Number(rows[0].on_trip)
  };
};

const getFinancialMetrics = async () => {
  const query = `
    SELECT 
      COALESCE((SELECT SUM(amount) FROM revenues WHERE is_deleted = false), 0) as global_revenue,
      COALESCE((SELECT SUM(total_cost) FROM fuel_logs WHERE is_deleted = false), 0) as global_fuel,
      COALESCE((SELECT SUM(amount) FROM expenses WHERE is_deleted = false), 0) as global_expenses,
      COALESCE((SELECT SUM(actual_cost) FROM maintenance_records WHERE status = 'Completed' AND is_deleted = false), 0) as global_maintenance
  `;
  const { rows } = await dbPool.query(query);
  
  const revenue = Number(rows[0].global_revenue);
  const fuel = Number(rows[0].global_fuel);
  const expenses = Number(rows[0].global_expenses);
  const maintenance = Number(rows[0].global_maintenance);
  const totalCost = fuel + expenses + maintenance;

  return {
    revenue,
    totalCost,
    profit: revenue - totalCost
  };
};

module.exports = {
  getVehicleCounts,
  getTripCounts,
  getDriverCounts,
  getFinancialMetrics
};
