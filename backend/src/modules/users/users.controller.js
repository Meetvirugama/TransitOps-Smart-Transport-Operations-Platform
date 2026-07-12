const userService = require('./users.service');
const { sendSuccess, sendPaginatedSuccess } = require('../../common/response');
const catchAsync = require('../../common/catch-async');

const getUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 100, search } = req.query;
  const offset = (page - 1) * limit;

  const { rows, total } = await userService.getUsers({ search, limit, offset });
  
  return sendPaginatedSuccess(res, rows, total, parseInt(page), parseInt(limit));
});

const updateUserRole = catchAsync(async (req, res) => {
  const { roleId } = req.body;
  await userService.updateUserRole(req.params.id, roleId);
  return sendSuccess(res, null, 'User role updated successfully');
});

module.exports = {
  getUsers,
  updateUserRole
};
