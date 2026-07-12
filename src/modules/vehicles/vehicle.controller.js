const vehicleService = require('./vehicle.service');
const { sendSuccess } = require('../../common/response');

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

const createVehicle = catchAsync(async (req, res) => {
  const vehicle = await vehicleService.createVehicle(req.body);
  return sendSuccess(res, vehicle, 'Vehicle created', 201);
});

const getVehicles = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  const filters = {
    status: req.query.status,
    region_id: req.query.region_id,
    vehicle_type_id: req.query.vehicle_type_id
  };
  
  const vehicles = await vehicleService.getVehicles(page, limit, filters);
  return sendSuccess(res, vehicles, 'Vehicles retrieved');
});

const getVehicleById = catchAsync(async (req, res) => {
  const vehicle = await vehicleService.getVehicleById(req.params.id);
  return sendSuccess(res, vehicle, 'Vehicle retrieved');
});

const updateVehicle = catchAsync(async (req, res) => {
  const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
  return sendSuccess(res, vehicle, 'Vehicle updated');
});

const deleteVehicle = catchAsync(async (req, res) => {
  await vehicleService.deleteVehicle(req.params.id);
  return sendSuccess(res, null, 'Vehicle deleted');
});

module.exports = {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle
};
