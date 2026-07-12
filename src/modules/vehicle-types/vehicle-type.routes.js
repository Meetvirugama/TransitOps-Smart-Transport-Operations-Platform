const express = require('express');
const vtController = require('./vehicle-type.controller');
const validator = require('../../middleware/validate.middleware');
const schemas = require('./vehicle-type.validator');
const { idParamSchema, paginationSchema } = require('../regions/region.validator');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');
const { ROLES } = require('../../common/constants');

const router = express.Router();

router.use(authMiddleware);

const modifyRoles = roleMiddleware(ROLES.ADMIN, ROLES.FLEET_MANAGER);

router.post('/', modifyRoles, validator(schemas.createVTSchema), vtController.createVT);
router.get('/', validator(paginationSchema), vtController.getVTs);
router.get('/:id', validator(idParamSchema), vtController.getVTById);
router.put('/:id', modifyRoles, validator(schemas.updateVTSchema), vtController.updateVT);
router.delete('/:id', modifyRoles, validator(idParamSchema), vtController.deleteVT);

module.exports = router;
