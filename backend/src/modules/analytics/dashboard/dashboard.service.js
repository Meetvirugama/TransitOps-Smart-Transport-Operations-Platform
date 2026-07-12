const kpiEngine = require('../kpi/kpi.engine');

const getDashboardSummary = async (filters = {}) => {
  // Execute all read-only queries in parallel for high performance
  const [vehicles, trips, drivers, financials] = await Promise.all([
    kpiEngine.getVehicleCounts(filters),
    kpiEngine.getTripCounts(filters),
    kpiEngine.getDriverCounts(),
    kpiEngine.getFinancialMetrics()
  ]);

  // Calculate fleet utilization
  let fleetUtilization = 0;
  if (vehicles.total > 0) {
    fleetUtilization = (vehicles.onTrip / vehicles.total) * 100;
  }

  let avgFuelEfficiency = 0;
  if (financials.fuelLiters > 0 && financials.distance > 0) {
    avgFuelEfficiency = financials.distance / financials.fuelLiters;
  }

  return {
    vehicles,
    trips,
    drivers,
    financials,
    kpis: {
      fleetUtilizationPercentage: Number(fleetUtilization.toFixed(2)),
      vehicleAvailabilityPercentage: vehicles.total > 0
        ? Number(((vehicles.available / vehicles.total) * 100).toFixed(2))
        : 0,
      tripCompletionRate: trips.total > 0
        ? Number(((trips.completed / trips.total) * 100).toFixed(2))
        : 0,
      avgFuelEfficiency: Number(avgFuelEfficiency.toFixed(2))
    }
  };
};

const getExpiringLicenses = async (daysAhead = 30) => {
  return kpiEngine.getExpiringLicenses(daysAhead);
};

const getExpiredLicenses = async () => {
  return kpiEngine.getExpiredLicenses();
};

const getInsights = async () => {
  return kpiEngine.getInsights();
};

module.exports = {
  getDashboardSummary,
  getExpiringLicenses,
  getExpiredLicenses,
  getInsights
};

