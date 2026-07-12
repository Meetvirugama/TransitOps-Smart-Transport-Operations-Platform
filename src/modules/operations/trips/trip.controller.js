const tripService = require('./trip.service');
const { sendSuccess } = require('../../../common/response');

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

const createTrip = catchAsync(async (req, res) => {
  const trip = await tripService.createTrip(req.body, req.user.id);
  return sendSuccess(res, trip, 'Trip created successfully', 201);
});

const getTrips = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  const filters = {
    status: req.query.status,
    vehicle_id: req.query.vehicle_id,
    driver_id: req.query.driver_id
  };
  
  const trips = await tripService.getTrips(page, limit, filters);
  return sendSuccess(res, trips, 'Trips retrieved');
});

const getTripById = catchAsync(async (req, res) => {
  const trip = await tripService.getTripById(req.params.id);
  return sendSuccess(res, trip, 'Trip retrieved');
});

const dispatchTrip = catchAsync(async (req, res) => {
  const trip = await tripService.dispatchTrip(req.params.id, req.body);
  return sendSuccess(res, trip, 'Trip dispatched successfully');
});

const completeTrip = catchAsync(async (req, res) => {
  const trip = await tripService.completeTrip(req.params.id, req.body);
  return sendSuccess(res, trip, 'Trip completed successfully');
});

const cancelTrip = catchAsync(async (req, res) => {
  const trip = await tripService.cancelTrip(req.params.id);
  return sendSuccess(res, trip, 'Trip cancelled successfully');
});

module.exports = {
  createTrip,
  getTrips,
  getTripById,
  dispatchTrip,
  completeTrip,
  cancelTrip
};
