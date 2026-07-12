const fuelService = require('./fuel.service');
const { sendSuccess } = require('../../../common/response');

const catchAsync = require('../../../common/catch-async');

const createFuelLog = catchAsync(async (req, res) => {
  const data = await fuelService.createFuelLog(req.body, req.user.id);
  return sendSuccess(res, data, 'Fuel log created successfully', 201);
});

const getFuelLogs = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const filters = {
    vehicle_id: req.query.vehicle_id,
    trip_id: req.query.trip_id,
    driver_id: req.query.driver_id
  };
  
  const data = await fuelService.getFuelLogs(page, limit, filters);
  return sendSuccess(res, data, 'Fuel logs retrieved');
});

const getFuelLogById = catchAsync(async (req, res) => {
  const data = await fuelService.getFuelLogById(req.params.id);
  return sendSuccess(res, data, 'Fuel log retrieved');
});

const updateFuelLog = catchAsync(async (req, res) => {
  const data = await fuelService.updateFuelLog(req.params.id, req.body);
  return sendSuccess(res, data, 'Fuel log updated');
});

const deleteFuelLog = catchAsync(async (req, res) => {
  await fuelService.deleteFuelLog(req.params.id);
  return sendSuccess(res, null, 'Fuel log deleted');
});

module.exports = {
  createFuelLog,
  getFuelLogs,
  getFuelLogById,
  updateFuelLog,
  deleteFuelLog
};
