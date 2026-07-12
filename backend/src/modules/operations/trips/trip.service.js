const tripRepo = require('./trip.repository');
const availabilityService = require('../../fleet/availability/availability.service');
const vehicleRepo = require('../../vehicles/vehicle.repository');
const driverRepo = require('../../drivers/driver.repository');
const { AppError, NotFoundError } = require('../../../common/exceptions');
const { VEHICLE_STATUS, DRIVER_STATUS } = require('../../../common/constants');

// Workflow 1: Create Trip (Draft)
const createTrip = async (data, userId) => {
  const existing = await tripRepo.findByNumber(data.trip_number);
  if (existing) throw new AppError('Trip number already exists', 400);

  const tripData = {
    ...data,
    created_by: userId
  };

  return tripRepo.create(tripData);
};

const getTrips = async (page = 1, limit = 10, filters = {}) => {
  const offset = (page - 1) * limit;
  return tripRepo.findAll(limit, offset, filters);
};

const getTripById = async (id) => {
  const trip = await tripRepo.findById(id);
  if (!trip) throw new NotFoundError('Trip not found');
  return trip;
};

// Workflow 2: Dispatch Trip
const dispatchTrip = async (tripId, dispatchData) => {
  const { vehicle_id, driver_id } = dispatchData;

  const trip = await getTripById(tripId);
  if (trip.status !== 'Draft') {
    throw new AppError(`Cannot dispatch trip in ${trip.status} state`, 400);
  }

  // Business Rule: Vehicle Validation
  const vehicle = await vehicleRepo.findById(vehicle_id);
  if (!vehicle) throw new AppError('Vehicle not found', 404);

  // Business Rule: Vehicle must be Available (not Retired or In Shop)
  if (vehicle.status === VEHICLE_STATUS.RETIRED) {
    throw new AppError('Cannot dispatch a Retired vehicle', 400);
  }
  if (vehicle.status === VEHICLE_STATUS.IN_SHOP) {
    throw new AppError('Cannot dispatch a vehicle that is In Shop (under maintenance)', 400);
  }
  if (vehicle.status !== VEHICLE_STATUS.AVAILABLE) {
    throw new AppError(`Cannot dispatch vehicle. Current status is ${vehicle.status}`, 400);
  }

  // Business Rule: Capacity Validation
  if (Number(trip.cargo_weight) > Number(vehicle.max_capacity)) {
    throw new AppError(
      `Cargo weight (${trip.cargo_weight} kg) exceeds vehicle capacity (${vehicle.max_capacity} kg)`,
      400
    );
  }

  // Business Rule: Driver Validation
  const driver = await driverRepo.findById(driver_id);
  if (!driver) throw new AppError('Driver not found', 404);

  // Business Rule: Suspended driver cannot be assigned
  if (driver.status === DRIVER_STATUS.SUSPENDED) {
    throw new AppError('Cannot assign a Suspended driver to a trip', 400);
  }

  // Business Rule: License expiry check
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiryDate = new Date(driver.license_expiry_date);
  if (expiryDate < today) {
    throw new AppError(
      `Driver license expired on ${expiryDate.toISOString().split('T')[0]}. Renew before dispatching.`,
      400
    );
  }

  // Business Rule: Driver must be Available
  if (driver.status !== DRIVER_STATUS.AVAILABLE) {
    throw new AppError(`Cannot assign driver. Current status is ${driver.status}`, 400);
  }

  // Workflow Action: Reserve Resources (via Layer 2)
  try {
    await availabilityService.reserveVehicle(vehicle_id);
  } catch (error) {
    throw new AppError(`Vehicle reservation failed: ${error.message}`, 400);
  }

  try {
    await availabilityService.reserveDriver(driver_id);
  } catch (error) {
    // Rollback vehicle if driver fails
    await availabilityService.releaseVehicle(vehicle_id);
    throw new AppError(`Driver reservation failed: ${error.message}`, 400);
  }

  // Update resource status to "On Trip"
  await availabilityService.changeVehicleStatus(vehicle_id, VEHICLE_STATUS.ON_TRIP);
  await availabilityService.changeDriverStatus(driver_id, DRIVER_STATUS.ON_TRIP);

  // Update Trip
  const updatedTrip = await tripRepo.update(tripId, {
    vehicle_id,
    driver_id,
    start_time: new Date(),
    status: 'Dispatched'
  });

  return updatedTrip;
};

// Workflow 3: Complete Trip
const completeTrip = async (tripId, completionData) => {
  const trip = await getTripById(tripId);
  if (trip.status !== 'Dispatched') {
    throw new AppError(`Cannot complete trip in ${trip.status} state`, 400);
  }

  const { actual_distance } = completionData;

  // Release Resources (via Layer 2)
  if (trip.vehicle_id) {
    await availabilityService.releaseVehicle(trip.vehicle_id);
    // Business Rule: Update odometer on completion
    const vehicle = await vehicleRepo.findById(trip.vehicle_id);
    if (vehicle && actual_distance) {
      const newOdometer = Number(vehicle.odometer || 0) + Number(actual_distance);
      await vehicleRepo.update(trip.vehicle_id, { odometer: newOdometer });
    }
  }
  if (trip.driver_id) {
    await availabilityService.releaseDriver(trip.driver_id);
  }

  // Update Trip
  const updatedTrip = await tripRepo.update(tripId, {
    actual_distance,
    end_time: new Date(),
    status: 'Completed'
  });

  return updatedTrip;
};

// Workflow 4: Cancel Trip
const cancelTrip = async (tripId) => {
  const trip = await getTripById(tripId);

  if (trip.status === 'Completed' || trip.status === 'Cancelled') {
    throw new AppError(`Cannot cancel trip in ${trip.status} state`, 400);
  }

  // If Dispatched, release resources
  if (trip.status === 'Dispatched') {
    if (trip.vehicle_id) {
      await availabilityService.releaseVehicle(trip.vehicle_id);
    }
    if (trip.driver_id) {
      await availabilityService.releaseDriver(trip.driver_id);
    }
  }

  // Update Trip
  const updatedTrip = await tripRepo.update(tripId, {
    status: 'Cancelled',
    end_time: new Date()
  });

  return updatedTrip;
};

module.exports = {
  createTrip,
  getTrips,
  getTripById,
  dispatchTrip,
  completeTrip,
  cancelTrip
};

