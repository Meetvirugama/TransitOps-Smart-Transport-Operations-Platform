const express = require('express');
const reportsController = require('./reports.controller');
const authMiddleware = require('../../../middleware/auth.middleware');
const roleMiddleware = require('../../../middleware/role.middleware');
const { ROLES } = require('../../../common/constants');

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST));

// CSV export endpoints
// Supports filters: ?status=Completed&from_date=2024-01-01&to_date=2024-12-31
router.get('/trips/export', reportsController.exportTrips);

// Supports filters: ?status=Available&region_id=1&vehicle_type_id=2
router.get('/vehicles/export', reportsController.exportVehicles);

// Supports filters: ?vehicle_id=1&from_date=2024-01-01
router.get('/fuel/export', reportsController.exportFuelLogs);

module.exports = router;
