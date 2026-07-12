const revenueRepo = require('./revenue.repository');
const tripRepo = require('../../operations/trips/trip.repository');
const { AppError, NotFoundError } = require('../../../common/exceptions');

const createRevenue = async (data, userId) => {
  const trip = await tripRepo.findById(data.trip_id);
  if (!trip) throw new NotFoundError('Trip not found');

  if (trip.status !== 'Completed') {
    throw new AppError(`Revenue can only be recorded for Completed trips. Current status: ${trip.status}`, 400);
  }

  const revenueData = {
    ...data,
    vehicle_id: trip.vehicle_id, // Automatically inherit vehicle from trip
    created_by: userId
  };

  return revenueRepo.create(revenueData);
};

const getRevenues = async (page = 1, limit = 10, filters = {}) => {
  const offset = (page - 1) * limit;
  return revenueRepo.findAll(limit, offset, filters);
};

const getRevenueById = async (id) => {
  const revenue = await revenueRepo.findById(id);
  if (!revenue) throw new NotFoundError('Revenue record not found');
  return revenue;
};

const updateRevenue = async (id, data) => {
  const revenue = await revenueRepo.update(id, data);
  if (!revenue) throw new NotFoundError('Revenue record not found');
  return revenue;
};

const deleteRevenue = async (id) => {
  const deleted = await revenueRepo.softDelete(id);
  if (!deleted) throw new NotFoundError('Revenue record not found');
  return deleted;
};

module.exports = {
  createRevenue,
  getRevenues,
  getRevenueById,
  updateRevenue,
  deleteRevenue
};
