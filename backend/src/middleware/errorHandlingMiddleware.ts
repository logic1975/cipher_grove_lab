import { Request, Response, NextFunction } from 'express'
import { ValidationError } from 'joi'

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
}

/**
 * Async handler wrapper that catches async errors and passes them to error handler
 * @param fn - Async function to wrap
 * @returns Express middleware function
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * Determines the appropriate HTTP status code based on error type
 * @param error - Error object
 * @returns HTTP status code
 */
const getStatusCode = (error: any): number => {
  // Check for custom status code
  if (error.status) {
    return error.status
  }

  // Check for Joi validation errors
  if (error.isJoi || error instanceof ValidationError) {
    return 400
  }

  // Check for Prisma errors
  if (error.code) {
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        return 400
      case 'P2025': // Record not found
        return 404
      case 'P2003': // Foreign key constraint violation
        return 400
      case 'P1001': // Cannot reach database
      case 'P1002': // Database timeout
        return 503
      default:
        return 500
    }
  }

  // Check for common HTTP error patterns
  if (error.message) {
    const message = error.message.toLowerCase()
    if (message.includes('not found')) {
      return 404
    }
    if (message.includes('unauthorized') || message.includes('forbidden')) {
      return 403
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 400
    }
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return 429
    }
  }

  // Default to 500 for unknown errors
  return 500
}

/**
 * Determines the appropriate error code based on status and error type
 * @param status - HTTP status code
 * @param error - Error object
 * @returns Error code string
 */
const getErrorCode = (status: number, error: any): string => {
  // Custom error codes based on status
  switch (status) {
    case 400:
      if (error.isJoi || error instanceof ValidationError) {
        return 'VALIDATION_ERROR'
      }
      if (error.code === 'P2002') {
        return 'DUPLICATE_ENTRY'
      }
      if (error.code === 'P2003') {
        return 'FOREIGN_KEY_VIOLATION'
      }
      return 'BAD_REQUEST'
    
    case 401:
      return 'UNAUTHORIZED'
    
    case 403:
      return 'FORBIDDEN'
    
    case 404:
      return 'NOT_FOUND'
    
    case 409:
      return 'CONFLICT'
    
    case 429:
      return 'RATE_LIMIT_EXCEEDED'
    
    case 503:
      return 'SERVICE_UNAVAILABLE'
    
    case 500:
    default:
      return 'INTERNAL_ERROR'
  }
}

/**
 * Formats error message based on error type
 * @param error - Error object
 * @param status - HTTP status code
 * @returns Formatted error message
 */
const getErrorMessage = (error: any, status: number): string => {
  // Handle Joi validation errors
  if (error.isJoi || error instanceof ValidationError) {
    return error.details?.map((detail: any) => detail.message).join('; ') || error.message
  }

  // Handle Prisma errors
  if (error.code) {
    switch (error.code) {
      case 'P2002':
        const target = error.meta?.target?.[0] || 'field'
        return `${target.charAt(0).toUpperCase() + target.slice(1)} already exists`
      
      case 'P2025':
        return 'Record not found'
      
      case 'P2003':
        return 'Related record not found'
      
      case 'P1001':
        return 'Cannot connect to database'
      
      case 'P1002':
        return 'Database operation timed out'
      
      default:
        return error.message || 'Database error occurred'
    }
  }

  // Handle different error types
  if (error.message) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  // Fallback messages based on status
  switch (status) {
    case 400:
      return 'Bad request'
    case 401:
      return 'Unauthorized'
    case 403:
      return 'Forbidden'
    case 404:
      return 'Not found'
    case 409:
      return 'Conflict'
    case 429:
      return 'Too many requests'
    case 503:
      return 'Service unavailable'
    case 500:
    default:
      return 'Internal server error'
  }
}

/**
 * Centralized error handling middleware
 * @param error - Error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // If response has already been sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(error)
  }

  // Handle null/undefined errors
  if (!error) {
    error = new Error('Unknown error occurred')
  }

  // Determine status code and error details
  const status = getStatusCode(error)
  const code = getErrorCode(status, error)
  const message = getErrorMessage(error, status)

  // Log error for debugging (in production, use proper logging)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error occurred:', {
      status,
      code,
      message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    })
  }

  // Prepare error response
  const errorResponse: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message
    },
    timestamp: new Date().toISOString()
  }

  // Include additional details in development
  if (process.env.NODE_ENV === 'development' && error.stack) {
    errorResponse.error.details = {
      stack: error.stack,
      originalError: error
    }
  }

  // Send error response
  res.status(status).json(errorResponse)
}

/**
 * 404 handler for unmatched routes
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error(`Route ${req.originalUrl} not found`)
  ;(error as any).status = 404
  next(error)
}

/**
 * JSON parsing error handler
 * @param error - Error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const jsonErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof SyntaxError && 'body' in error) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Invalid JSON in request body'
      },
      timestamp: new Date().toISOString()
    }
    
    res.status(400).json(errorResponse)
    return
  }
  
  next(error)
}

/**
 * Development error handler that includes stack traces
 * @param error - Error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const developmentErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.headersSent) {
    return next(error)
  }

  const status = getStatusCode(error)
  const code = getErrorCode(status, error)
  const message = getErrorMessage(error, status)

  console.error('Development Error:', {
    error: error.message,
    stack: error.stack,
    request: {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query
    },
    timestamp: new Date().toISOString()
  })

  const errorResponse: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details: {
        stack: error.stack,
        request: {
          method: req.method,
          url: req.originalUrl,
          body: req.body,
          params: req.params,
          query: req.query
        }
      }
    },
    timestamp: new Date().toISOString()
  }

  res.status(status).json(errorResponse)
}

/**
 * Production error handler that hides sensitive information
 * @param error - Error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const productionErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.headersSent) {
    return next(error)
  }

  const status = getStatusCode(error)
  const code = getErrorCode(status, error)
  
  // In production, don't expose internal error messages for 5xx errors
  let message = getErrorMessage(error, status)
  if (status >= 500) {
    message = 'Internal server error'
  }

  // Log error for monitoring (use proper logging service in production)
  console.error('Production Error:', {
    code,
    status,
    path: req.path,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString()
  })

  const errorResponse: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message
    },
    timestamp: new Date().toISOString()
  }

  res.status(status).json(errorResponse)
}