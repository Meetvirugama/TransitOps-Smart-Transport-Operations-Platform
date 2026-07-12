const express = require('express');
const tripController = require('./trip.controller');
const validator = require('../../../middleware/validate.middleware');
const schemas = require('./trip.validator');
const authMiddleware = require('../../../middleware/auth.middleware');
const roleMiddleware = require('../../../middleware/role.middleware');
const { ROLES } = require('../../../common/constants');

const router = express.Router();

router.use(authMiddleware);

// All roles can read trips
router.get('/', validator(schemas.tripFilterSchema), tripController.getTrips);
router.get('/:id', validator(schemas.idParamSchema), tripController.getTripById);

// Only Dispatchers, Fleet Managers, Admins can modify trips
const dispatcherRoles = roleMiddleware(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.DISPATCHER);

router.post('/', dispatcherRoles, validator(schemas.createTripSchema), tripController.createTrip);

// Workflows
router.post('/:id/dispatch', dispatcherRoles, validator(schemas.dispatchTripSchema), tripController.dispatchTrip);
router.post('/:id/complete', dispatcherRoles, validator(schemas.completeTripSchema), tripController.completeTrip);
router.post('/:id/cancel', dispatcherRoles, validator(schemas.idParamSchema), tripController.cancelTrip);

module.exports = router;
