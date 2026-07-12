const express = require('express');
const expenseController = require('./expense.controller');
const validator = require('../../../middleware/validate.middleware');
const schemas = require('./expense.validator');
const authMiddleware = require('../../../middleware/auth.middleware');
const roleMiddleware = require('../../../middleware/role.middleware');
const { ROLES } = require('../../../common/constants');

const router = express.Router();

router.use(authMiddleware);

router.get('/', validator(schemas.queryExpenseSchema), expenseController.getExpenses);
router.get('/:id', validator(schemas.idParamSchema), expenseController.getExpenseById);

const allowedRoles = roleMiddleware(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.DISPATCHER);

router.post('/', allowedRoles, validator(schemas.createExpenseSchema), expenseController.createExpense);
router.put('/:id', allowedRoles, validator(schemas.updateExpenseSchema), expenseController.updateExpense);
router.delete('/:id', allowedRoles, validator(schemas.idParamSchema), expenseController.deleteExpense);

module.exports = router;
