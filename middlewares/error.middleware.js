const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  // Log error properly
  logger.error(
    {
      message: err.message,
      stack: err.stack,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip
    },
    'Unhandled Error'
  );

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorMiddleware;