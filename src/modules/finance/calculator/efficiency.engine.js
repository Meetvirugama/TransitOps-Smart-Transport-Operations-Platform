const dbPool = require('../../../config/database');

const calculateFuelEfficiency = async (vehicleId) => {
  const query = `
    SELECT 
      SUM(actual_distance) as total_distance
    FROM trips 
    WHERE vehicle_id = $1 AND status = 'Completed' AND is_deleted = false;
  `;
  
  const fuelQuery = `
    SELECT SUM(quantity) as total_fuel
    FROM fuel_logs
    WHERE vehicle_id = $1 AND is_deleted = false;
  `;

  const [tripResult, fuelResult] = await Promise.all([
    dbPool.query(query, [vehicleId]),
    dbPool.query(fuelQuery, [vehicleId])
  ]);

  const totalDistance = Number(tripResult.rows[0].total_distance || 0);
  const totalFuel = Number(fuelResult.rows[0].total_fuel || 0);

  if (totalFuel === 0) {
    return { totalDistance, totalFuel, efficiency: 0 };
  }

  const efficiency = totalDistance / totalFuel;

  return {
    totalDistance,
    totalFuel,
    efficiency: Number(efficiency.toFixed(2))
  };
};

module.exports = {
  calculateFuelEfficiency
};
