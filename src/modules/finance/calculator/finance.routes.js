const express = require('express');
const financeController = require('./finance.controller');
const { z } = require('zod');
const validator = require('../../../middleware/validate.middleware');
const authMiddleware = require('../../../middleware/auth.middleware');
const roleMiddleware = require('../../../middleware/role.middleware');
const { ROLES } = require('../../../common/constants');

const router = express.Router();

const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/)
  })
});

router.use(authMiddleware);
// Only Admins or Fleet Managers should view high level financials
router.use(roleMiddleware(ROLES.ADMIN, ROLES.FLEET_MANAGER));

router.get('/summary', financeController.getGlobalSummary);
router.get('/vehicle/:id', validator(idParamSchema), financeController.getVehicleSummary);
router.get('/trip/:id', validator(idParamSchema), financeController.getTripSummary);

module.exports = router;
