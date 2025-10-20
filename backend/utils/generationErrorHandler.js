const { logger } = require('./logger');

class GenerationErrorHandler {
  static handleFileError(error, fileName) {
    const errorTypes = {
      'LIMIT_FILE_SIZE': {
        message: `File ${fileName} is too large. Maximum size is 10MB.`,
        code: 'FILE_TOO_LARGE',
        statusCode: 400
      },
      'LIMIT_FILE_COUNT': {
        message: 'Too many files uploaded. Maximum is 10 files.',
        code: 'TOO_MANY_FILES',
        statusCode: 400
      },
      'INVALID_FILE_TYPE': {
        message: `File ${fileName} has an invalid type. Only TXT, PDF, DOC, DOCX, CSV, and JSON files are allowed.`,
        code: 'INVALID_FILE_TYPE',
        statusCode: 400
      },
      'ENOENT': {
        message: `File ${fileName} not found.`,
        code: 'FILE_NOT_FOUND',
        statusCode: 404
      },
      'EACCES': {
        message: `Permission denied accessing file ${fileName}.`,
        code: 'FILE_ACCESS_DENIED',
        statusCode: 403
      }
    };

    const errorType = errorTypes[error.code] || {
      message: `Error processing file ${fileName}: ${error.message}`,
      code: 'FILE_PROCESSING_ERROR',
      statusCode: 500
    };

    logger.error(`File processing error for ${fileName}:`, error);
    return errorType;
  }

  static handleOpenAIError(error) {
    const errorTypes = {
      'insufficient_quota': {
        message: 'OpenAI API quota exceeded. Please try again later.',
        code: 'QUOTA_EXCEEDED',
        statusCode: 429
      },
      'rate_limit_exceeded': {
        message: 'OpenAI API rate limit exceeded. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        statusCode: 429
      },
      'invalid_api_key': {
        message: 'OpenAI API key is invalid or expired.',
        code: 'INVALID_API_KEY',
        statusCode: 401
      },
      'context_length_exceeded': {
        message: 'Transcript is too long for processing. Please split into smaller files.',
        code: 'CONTEXT_TOO_LONG',
        statusCode: 400
      },
      'timeout': {
        message: 'OpenAI API request timed out. Please try again.',
        code: 'API_TIMEOUT',
        statusCode: 408
      }
    };

    const errorType = errorTypes[error.code] || {
      message: `OpenAI API error: ${error.message}`,
      code: 'OPENAI_API_ERROR',
      statusCode: 500
    };

    logger.error('OpenAI API error:', error);
    return errorType;
  }

  static handleGenerationError(error, context = {}) {
    const { fileName, step, agentId } = context;
    
    let errorInfo = {
      message: 'An unexpected error occurred during agent generation.',
      code: 'GENERATION_ERROR',
      statusCode: 500
    };

    if (error.name === 'ValidationError') {
      errorInfo = {
        message: `Validation error: ${error.message}`,
        code: 'VALIDATION_ERROR',
        statusCode: 400
      };
    } else if (error.name === 'TimeoutError') {
      errorInfo = {
        message: 'Generation process timed out. Please try with smaller files.',
        code: 'GENERATION_TIMEOUT',
        statusCode: 408
      };
    } else if (error.message.includes('memory')) {
      errorInfo = {
        message: 'Insufficient memory to process the request. Please try with smaller files.',
        code: 'INSUFFICIENT_MEMORY',
        statusCode: 507
      };
    } else if (error.message.includes('network')) {
      errorInfo = {
        message: 'Network error occurred. Please check your connection and try again.',
        code: 'NETWORK_ERROR',
        statusCode: 503
      };
    }

    logger.error('Generation error:', {
      error: error.message,
      stack: error.stack,
      context
    });

    return errorInfo;
  }

  static handleDatabaseError(error, operation = 'database operation') {
    const errorTypes = {
      '23505': { // Unique constraint violation
        message: 'A record with this information already exists.',
        code: 'DUPLICATE_RECORD',
        statusCode: 409
      },
      '23503': { // Foreign key constraint violation
        message: 'Referenced record does not exist.',
        code: 'FOREIGN_KEY_VIOLATION',
        statusCode: 400
      },
      '23502': { // Not null constraint violation
        message: 'Required field is missing.',
        code: 'NULL_CONSTRAINT_VIOLATION',
        statusCode: 400
      },
      'ECONNREFUSED': {
        message: 'Database connection failed. Please try again later.',
        code: 'DATABASE_CONNECTION_ERROR',
        statusCode: 503
      },
      'ETIMEDOUT': {
        message: 'Database operation timed out. Please try again.',
        code: 'DATABASE_TIMEOUT',
        statusCode: 408
      }
    };

    const errorType = errorTypes[error.code] || {
      message: `Database error during ${operation}: ${error.message}`,
      code: 'DATABASE_ERROR',
      statusCode: 500
    };

    logger.error(`Database error during ${operation}:`, error);
    return errorType;
  }

  static formatErrorResponse(error, context = {}) {
    let errorInfo;

    if (error.code && error.code.startsWith('LIMIT_')) {
      errorInfo = this.handleFileError(error, context.fileName);
    } else if (error.message && error.message.includes('OpenAI')) {
      errorInfo = this.handleOpenAIError(error);
    } else if (error.name === 'SequelizeError' || error.name === 'QueryError') {
      errorInfo = this.handleDatabaseError(error, context.operation);
    } else {
      errorInfo = this.handleGenerationError(error, context);
    }

    return {
      success: false,
      error: errorInfo.message,
      code: errorInfo.code,
      statusCode: errorInfo.statusCode,
      timestamp: new Date().toISOString(),
      context: context
    };
  }

  static async retryOperation(operation, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Don't retry certain types of errors
        if (error.code === 'VALIDATION_ERROR' || 
            error.code === 'INVALID_FILE_TYPE' ||
            error.code === 'FILE_TOO_LARGE') {
          break;
        }
        
        logger.warn(`Operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`, {
          error: error.message,
          attempt
        });
        
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    throw lastError;
  }

  static validateFile(file) {
    const errors = [];
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      errors.push('File size exceeds 10MB limit');
    }
    
    // Check file type
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/json'
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push('Invalid file type. Only TXT, PDF, DOC, DOCX, CSV, and JSON files are allowed');
    }
    
    // Check file name
    if (!file.originalname || file.originalname.trim() === '') {
      errors.push('File name is required');
    }
    
    return errors;
  }

  static validateGenerationRequest(files, context) {
    const errors = [];
    
    // Check if files are provided
    if (!files || files.length === 0) {
      errors.push('At least one file is required');
    }
    
    // Check file count limit
    if (files && files.length > 10) {
      errors.push('Maximum 10 files allowed per request');
    }
    
    // Validate each file
    if (files) {
      files.forEach((file, index) => {
        const fileErrors = this.validateFile(file);
        if (fileErrors.length > 0) {
          errors.push(`File ${index + 1} (${file.originalname}): ${fileErrors.join(', ')}`);
        }
      });
    }
    
    // Validate context
    if (context && context.language && !['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'].includes(context.language)) {
      errors.push('Invalid language code');
    }
    
    return errors;
  }
}

module.exports = GenerationErrorHandler;
