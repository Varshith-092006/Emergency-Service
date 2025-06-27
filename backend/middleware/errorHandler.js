const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate field value: ${field} - ${value}. Please use another value.`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = { message, statusCode: 400 };
  }

  // Geolocation errors
  if (err.message && err.message.includes('geolocation')) {
    const message = 'Geolocation error: ' + err.message;
    error = { message, statusCode: 400 };
  }

  // Network errors
  if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    const message = 'Network error: Unable to connect to external service';
    error = { message, statusCode: 503 };
  }

  // Rate limiting errors
  if (err.statusCode === 429) {
    const message = 'Too many requests, please try again later';
    error = { message, statusCode: 429 };
  }

  // Default error
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || 'Server Error';

  // Don't leak error details in production
  const errorResponse = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err
    })
  };

  res.status(statusCode).json(errorResponse);
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation error helper
const createValidationError = (field, message) => {
  const error = new AppError(message, 400);
  error.field = field;
  return error;
};

// Not found error helper
const createNotFoundError = (resource = 'Resource') => {
  return new AppError(`${resource} not found`, 404);
};

// Unauthorized error helper
const createUnauthorizedError = (message = 'Not authorized') => {
  return new AppError(message, 401);
};

// Forbidden error helper
const createForbiddenError = (message = 'Access forbidden') => {
  return new AppError(message, 403);
};

// Bad request error helper
const createBadRequestError = (message = 'Bad request') => {
  return new AppError(message, 400);
};

// Conflict error helper
const createConflictError = (message = 'Resource conflict') => {
  return new AppError(message, 409);
};

// Too many requests error helper
const createTooManyRequestsError = (message = 'Too many requests') => {
  return new AppError(message, 429);
};

// Internal server error helper
const createInternalServerError = (message = 'Internal server error') => {
  return new AppError(message, 500);
};

module.exports = {
  errorHandler,
  asyncHandler,
  AppError,
  createValidationError,
  createNotFoundError,
  createUnauthorizedError,
  createForbiddenError,
  createBadRequestError,
  createConflictError,
  createTooManyRequestsError,
  createInternalServerError
}; 