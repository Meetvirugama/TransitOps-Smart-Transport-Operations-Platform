const dbPool = require('../../../config/database');

const calculateVehicleCost = async (vehicleId) => {
  const query = `
    SELECT 
      COALESCE((SELECT SUM(total_cost) FROM fuel_logs WHERE vehicle_id = $1 AND is_deleted = false), 0) as total_fuel_cost,
      COALESCE((SELECT SUM(amount) FROM expenses WHERE vehicle_id = $1 AND is_deleted = false), 0) as total_expenses,
      COALESCE((SELECT SUM(actual_cost) FROM maintenance_records WHERE vehicle_id = $1 AND status = 'Completed' AND is_deleted = false), 0) as total_maintenance_cost
  `;
  const { rows } = await dbPool.query(query, [vehicleId]);
  
  const fuelCost = Number(rows[0].total_fuel_cost);
  const expenses = Number(rows[0].total_expenses);
  const maintenanceCost = Number(rows[0].total_maintenance_cost);
  const totalCost = fuelCost + expenses + maintenanceCost;

  return { fuelCost, expenses, maintenanceCost, totalCost };
};

const calculateTripCost = async (tripId) => {
  const query = `
    SELECT 
      COALESCE((SELECT SUM(total_cost) FROM fuel_logs WHERE trip_id = $1 AND is_deleted = false), 0) as total_fuel_cost,
      COALESCE((SELECT SUM(amount) FROM expenses WHERE trip_id = $1 AND is_deleted = false), 0) as total_expenses
  `;
  const { rows } = await dbPool.query(query, [tripId]);

  const fuelCost = Number(rows[0].total_fuel_cost);
  const expenses = Number(rows[0].total_expenses);
  const totalCost = fuelCost + expenses;

  return { fuelCost, expenses, totalCost };
};

module.exports = {
  calculateVehicleCost,
  calculateTripCost
};
