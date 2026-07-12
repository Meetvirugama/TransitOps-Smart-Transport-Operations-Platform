const { ForbiddenError } = require('../common/exceptions');

const permissionMiddleware = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions) {
      return next(new ForbiddenError('User permissions not identified'));
    }

    if (req.user.role === 'Admin') {
      return next(); // Admin gets bypass
    }

    if (!req.user.permissions[requiredPermission]) {
      return next(new ForbiddenError(`You lack the required permission: ${requiredPermission}`));
    }

    next();
  };
};

module.exports = permissionMiddleware;
