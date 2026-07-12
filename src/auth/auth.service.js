const bcrypt = require('bcrypt');
const authRepo = require('./auth.repository');
const { generateToken } = require('./jwt');
const { UnauthorizedError, AppError } = require('../common/exceptions');

const login = async (email, password) => {
  const user = await authRepo.getUserByEmail(email);
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  
  return {
    user: { id: user.id, email: user.email, role: user.role },
    token
  };
};

const register = async (email, password, role) => {
  const existingUser = await authRepo.getUserByEmail(email);
  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await authRepo.createUser(email, passwordHash, role);
  return user;
};

module.exports = {
  login,
  register
};
