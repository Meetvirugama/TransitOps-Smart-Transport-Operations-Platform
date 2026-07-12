const costEngine = require('./cost.engine');
const roiEngine = require('./roi.engine');
const efficiencyEngine = require('./efficiency.engine');
const dbPool = require('../../../config/database');

const getVehicleSummary = async (vehicleId) => {
  const [roi, efficiency] = await Promise.all([
    roiEngine.calculateROI(vehicleId),
    efficiencyEngine.calculateFuelEfficiency(vehicleId)
  ]);

  return {
    vehicleId,
    financials: roi,
    performance: efficiency
  };
};

const getTripSummary = async (tripId) => {
  // Get revenue for trip
  const revenueQuery = `SELECT COALESCE(SUM(amount), 0) as total_revenue FROM revenues WHERE trip_id = $1 AND is_deleted = false`;
  const { rows } = await dbPool.query(revenueQuery, [tripId]);
  const revenue = Number(rows[0].total_revenue);

  // Get costs for trip
  const costs = await costEngine.calculateTripCost(tripId);

  return {
    tripId,
    revenue,
    costs,
    profit: revenue - costs.totalCost
  };
};

const getGlobalSummary = async () => {
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
    costs: { fuel, expenses, maintenance, totalCost },
    profit: revenue - totalCost
  };
};

module.exports = {
  getVehicleSummary,
  getTripSummary,
  getGlobalSummary
};
