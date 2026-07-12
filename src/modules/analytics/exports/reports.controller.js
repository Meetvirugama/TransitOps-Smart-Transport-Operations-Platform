const csvExport = require('../exports/csv.export');

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

const exportTrips = catchAsync(async (req, res) => {
  const filters = {
    status: req.query.status,
    vehicle_id: req.query.vehicle_id,
    from_date: req.query.from_date,
    to_date: req.query.to_date
  };
  await csvExport.exportTrips(res, filters);
});

const exportVehicles = catchAsync(async (req, res) => {
  const filters = {
    status: req.query.status,
    region_id: req.query.region_id,
    vehicle_type_id: req.query.vehicle_type_id
  };
  await csvExport.exportVehicles(res, filters);
});

const exportFuelLogs = catchAsync(async (req, res) => {
  const filters = {
    vehicle_id: req.query.vehicle_id,
    from_date: req.query.from_date,
    to_date: req.query.to_date
  };
  await csvExport.exportFuelLogs(res, filters);
});

module.exports = { exportTrips, exportVehicles, exportFuelLogs };
