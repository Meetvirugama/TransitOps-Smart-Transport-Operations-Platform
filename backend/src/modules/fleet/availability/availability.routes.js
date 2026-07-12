const express = require('express');
const controller = require('./availability.controller');
const validator = require('../../../middleware/validate.middleware');
const schemas = require('./availability.validator');
const authMiddleware = require('../../../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

// Fleet Stats & Availability Queries
router.get('/status', controller.getFleetStatistics);
router.get('/available-vehicles', validator(schemas.availableVehiclesQuerySchema), controller.getAvailableVehicles);
router.get('/available-drivers', validator(schemas.availableDriversQuerySchema), controller.getAvailableDrivers);

// Reservation/Release Workflow Endpoints
router.post('/reserve-vehicle/:id', validator(schemas.paramIdSchema), controller.reserveVehicle);
router.post('/release-vehicle/:id', validator(schemas.paramIdSchema), controller.releaseVehicle);
router.post('/reserve-driver/:id', validator(schemas.paramIdSchema), controller.reserveDriver);
router.post('/release-driver/:id', validator(schemas.paramIdSchema), controller.releaseDriver);

// Direct Status Transitions (Could be restricted to Admin/Fleet Manager later)
router.put('/vehicle-status/:id', validator(schemas.vehicleStatusSchema), controller.changeVehicleStatus);
router.put('/driver-status/:id', validator(schemas.driverStatusSchema), controller.changeDriverStatus);

module.exports = router;
