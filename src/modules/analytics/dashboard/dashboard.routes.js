const express = require('express');
const dashboardController = require('./dashboard.controller');
const authMiddleware = require('../../../middleware/auth.middleware');
const roleMiddleware = require('../../../middleware/role.middleware');
const { ROLES } = require('../../../common/constants');

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER));

// Dashboard — supports ?region_id=1&vehicle_type_id=2
router.get('/dashboard', dashboardController.getDashboardSummary);

// License alerts — supports ?days=30 (default 30 days)
router.get('/expiring-licenses', dashboardController.getExpiringLicenses);

// Top performer insights
router.get('/insights', dashboardController.getInsights);

module.exports = router;

