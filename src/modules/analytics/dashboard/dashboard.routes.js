const express = require('express');
const dashboardController = require('./dashboard.controller');
const authMiddleware = require('../../../middleware/auth.middleware');
const roleMiddleware = require('../../../middleware/role.middleware');
const { ROLES } = require('../../../common/constants');

const router = express.Router();

router.use(authMiddleware);

// Only Admins or Fleet Managers should view the analytics dashboard
router.use(roleMiddleware(ROLES.ADMIN, ROLES.FLEET_MANAGER));

router.get('/dashboard', dashboardController.getDashboardSummary);

module.exports = router;
