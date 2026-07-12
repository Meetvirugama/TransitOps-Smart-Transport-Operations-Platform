const { verifyToken } = require('../auth/jwt');
const { UnauthorizedError } = require('../common/exceptions');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token missing');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    // Attach decoded user to request
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
