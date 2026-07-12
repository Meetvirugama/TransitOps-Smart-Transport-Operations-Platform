const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { UnauthorizedError } = require('../common/exceptions');

const generateToken = (payload, expiresIn = '24h') => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
};

module.exports = {
  generateToken,
  verifyToken
};
