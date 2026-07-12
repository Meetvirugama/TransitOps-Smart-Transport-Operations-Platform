const logger = require('../common/logger');
const { AppError } = require('../common/exceptions');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, path: req.originalUrl });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }

  // Handle Zod validation errors if any
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errorCode: 'VALIDATION_ERROR',
      errors: err.errors,
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }

  // Generic Server Error
  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    errorCode: 'SERVER_ERROR',
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
};

module.exports = errorHandler;
