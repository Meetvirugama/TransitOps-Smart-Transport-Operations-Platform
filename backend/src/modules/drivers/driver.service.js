const driverRepo = require('./driver.repository');
const lcRepo = require('../license-categories/license-category.repository');
const { AppError, NotFoundError } = require('../../common/exceptions');

const createDriver = async (data) => {
  const existingLicense = await driverRepo.findByLicense(data.license_number);
  if (existingLicense) throw new AppError('License number already exists', 400);

  if (data.license_category_id) {
    const lc = await lcRepo.findById(data.license_category_id);
    if (!lc) throw new AppError('Invalid license category', 400);
  }

  return driverRepo.create(data);
};

const getDrivers = async (page = 1, limit = 10, filters = {}) => {
  const offset = (page - 1) * limit;
  return driverRepo.findAll(limit, offset, filters);
};

const getDriverById = async (id) => {
  const driver = await driverRepo.findById(id);
  if (!driver) throw new NotFoundError('Driver not found');
  return driver;
};

const updateDriver = async (id, data) => {
  if (data.license_number) {
    const existing = await driverRepo.findByLicense(data.license_number);
    if (existing && existing.id !== Number(id)) {
      throw new AppError('License number already exists', 400);
    }
  }

  if (data.license_category_id) {
    const lc = await lcRepo.findById(data.license_category_id);
    if (!lc) throw new AppError('Invalid license category', 400);
  }

  const updated = await driverRepo.update(id, data);
  if (!updated) throw new NotFoundError('Driver not found');
  return updated;
};

const deleteDriver = async (id) => {
  const deleted = await driverRepo.softDelete(id);
  if (!deleted) throw new NotFoundError('Driver not found');
  return deleted;
};

module.exports = {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  deleteDriver
};
