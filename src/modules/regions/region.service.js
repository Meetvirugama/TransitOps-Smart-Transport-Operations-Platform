const regionRepo = require('./region.repository');
const { AppError, NotFoundError } = require('../../common/exceptions');

const createRegion = async (name, description) => {
  const existing = await regionRepo.findByName(name);
  if (existing) {
    throw new AppError('Region with this name already exists', 400);
  }
  return regionRepo.create(name, description);
};

const getRegions = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return regionRepo.findAll(limit, offset);
};

const getRegionById = async (id) => {
  const region = await regionRepo.findById(id);
  if (!region) throw new NotFoundError('Region not found');
  return region;
};

const updateRegion = async (id, name, description) => {
  if (name) {
    const existing = await regionRepo.findByName(name);
    if (existing && existing.id !== Number(id)) {
      throw new AppError('Region with this name already exists', 400);
    }
  }
  const updated = await regionRepo.update(id, name, description);
  if (!updated) throw new NotFoundError('Region not found');
  return updated;
};

const deleteRegion = async (id) => {
  const deleted = await regionRepo.softDelete(id);
  if (!deleted) throw new NotFoundError('Region not found');
  return deleted;
};

module.exports = {
  createRegion,
  getRegions,
  getRegionById,
  updateRegion,
  deleteRegion
};
