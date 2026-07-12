const dashboardService = require('./dashboard.service');
const { sendSuccess } = require('../../../common/response');

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

const getDashboardSummary = catchAsync(async (req, res) => {
  const filters = {
    region_id: req.query.region_id,
    vehicle_type_id: req.query.vehicle_type_id
  };
  const data = await dashboardService.getDashboardSummary(filters);
  return sendSuccess(res, data, 'Analytics dashboard summary retrieved');
});

const getExpiringLicenses = catchAsync(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const expiring = await dashboardService.getExpiringLicenses(days);
  const expired = await dashboardService.getExpiredLicenses();
  return sendSuccess(res, { expiringSoon: expiring, alreadyExpired: expired },
    `Driver license alerts (expiring within ${days} days)`);
});

const getInsights = catchAsync(async (req, res) => {
  const data = await dashboardService.getInsights();
  return sendSuccess(res, data, 'Fleet insights retrieved');
});

module.exports = {
  getDashboardSummary,
  getExpiringLicenses,
  getInsights
};

