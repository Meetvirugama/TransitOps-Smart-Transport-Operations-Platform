const vtService = require('./vehicle-type.service');
const { sendSuccess } = require('../../common/response');

const catchAsync = require('../../common/catch-async');

const createVT = catchAsync(async (req, res) => {
  const { name, description, maxDefaultCapacity } = req.body;
  const vt = await vtService.createVehicleType(name, description, maxDefaultCapacity);
  return sendSuccess(res, vt, 'Vehicle Type created', 201);
});

const getVTs = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const vts = await vtService.getVehicleTypes(page, limit);
  return sendSuccess(res, vts, 'Vehicle Types retrieved');
});

const getVTById = catchAsync(async (req, res) => {
  const vt = await vtService.getVehicleTypeById(req.params.id);
  return sendSuccess(res, vt, 'Vehicle Type retrieved');
});

const updateVT = catchAsync(async (req, res) => {
  const { name, description, maxDefaultCapacity } = req.body;
  const vt = await vtService.updateVehicleType(req.params.id, name, description, maxDefaultCapacity);
  return sendSuccess(res, vt, 'Vehicle Type updated');
});

const deleteVT = catchAsync(async (req, res) => {
  await vtService.deleteVehicleType(req.params.id);
  return sendSuccess(res, null, 'Vehicle Type deleted');
});

module.exports = {
  createVT,
  getVTs,
  getVTById,
  updateVT,
  deleteVT
};
