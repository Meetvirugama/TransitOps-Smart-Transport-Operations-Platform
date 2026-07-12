const lcService = require('./license-category.service');
const { sendSuccess } = require('../../common/response');

const catchAsync = require('../../common/catch-async');

const createLC = catchAsync(async (req, res) => {
  const { name, description } = req.body;
  const lc = await lcService.createLicenseCategory(name, description);
  return sendSuccess(res, lc, 'License Category created', 201);
});

const getLCs = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const lcs = await lcService.getLicenseCategories(page, limit);
  return sendSuccess(res, lcs, 'License Categories retrieved');
});

const getLCById = catchAsync(async (req, res) => {
  const lc = await lcService.getLicenseCategoryById(req.params.id);
  return sendSuccess(res, lc, 'License Category retrieved');
});

const updateLC = catchAsync(async (req, res) => {
  const { name, description } = req.body;
  const lc = await lcService.updateLicenseCategory(req.params.id, name, description);
  return sendSuccess(res, lc, 'License Category updated');
});

const deleteLC = catchAsync(async (req, res) => {
  await lcService.deleteLicenseCategory(req.params.id);
  return sendSuccess(res, null, 'License Category deleted');
});

module.exports = {
  createLC,
  getLCs,
  getLCById,
  updateLC,
  deleteLC
};
