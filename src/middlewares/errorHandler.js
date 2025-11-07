const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err.errors && Array.isArray(err.errors)) {
    statusCode = 400;
    message = err.errors.length === 1 
      ? err.errors[0] 
      : 'Validation failed. Please check your input.';
  }

  // Handle MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    message = `This ${field} is already in use. Please use a different ${field}.`;
  }

  // Handle MongoDB cast error
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format. Please provide a valid ID.';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please login again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please login again.';
  }

  // Build response
  const response = {
    status: 'failed',
    message,
  };

  // Include errors array if multiple validation errors
  if (err.errors && Array.isArray(err.errors) && err.errors.length > 1) {
    response.errors = err.errors;
  }
  
  res.status(statusCode).json(response);
};

module.exports = errorHandler;

