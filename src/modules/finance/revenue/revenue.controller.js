const revenueService = require('./revenue.service');
const { sendSuccess } = require('../../../common/response');

const catchAsync = require('../../../common/catch-async');

const createRevenue = catchAsync(async (req, res) => {
  const data = await revenueService.createRevenue(req.body, req.user.id);
  return sendSuccess(res, data, 'Revenue recorded successfully', 201);
});

const getRevenues = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const filters = {
    vehicle_id: req.query.vehicle_id,
    trip_id: req.query.trip_id,
    payment_status: req.query.payment_status
  };
  
  const data = await revenueService.getRevenues(page, limit, filters);
  return sendSuccess(res, data, 'Revenues retrieved');
});

const getRevenueById = catchAsync(async (req, res) => {
  const data = await revenueService.getRevenueById(req.params.id);
  return sendSuccess(res, data, 'Revenue retrieved');
});

const updateRevenue = catchAsync(async (req, res) => {
  const data = await revenueService.updateRevenue(req.params.id, req.body);
  return sendSuccess(res, data, 'Revenue updated');
});

const deleteRevenue = catchAsync(async (req, res) => {
  await revenueService.deleteRevenue(req.params.id);
  return sendSuccess(res, null, 'Revenue deleted');
});

module.exports = {
  createRevenue,
  getRevenues,
  getRevenueById,
  updateRevenue,
  deleteRevenue
};
