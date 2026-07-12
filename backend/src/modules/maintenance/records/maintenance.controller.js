const maintenanceService = require('./maintenance.service');
const { sendSuccess } = require('../../../common/response');

const catchAsync = require('../../../common/catch-async');

const getMaintenanceRecords = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const filters = {
    status: req.query.status,
    vehicle_id: req.query.vehicle_id,
    workshop_id: req.query.workshop_id
  };
  
  const data = await maintenanceService.getMaintenanceRecords(page, limit, filters);
  return sendSuccess(res, data, 'Maintenance records retrieved');
});

const getMaintenanceById = catchAsync(async (req, res) => {
  const data = await maintenanceService.getMaintenanceById(req.params.id);
  return sendSuccess(res, data, 'Maintenance record retrieved');
});

const createMaintenance = catchAsync(async (req, res) => {
  const data = await maintenanceService.createMaintenance(req.body, req.user.id);
  return sendSuccess(res, data, 'Maintenance scheduled successfully', 201);
});

const startMaintenance = catchAsync(async (req, res) => {
  const data = await maintenanceService.startMaintenance(req.params.id, req.body);
  return sendSuccess(res, data, 'Maintenance started successfully');
});

const completeMaintenance = catchAsync(async (req, res) => {
  const data = await maintenanceService.completeMaintenance(req.params.id, req.body);
  return sendSuccess(res, data, 'Maintenance completed successfully');
});

const cancelMaintenance = catchAsync(async (req, res) => {
  const data = await maintenanceService.cancelMaintenance(req.params.id);
  return sendSuccess(res, data, 'Maintenance cancelled successfully');
});

module.exports = {
  getMaintenanceRecords,
  getMaintenanceById,
  createMaintenance,
  startMaintenance,
  completeMaintenance,
  cancelMaintenance
};
