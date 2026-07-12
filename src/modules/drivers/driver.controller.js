const driverService = require('./driver.service');
const { sendSuccess } = require('../../common/response');

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

const createDriver = catchAsync(async (req, res) => {
  const driver = await driverService.createDriver(req.body);
  return sendSuccess(res, driver, 'Driver created', 201);
});

const getDrivers = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  const filters = {
    status: req.query.status,
    license_category_id: req.query.license_category_id
  };
  
  const drivers = await driverService.getDrivers(page, limit, filters);
  return sendSuccess(res, drivers, 'Drivers retrieved');
});

const getDriverById = catchAsync(async (req, res) => {
  const driver = await driverService.getDriverById(req.params.id);
  return sendSuccess(res, driver, 'Driver retrieved');
});

const updateDriver = catchAsync(async (req, res) => {
  const driver = await driverService.updateDriver(req.params.id, req.body);
  return sendSuccess(res, driver, 'Driver updated');
});

const deleteDriver = catchAsync(async (req, res) => {
  await driverService.deleteDriver(req.params.id);
  return sendSuccess(res, null, 'Driver deleted');
});

module.exports = {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  deleteDriver
};
