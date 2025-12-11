module.exports = function errorHandler(err, req, res, next) {
  console.log('[ERROR-HANDLER] ❌ Unhandled error:', { message: err.message, path: req.path, stack: err.stack });
  
  // CRITICAL: Always set JSON content type, NEVER HTML
  res.set('Content-Type', 'application/json');
  
  // Default error response
  let status = err.statusCode || 500;
  let message = err.message || 'Server Error';
  let details = null;

  // Handle MongoDB errors
  if (err.name === 'MongoServerError' || err.name === 'MongoError') {
    status = 400;
    
    // E11000 Duplicate Key Error
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0];
      message = `Duplicate value for field: ${field}. This value already exists.`;
      details = `Field '${field}' must be unique`;
    }
    // MongoDB validation error
    else if (err.code === 121) {
      message = 'Document validation failed against schema';
      details = err.errmsg;
    }
    // Generic MongoDB server error
    else {
      message = 'Database operation failed';
      details = err.errmsg || err.message;
    }
  }
  // Handle Mongoose validation error
  else if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
    const errors = {};
    Object.keys(err.errors || {}).forEach(key => {
      errors[key] = err.errors[key].message;
    });
    details = errors;
  }
  // Handle Mongoose cast error
  else if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    details = err.message;
  }
  // Handle Mongoose duplicate key error (index)
  else if (err.name === 'MongooseError' && err.message.includes('duplicate')) {
    status = 400;
    message = 'Duplicate entry detected';
    details = err.message;
  }

  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { details, stack: err.stack }),
    data: null
  };

  res.status(status).json(response);
};
