const maintenanceRepo = require('./maintenance.repository');
const availabilityService = require('../../fleet/availability/availability.service');
const vehicleRepo = require('../../vehicles/vehicle.repository');
const { AppError, NotFoundError } = require('../../../common/exceptions');

const getMaintenanceRecords = async (page = 1, limit = 10, filters = {}) => {
  const offset = (page - 1) * limit;
  return maintenanceRepo.findAll(limit, offset, filters);
};

const getMaintenanceById = async (id) => {
  const record = await maintenanceRepo.findById(id);
  if (!record) throw new NotFoundError('Maintenance record not found');
  return record;
};

// Workflow 1: Create Maintenance
const createMaintenance = async (data, userId) => {
  // Check if vehicle exists
  const vehicle = await vehicleRepo.findById(data.vehicle_id);
  if (!vehicle) throw new NotFoundError('Vehicle not found');

  // Rule 1: One vehicle, one active maintenance
  const activeMaintenance = await maintenanceRepo.findActiveByVehicleId(data.vehicle_id);
  if (activeMaintenance) {
    throw new AppError('Vehicle already has an active maintenance record', 400);
  }

  // Ensure vehicle is available
  if (vehicle.status !== 'Available') {
    throw new AppError(`Cannot schedule maintenance. Vehicle status is ${vehicle.status}`, 400);
  }

  // Lock vehicle by reserving it, then immediately update status to 'In Shop'
  try {
    await availabilityService.reserveVehicle(data.vehicle_id);
    await availabilityService.changeVehicleStatus(data.vehicle_id, 'In Shop');
  } catch (error) {
    throw new AppError(`Failed to update vehicle status: ${error.message}`, 500);
  }

  const recordData = {
    ...data,
    created_by: userId
  };

  return maintenanceRepo.create(recordData);
};

// Workflow 2: Start Maintenance
const startMaintenance = async (id, data) => {
  const record = await getMaintenanceById(id);
  
  if (record.status !== 'Scheduled') {
    throw new AppError(`Cannot start maintenance from status: ${record.status}`, 400);
  }

  const updateData = {
    status: 'In Progress',
    workshop_id: data.workshop_id,
    technician_name: data.technician_name,
    start_date: new Date()
  };

  if (data.expected_completion_date) {
    updateData.expected_completion_date = data.expected_completion_date;
  }

  return maintenanceRepo.update(id, updateData);
};

// Workflow 3: Complete Maintenance
const completeMaintenance = async (id, data) => {
  const record = await getMaintenanceById(id);

  if (record.status !== 'In Progress' && record.status !== 'Scheduled') {
    throw new AppError(`Cannot complete maintenance from status: ${record.status}`, 400);
  }

  const updateData = {
    status: 'Completed',
    actual_cost: data.actual_cost,
    remarks: data.remarks,
    completed_date: new Date()
  };

  const updatedRecord = await maintenanceRepo.update(id, updateData);

  // Restore Vehicle to 'Available'
  await availabilityService.changeVehicleStatus(record.vehicle_id, 'Available');

  return updatedRecord;
};

// Workflow 4: Cancel Maintenance
const cancelMaintenance = async (id) => {
  const record = await getMaintenanceById(id);

  if (record.status === 'Completed' || record.status === 'Cancelled') {
    throw new AppError(`Cannot cancel maintenance in status: ${record.status}`, 400);
  }

  const updatedRecord = await maintenanceRepo.update(id, { status: 'Cancelled' });

  // Restore Vehicle to 'Available'
  await availabilityService.changeVehicleStatus(record.vehicle_id, 'Available');

  return updatedRecord;
};

module.exports = {
  getMaintenanceRecords,
  getMaintenanceById,
  createMaintenance,
  startMaintenance,
  completeMaintenance,
  cancelMaintenance
};
