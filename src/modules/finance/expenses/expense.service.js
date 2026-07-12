const expenseRepo = require('./expense.repository');
const vehicleRepo = require('../../vehicles/vehicle.repository');
const { NotFoundError } = require('../../../common/exceptions');

const createExpense = async (data, userId) => {
  const vehicle = await vehicleRepo.findById(data.vehicle_id);
  if (!vehicle) throw new NotFoundError('Vehicle not found');

  const expenseData = {
    ...data,
    created_by: userId
  };

  return expenseRepo.create(expenseData);
};

const getExpenses = async (page = 1, limit = 10, filters = {}) => {
  const offset = (page - 1) * limit;
  return expenseRepo.findAll(limit, offset, filters);
};

const getExpenseById = async (id) => {
  const expense = await expenseRepo.findById(id);
  if (!expense) throw new NotFoundError('Expense not found');
  return expense;
};

const updateExpense = async (id, data) => {
  const expense = await expenseRepo.update(id, data);
  if (!expense) throw new NotFoundError('Expense not found');
  return expense;
};

const deleteExpense = async (id) => {
  const deleted = await expenseRepo.softDelete(id);
  if (!deleted) throw new NotFoundError('Expense not found');
  return deleted;
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense
};
