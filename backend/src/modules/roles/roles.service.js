const roleRepo = require('./roles.repository');
const { AppError, NotFoundError } = require('../../common/exceptions');

const getRoles = async (options) => {
  return await roleRepo.findAll(options);
};

const getRoleById = async (id) => {
  const role = await roleRepo.findById(id);
  if (!role) {
    throw new NotFoundError('Role not found');
  }
  return role;
};

const createRole = async (data) => {
  // Enforce a string JSON for permissions if coming as object
  if (data.permissions && typeof data.permissions === 'object') {
    data.permissions = JSON.stringify(data.permissions);
  } else {
    data.permissions = '{}';
  }
  return await roleRepo.create(data);
};

const updateRole = async (id, data) => {
  const role = await roleRepo.findById(id);
  if (!role) {
    throw new NotFoundError('Role not found');
  }
  
  if (data.permissions && typeof data.permissions === 'object') {
    data.permissions = JSON.stringify(data.permissions);
  }

  return await roleRepo.update(id, data);
};

module.exports = {
  getRoles,
  getRoleById,
  createRole,
  updateRole
};
