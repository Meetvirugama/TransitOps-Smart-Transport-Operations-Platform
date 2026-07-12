const userRepo = require('./users.repository');
const { NotFoundError } = require('../../common/exceptions');

const getUsers = async (options) => {
  return await userRepo.findAll(options);
};

const updateUserRole = async (userId, roleId) => {
  const user = await userRepo.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return await userRepo.updateUserRole(userId, roleId);
};

module.exports = {
  getUsers,
  updateUserRole
};
