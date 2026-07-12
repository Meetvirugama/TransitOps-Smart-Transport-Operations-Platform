const express = require('express');
const profileController = require('./profile.controller');
const validator = require('../../middleware/validate.middleware');
const schemas = require('./profile.validator');
const { paginationSchema } = require('../regions/region.validator');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');
const { ROLES } = require('../../common/constants');

const router = express.Router();

router.use(authMiddleware);

// Current user can read/update their own profile
router.get('/me', profileController.getMyProfile);
router.put('/me', validator(schemas.upsertProfileSchema), profileController.upsertMyProfile);

// Admin / HR can read all profiles and specific user profiles
const adminRoles = roleMiddleware(ROLES.ADMIN);
router.get('/', adminRoles, validator(paginationSchema), profileController.getProfiles);
router.get('/:userId', adminRoles, validator(schemas.userParamSchema), profileController.getProfileByUserId);

module.exports = router;
