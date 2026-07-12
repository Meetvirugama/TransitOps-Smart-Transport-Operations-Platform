const dbPool = require('../../../config/database');
const costEngine = require('./cost.engine');
const vehicleRepo = require('../../vehicles/vehicle.repository');

const calculateROI = async (vehicleId) => {
  // 1. Get Acquisition Cost
  const vehicle = await vehicleRepo.findById(vehicleId);
  if (!vehicle) throw new Error('Vehicle not found');
  
  // We assume there might be a purchase_price on vehicle. If not, default to 50000 for calculation demonstration if undefined
  const acquisitionCost = vehicle.purchase_price ? Number(vehicle.purchase_price) : 50000; 

  // 2. Get Revenue
  const revenueQuery = `SELECT COALESCE(SUM(amount), 0) as total_revenue FROM revenues WHERE vehicle_id = $1 AND is_deleted = false`;
  const { rows } = await dbPool.query(revenueQuery, [vehicleId]);
  const revenue = Number(rows[0].total_revenue);

  // 3. Get Costs
  const costs = await costEngine.calculateVehicleCost(vehicleId);
  
  // 4. Calculate ROI
  const netProfit = revenue - costs.totalCost;
  
  let roi = 0;
  if (acquisitionCost > 0) {
    roi = (netProfit / acquisitionCost) * 100;
  }

  return {
    revenue,
    costs,
    netProfit,
    acquisitionCost,
    roiPercentage: Number(roi.toFixed(2))
  };
};

module.exports = {
  calculateROI
};
