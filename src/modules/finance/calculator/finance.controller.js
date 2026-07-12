const financeService = require('./finance.service');
const { sendSuccess } = require('../../../common/response');

const catchAsync = require('../../../common/catch-async');

const getGlobalSummary = catchAsync(async (req, res) => {
  const data = await financeService.getGlobalSummary();
  return sendSuccess(res, data, 'Global financial summary retrieved');
});

const getVehicleSummary = catchAsync(async (req, res) => {
  const data = await financeService.getVehicleSummary(req.params.id);
  return sendSuccess(res, data, 'Vehicle financial summary retrieved');
});

const getTripSummary = catchAsync(async (req, res) => {
  const data = await financeService.getTripSummary(req.params.id);
  return sendSuccess(res, data, 'Trip financial summary retrieved');
});

module.exports = {
  getGlobalSummary,
  getVehicleSummary,
  getTripSummary
};
