const fuelRepo = require('./fuel.repository');
const vehicleRepo = require('../../vehicles/vehicle.repository');
const { AppError, NotFoundError } = require('../../../common/exceptions');

const createFuelLog = async (data, userId) => {
  const vehicle = await vehicleRepo.findById(data.vehicle_id);
  if (!vehicle) throw new NotFoundError('Vehicle not found');

  const total_cost = Number(data.quantity) * Number(data.price_per_liter);

  const fuelData = {
    ...data,
    total_cost,
    created_by: userId
  };

  return fuelRepo.create(fuelData);
};

const getFuelLogs = async (page = 1, limit = 10, filters = {}) => {
  const offset = (page - 1) * limit;
  return fuelRepo.findAll(limit, offset, filters);
};

const getFuelLogById = async (id) => {
  const log = await fuelRepo.findById(id);
  if (!log) throw new NotFoundError('Fuel log not found');
  return log;
};

const updateFuelLog = async (id, data) => {
  const log = await getFuelLogById(id);
  
  const quantity = data.quantity !== undefined ? data.quantity : log.quantity;
  const price_per_liter = data.price_per_liter !== undefined ? data.price_per_liter : log.price_per_liter;
  const total_cost = Number(quantity) * Number(price_per_liter);

  const updateData = { ...data, total_cost };
  return fuelRepo.update(id, updateData);
};

const deleteFuelLog = async (id) => {
  const deleted = await fuelRepo.softDelete(id);
  if (!deleted) throw new NotFoundError('Fuel log not found');
  return deleted;
};

module.exports = {
  createFuelLog,
  getFuelLogs,
  getFuelLogById,
  updateFuelLog,
  deleteFuelLog
};
