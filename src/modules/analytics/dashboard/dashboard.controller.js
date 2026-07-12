const dashboardService = require('./dashboard.service');
const { sendSuccess } = require('../../../common/response');

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

const getDashboardSummary = catchAsync(async (req, res) => {
  const data = await dashboardService.getDashboardSummary();
  return sendSuccess(res, data, 'Analytics dashboard summary retrieved');
});

module.exports = {
  getDashboardSummary
};
