/**
 * Centralized Error Handling Utility
 * 
 * Provides consistent error handling patterns across the application
 * with proper error classification, logging, and user-friendly responses.
 * 
 * @author Avinci Development Team
 * @version 2.0.0
 */

const logger = require('./logger');

/**
 * Error types for classification
 */
const ERROR_TYPES = {
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  CONFLICT: 'CONFLICT_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  EXTERNAL_SERVICE: 'EXTERNAL_SERVICE_ERROR',
  DATABASE: 'DATABASE_ERROR',
  AI_SERVICE: 'AI_SERVICE_ERROR',
  INTERNAL: 'INTERNAL_ERROR'
};

/**
 * Custom error class with type classification
 */
class AppError extends Error {
  constructor(message, type = ERROR_TYPES.INTERNAL, statusCode = 500, isOperational = true) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error constructor
 * 
 * @param {string} message - Error message
 * @param {Object} details - Validation details
 * @returns {AppError} Validation error
 */
function createValidationError(message, details = {}) {
  const error = new AppError(message, ERROR_TYPES.VALIDATION, 400);
  error.details = details;
  return error;
}

/**
 * Authentication error constructor
 * 
 * @param {string} message - Error message
 * @returns {AppError} Authentication error
 */
function createAuthenticationError(message = 'Authentication required') {
  return new AppError(message, ERROR_TYPES.AUTHENTICATION, 401);
}

/**
 * Authorization error constructor
 * 
 * @param {string} message - Error message
 * @returns {AppError} Authorization error
 */
function createAuthorizationError(message = 'Insufficient permissions') {
  return new AppError(message, ERROR_TYPES.AUTHORIZATION, 403);
}

/**
 * Not found error constructor
 * 
 * @param {string} resource - Resource that was not found
 * @returns {AppError} Not found error
 */
function createNotFoundError(resource = 'Resource') {
  return new AppError(`${resource} not found`, ERROR_TYPES.NOT_FOUND, 404);
}

/**
 * Conflict error constructor
 * 
 * @param {string} message - Error message
 * @returns {AppError} Conflict error
 */
function createConflictError(message) {
  return new AppError(message, ERROR_TYPES.CONFLICT, 409);
}

/**
 * Rate limit error constructor
 * 
 * @param {string} message - Error message
 * @returns {AppError} Rate limit error
 */
function createRateLimitError(message = 'Rate limit exceeded') {
  return new AppError(message, ERROR_TYPES.RATE_LIMIT, 429);
}

/**
 * External service error constructor
 * 
 * @param {string} service - Service name
 * @param {string} message - Error message
 * @returns {AppError} External service error
 */
function createExternalServiceError(service, message) {
  const error = new AppError(`External service error: ${message}`, ERROR_TYPES.EXTERNAL_SERVICE, 502);
  error.service = service;
  return error;
}

/**
 * Database error constructor
 * 
 * @param {string} message - Error message
 * @param {Object} query - Database query details
 * @returns {AppError} Database error
 */
function createDatabaseError(message, query = {}) {
  const error = new AppError(`Database error: ${message}`, ERROR_TYPES.DATABASE, 500);
  error.query = query;
  return error;
}

/**
 * AI service error constructor
 * 
 * @param {string} service - AI service name
 * @param {string} message - Error message
 * @returns {AppError} AI service error
 */
function createAIServiceError(service, message) {
  const error = new AppError(`AI service error: ${message}`, ERROR_TYPES.AI_SERVICE, 502);
  error.service = service;
  return error;
}

/**
 * Handles async route errors
 * 
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped function with error handling
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Global error handler middleware
 * 
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function globalErrorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Global error handler', err, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Invalid ID format';
    error = createValidationError(message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value';
    error = createConflictError(message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = createValidationError(message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = createAuthenticationError(message);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = createAuthenticationError(message);
  }

  // Default to internal server error
  if (!error.statusCode) {
    error = new AppError('Internal server error', ERROR_TYPES.INTERNAL, 500);
  }

  // Send error response
  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      type: error.type || ERROR_TYPES.INTERNAL,
      message: error.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      ...(error.details && { details: error.details }),
      ...(error.service && { service: error.service }),
      timestamp: error.timestamp || new Date().toISOString()
    }
  });
}

/**
 * Handles uncaught exceptions
 */
function handleUncaughtException() {
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', err);
    process.exit(1);
  });
}

/**
 * Handles unhandled promise rejections
 */
function handleUnhandledRejection() {
  process.on('unhandledRejection', (err, promise) => {
    logger.error('Unhandled Rejection', err, { promise });
    process.exit(1);
  });
}

/**
 * Validates request parameters
 * 
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 * @returns {Function} Validation middleware
 */
function validateRequest(schema, property = 'body') {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      const validationError = createValidationError('Validation failed', details);
      return next(validationError);
    }
    
    next();
  };
}

/**
 * Wraps database operations with error handling
 * 
 * @param {Function} operation - Database operation function
 * @returns {Function} Wrapped function with error handling
 */
function wrapDatabaseOperation(operation) {
  return async (...args) => {
    try {
      return await operation(...args);
    } catch (err) {
      logger.error('Database operation failed', err);
      throw createDatabaseError(err.message, { operation: operation.name });
    }
  };
}

/**
 * Wraps AI service operations with error handling
 * 
 * @param {string} serviceName - Name of the AI service
 * @param {Function} operation - AI service operation function
 * @returns {Function} Wrapped function with error handling
 */
function wrapAIServiceOperation(serviceName, operation) {
  return async (...args) => {
    try {
      return await operation(...args);
    } catch (err) {
      logger.error('AI service operation failed', err, { service: serviceName });
      throw createAIServiceError(serviceName, err.message);
    }
  };
}

module.exports = {
  AppError,
  ERROR_TYPES,
  createValidationError,
  createAuthenticationError,
  createAuthorizationError,
  createNotFoundError,
  createConflictError,
  createRateLimitError,
  createExternalServiceError,
  createDatabaseError,
  createAIServiceError,
  asyncHandler,
  globalErrorHandler,
  handleUncaughtException,
  handleUnhandledRejection,
  validateRequest,
  wrapDatabaseOperation,
  wrapAIServiceOperation
};
