/**
 * Centralized Logging Utility
 * 
 * Provides structured logging with different levels and proper formatting
 * for production and development environments.
 * 
 * @author Avinci Development Team
 * @version 2.0.0
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const currentLogLevel = process.env.LOG_LEVEL ? 
  LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] : 
  LOG_LEVELS.INFO;

/**
 * Logs error messages
 * 
 * @param {string} message - Error message
 * @param {Error|Object} error - Error object or additional data
 * @param {Object} context - Additional context data
 */
function error(message, error = null, context = {}) {
  if (currentLogLevel >= LOG_LEVELS.ERROR) {
    const logData = {
      level: 'ERROR',
      message,
      timestamp: new Date().toISOString(),
      ...context
    };
    
    if (error) {
      if (error instanceof Error) {
        logData.error = {
          name: error.name,
          message: error.message,
          stack: error.stack
        };
      } else {
        logData.error = error;
      }
    }
    
    console.error(JSON.stringify(logData, null, 2));
  }
}

/**
 * Logs warning messages
 * 
 * @param {string} message - Warning message
 * @param {Object} context - Additional context data
 */
function warn(message, context = {}) {
  if (currentLogLevel >= LOG_LEVELS.WARN) {
    const logData = {
      level: 'WARN',
      message,
      timestamp: new Date().toISOString(),
      ...context
    };
    
    console.warn(JSON.stringify(logData, null, 2));
  }
}

/**
 * Logs informational messages
 * 
 * @param {string} message - Info message
 * @param {Object} context - Additional context data
 */
function info(message, context = {}) {
  if (currentLogLevel >= LOG_LEVELS.INFO) {
    const logData = {
      level: 'INFO',
      message,
      timestamp: new Date().toISOString(),
      ...context
    };
    
    console.log(JSON.stringify(logData, null, 2));
  }
}

/**
 * Logs debug messages (only in development)
 * 
 * @param {string} message - Debug message
 * @param {Object} context - Additional context data
 */
function debug(message, context = {}) {
  if (currentLogLevel >= LOG_LEVELS.DEBUG) {
    const logData = {
      level: 'DEBUG',
      message,
      timestamp: new Date().toISOString(),
      ...context
    };
    
    console.log(JSON.stringify(logData, null, 2));
  }
}

/**
 * Logs API requests and responses
 * 
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {number} statusCode - Response status code
 * @param {number} duration - Request duration in ms
 * @param {Object} context - Additional context data
 */
function apiRequest(method, url, statusCode, duration, context = {}) {
  const level = statusCode >= 400 ? 'ERROR' : 'INFO';
  const message = `${method} ${url} ${statusCode} ${duration}ms`;
  
  const logData = {
    level,
    message,
    timestamp: new Date().toISOString(),
    method,
    url,
    statusCode,
    duration,
    ...context
  };
  
  if (level === 'ERROR') {
    console.error(JSON.stringify(logData, null, 2));
  } else {
    console.log(JSON.stringify(logData, null, 2));
  }
}

/**
 * Logs database operations
 * 
 * @param {string} operation - Database operation (SELECT, INSERT, UPDATE, DELETE)
 * @param {string} table - Table name
 * @param {number} duration - Query duration in ms
 * @param {Object} context - Additional context data
 */
function dbOperation(operation, table, duration, context = {}) {
  const level = duration > 1000 ? 'WARN' : 'INFO';
  const message = `${operation} ${table} ${duration}ms`;
  
  const logData = {
    level,
    message,
    timestamp: new Date().toISOString(),
    operation,
    table,
    duration,
    ...context
  };
  
  if (level === 'WARN') {
    console.warn(JSON.stringify(logData, null, 2));
  } else {
    console.log(JSON.stringify(logData, null, 2));
  }
}

/**
 * Logs AI service operations
 * 
 * @param {string} service - AI service name (OpenAI, Claude, etc.)
 * @param {string} operation - Operation type
 * @param {number} duration - Operation duration in ms
 * @param {Object} context - Additional context data
 */
function aiOperation(service, operation, duration, context = {}) {
  const level = duration > 5000 ? 'WARN' : 'INFO';
  const message = `${service} ${operation} ${duration}ms`;
  
  const logData = {
    level,
    message,
    timestamp: new Date().toISOString(),
    service,
    operation,
    duration,
    ...context
  };
  
  if (level === 'WARN') {
    console.warn(JSON.stringify(logData, null, 2));
  } else {
    console.log(JSON.stringify(logData, null, 2));
  }
}

module.exports = {
  error,
  warn,
  info,
  debug,
  apiRequest,
  dbOperation,
  aiOperation,
  LOG_LEVELS
};
