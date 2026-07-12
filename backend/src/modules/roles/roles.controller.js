const roleService = require('./roles.service');
const { sendSuccess, sendPaginatedSuccess } = require('../../common/response');
const catchAsync = require('../../common/catch-async');

const getRoles = catchAsync(async (req, res) => {
  const { page = 1, limit = 100, search } = req.query;
  const offset = (page - 1) * limit;

  const { rows, total } = await roleService.getRoles({ search, limit, offset });
  
  return sendPaginatedSuccess(res, rows, total, parseInt(page), parseInt(limit));
});

const getRoleById = catchAsync(async (req, res) => {
  const role = await roleService.getRoleById(req.params.id);
  return sendSuccess(res, role);
});

const createRole = catchAsync(async (req, res) => {
  const role = await roleService.createRole(req.body);
  return sendSuccess(res, role, 'Role created successfully', 201);
});

const updateRole = catchAsync(async (req, res) => {
  const role = await roleService.updateRole(req.params.id, req.body);
  return sendSuccess(res, role, 'Role updated successfully');
});

module.exports = {
  getRoles,
  getRoleById,
  createRole,
  updateRole
};
