const kpiEngine = require('../kpi/kpi.engine');

const getDashboardSummary = async () => {
  // Execute all read-only queries in parallel for high performance
  const [vehicles, trips, drivers, financials] = await Promise.all([
    kpiEngine.getVehicleCounts(),
    kpiEngine.getTripCounts(),
    kpiEngine.getDriverCounts(),
    kpiEngine.getFinancialMetrics()
  ]);

  // Calculate fleet utilization
  let fleetUtilization = 0;
  if (vehicles.total > 0) {
    fleetUtilization = (vehicles.onTrip / vehicles.total) * 100;
  }

  return {
    vehicles,
    trips,
    drivers,
    financials,
    kpis: {
      fleetUtilizationPercentage: Number(fleetUtilization.toFixed(2)),
      vehicleAvailabilityPercentage: vehicles.total > 0 ? Number(((vehicles.available / vehicles.total) * 100).toFixed(2)) : 0
    }
  };
};

module.exports = {
  getDashboardSummary
};
