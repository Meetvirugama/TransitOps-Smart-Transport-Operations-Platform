const lcRepo = require('./license-category.repository');
const { AppError, NotFoundError } = require('../../common/exceptions');

const createLicenseCategory = async (name, description) => {
  const existing = await lcRepo.findByName(name);
  if (existing) {
    throw new AppError('License category with this name already exists', 400);
  }
  return lcRepo.create(name, description);
};

const getLicenseCategories = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return lcRepo.findAll(limit, offset);
};

const getLicenseCategoryById = async (id) => {
  const lc = await lcRepo.findById(id);
  if (!lc) throw new NotFoundError('License category not found');
  return lc;
};

const updateLicenseCategory = async (id, name, description) => {
  if (name) {
    const existing = await lcRepo.findByName(name);
    if (existing && existing.id !== Number(id)) {
      throw new AppError('License category with this name already exists', 400);
    }
  }
  const updated = await lcRepo.update(id, name, description);
  if (!updated) throw new NotFoundError('License category not found');
  return updated;
};

const deleteLicenseCategory = async (id) => {
  const deleted = await lcRepo.softDelete(id);
  if (!deleted) throw new NotFoundError('License category not found');
  return deleted;
};

module.exports = {
  createLicenseCategory,
  getLicenseCategories,
  getLicenseCategoryById,
  updateLicenseCategory,
  deleteLicenseCategory
};
