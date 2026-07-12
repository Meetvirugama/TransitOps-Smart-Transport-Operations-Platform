const vehicleRepo = require('./vehicle.repository');
const vtRepo = require('../vehicle-types/vehicle-type.repository');
const { AppError, NotFoundError } = require('../../common/exceptions');

const createVehicle = async (data) => {
  const existingReg = await vehicleRepo.findByRegistration(data.registration_number);
  if (existingReg) throw new AppError('Registration number already exists', 400);

  if (data.vehicle_type_id) {
    const vt = await vtRepo.findById(data.vehicle_type_id);
    if (!vt) throw new AppError('Invalid vehicle type', 400);
  }

  return vehicleRepo.create(data);
};

const getVehicles = async (page = 1, limit = 10, filters = {}) => {
  const offset = (page - 1) * limit;
  return vehicleRepo.findAll(limit, offset, filters);
};

const getVehicleById = async (id) => {
  const vehicle = await vehicleRepo.findById(id);
  if (!vehicle) throw new NotFoundError('Vehicle not found');
  return vehicle;
};

const updateVehicle = async (id, data) => {
  if (data.registration_number) {
    const existing = await vehicleRepo.findByRegistration(data.registration_number);
    if (existing && existing.id !== Number(id)) {
      throw new AppError('Registration number already exists', 400);
    }
  }

  if (data.vehicle_type_id) {
    const vt = await vtRepo.findById(data.vehicle_type_id);
    if (!vt) throw new AppError('Invalid vehicle type', 400);
  }

  // Layer 1 prohibits updating status (allowed only via workflow in higher layers)
  // However, since we are building Master Data, we might allow manual corrections if needed.
  // We'll trust the validator to strip 'status' if we don't want it updatable here.

  const updated = await vehicleRepo.update(id, data);
  if (!updated) throw new NotFoundError('Vehicle not found');
  return updated;
};

const deleteVehicle = async (id) => {
  const deleted = await vehicleRepo.softDelete(id);
  if (!deleted) throw new NotFoundError('Vehicle not found');
  return deleted;
};

module.exports = {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle
};
