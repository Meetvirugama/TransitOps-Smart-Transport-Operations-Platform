const workshopRepo = require('./workshop.repository');
const { NotFoundError } = require('../../../common/exceptions');

const createWorkshop = async (data) => {
  return workshopRepo.create(data);
};

const getWorkshops = async (page = 1, limit = 10, status = null) => {
  const offset = (page - 1) * limit;
  return workshopRepo.findAll(limit, offset, status);
};

const getWorkshopById = async (id) => {
  const workshop = await workshopRepo.findById(id);
  if (!workshop) throw new NotFoundError('Workshop not found');
  return workshop;
};

const updateWorkshop = async (id, data) => {
  const updated = await workshopRepo.update(id, data);
  if (!updated) throw new NotFoundError('Workshop not found');
  return updated;
};

const deleteWorkshop = async (id) => {
  const deleted = await workshopRepo.softDelete(id);
  if (!deleted) throw new NotFoundError('Workshop not found');
  return deleted;
};

module.exports = {
  createWorkshop,
  getWorkshops,
  getWorkshopById,
  updateWorkshop,
  deleteWorkshop
};
