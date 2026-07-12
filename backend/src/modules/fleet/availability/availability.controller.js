const availabilityService = require('./availability.service');
const { sendSuccess } = require('../../../common/response');

const catchAsync = require('../../../common/catch-async');

const getAvailableVehicles = catchAsync(async (req, res) => {
  const data = await availabilityService.getAvailableVehicles(req.query.regionId);
  return sendSuccess(res, data, 'Available vehicles retrieved');
});

const getAvailableDrivers = catchAsync(async (req, res) => {
  const data = await availabilityService.getAvailableDrivers(req.query.licenseCategoryId);
  return sendSuccess(res, data, 'Available drivers retrieved');
});

const reserveVehicle = catchAsync(async (req, res) => {
  const data = await availabilityService.reserveVehicle(req.params.id);
  return sendSuccess(res, data, 'Vehicle reserved successfully');
});

const releaseVehicle = catchAsync(async (req, res) => {
  const data = await availabilityService.releaseVehicle(req.params.id);
  return sendSuccess(res, data, 'Vehicle released successfully');
});

const reserveDriver = catchAsync(async (req, res) => {
  const data = await availabilityService.reserveDriver(req.params.id);
  return sendSuccess(res, data, 'Driver reserved successfully');
});

const releaseDriver = catchAsync(async (req, res) => {
  const data = await availabilityService.releaseDriver(req.params.id);
  return sendSuccess(res, data, 'Driver released successfully');
});

const changeVehicleStatus = catchAsync(async (req, res) => {
  const data = await availabilityService.changeVehicleStatus(req.params.id, req.body.status);
  return sendSuccess(res, data, 'Vehicle status updated');
});

const changeDriverStatus = catchAsync(async (req, res) => {
  const data = await availabilityService.changeDriverStatus(req.params.id, req.body.status);
  return sendSuccess(res, data, 'Driver status updated');
});

const getFleetStatistics = catchAsync(async (req, res) => {
  const data = await availabilityService.getFleetStatistics();
  return sendSuccess(res, data, 'Fleet statistics retrieved');
});

module.exports = {
  getAvailableVehicles,
  getAvailableDrivers,
  reserveVehicle,
  releaseVehicle,
  reserveDriver,
  releaseDriver,
  changeVehicleStatus,
  changeDriverStatus,
  getFleetStatistics
};
