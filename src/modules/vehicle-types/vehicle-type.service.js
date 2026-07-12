const vehicleTypeRepo = require('./vehicle-type.repository');
const { AppError, NotFoundError } = require('../../common/exceptions');

const createVehicleType = async (name, description, maxDefaultCapacity) => {
  const existing = await vehicleTypeRepo.findByName(name);
  if (existing) {
    throw new AppError('Vehicle type with this name already exists', 400);
  }
  return vehicleTypeRepo.create(name, description, maxDefaultCapacity);
};

const getVehicleTypes = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return vehicleTypeRepo.findAll(limit, offset);
};

const getVehicleTypeById = async (id) => {
  const vt = await vehicleTypeRepo.findById(id);
  if (!vt) throw new NotFoundError('Vehicle type not found');
  return vt;
};

const updateVehicleType = async (id, name, description, maxDefaultCapacity) => {
  if (name) {
    const existing = await vehicleTypeRepo.findByName(name);
    if (existing && existing.id !== Number(id)) {
      throw new AppError('Vehicle type with this name already exists', 400);
    }
  }
  const updated = await vehicleTypeRepo.update(id, name, description, maxDefaultCapacity);
  if (!updated) throw new NotFoundError('Vehicle type not found');
  return updated;
};

const deleteVehicleType = async (id) => {
  const deleted = await vehicleTypeRepo.softDelete(id);
  if (!deleted) throw new NotFoundError('Vehicle type not found');
  return deleted;
};

module.exports = {
  createVehicleType,
  getVehicleTypes,
  getVehicleTypeById,
  updateVehicleType,
  deleteVehicleType
};
