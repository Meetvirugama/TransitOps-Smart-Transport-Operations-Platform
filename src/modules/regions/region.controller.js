const regionService = require('./region.service');
const { sendSuccess } = require('../../common/response');

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

const createRegion = catchAsync(async (req, res) => {
  const { name, description } = req.body;
  const region = await regionService.createRegion(name, description);
  return sendSuccess(res, region, 'Region created successfully', 201);
});

const getRegions = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const regions = await regionService.getRegions(page, limit);
  return sendSuccess(res, regions, 'Regions retrieved successfully');
});

const getRegionById = catchAsync(async (req, res) => {
  const region = await regionService.getRegionById(req.params.id);
  return sendSuccess(res, region, 'Region retrieved successfully');
});

const updateRegion = catchAsync(async (req, res) => {
  const { name, description } = req.body;
  const region = await regionService.updateRegion(req.params.id, name, description);
  return sendSuccess(res, region, 'Region updated successfully');
});

const deleteRegion = catchAsync(async (req, res) => {
  await regionService.deleteRegion(req.params.id);
  return sendSuccess(res, null, 'Region deleted successfully');
});

module.exports = {
  createRegion,
  getRegions,
  getRegionById,
  updateRegion,
  deleteRegion
};
