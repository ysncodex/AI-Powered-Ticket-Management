import logger from '../utils/logger.js';

// Middleware to log all HTTP requests
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request details
  logger.info(`${req.method} ${req.path} - IP: ${req.ip} - User: ${req.user?._id || 'Anonymous'}`);

  // Capture response details
  const originalSend = res.send;

  res.send = function (data) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;

    if (statusCode >= 400) {
      logger.error(`${req.method} ${req.path} - Status: ${statusCode} - Duration: ${duration}ms`);
    } else {
      logger.info(`${req.method} ${req.path} - Status: ${statusCode} - Duration: ${duration}ms`);
    }

    res.send = originalSend;
    return originalSend.call(this, data);
  };

  next();
};

// Middleware to log errors
export const errorLogger = (err, req, res, next) => {
  logger.error(`Error: ${err.message} on ${req.method} ${req.path}`);
  next(err);
};
