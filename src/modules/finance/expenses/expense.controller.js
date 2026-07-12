const expenseService = require('./expense.service');
const { sendSuccess } = require('../../../common/response');

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

const createExpense = catchAsync(async (req, res) => {
  const data = await expenseService.createExpense(req.body, req.user.id);
  return sendSuccess(res, data, 'Expense created successfully', 201);
});

const getExpenses = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const filters = {
    vehicle_id: req.query.vehicle_id,
    trip_id: req.query.trip_id,
    expense_type: req.query.expense_type
  };
  
  const data = await expenseService.getExpenses(page, limit, filters);
  return sendSuccess(res, data, 'Expenses retrieved');
});

const getExpenseById = catchAsync(async (req, res) => {
  const data = await expenseService.getExpenseById(req.params.id);
  return sendSuccess(res, data, 'Expense retrieved');
});

const updateExpense = catchAsync(async (req, res) => {
  const data = await expenseService.updateExpense(req.params.id, req.body);
  return sendSuccess(res, data, 'Expense updated');
});

const deleteExpense = catchAsync(async (req, res) => {
  await expenseService.deleteExpense(req.params.id);
  return sendSuccess(res, null, 'Expense deleted');
});

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense
};
