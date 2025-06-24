import rateLimit from 'express-rate-limit'
import { Request, Response } from 'express'

export interface RateLimitConfig {
  windowMs: number
  max: number
  message?: string
  standardHeaders?: boolean
  legacyHeaders?: boolean
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

/**
 * Creates a custom rate limit handler with proper error response format
 * @param message - Custom message for rate limit exceeded
 * @returns Rate limit handler function
 */
const createRateLimitHandler = (message?: string) => {
  return (req: Request, res: Response) => {
    const response = {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: message || 'Too many requests, please try again later'
      },
      timestamp: new Date().toISOString()
    }

    res.status(429).json(response)
  }
}

/**
 * Creates a custom rate limit middleware with specified configuration
 * @param config - Rate limit configuration
 * @returns Express rate limit middleware
 */
export const createRateLimit = (config: RateLimitConfig) => {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    standardHeaders: config.standardHeaders ?? true, // Return rate limit info in headers
    legacyHeaders: config.legacyHeaders ?? false, // Disable legacy X-RateLimit-* headers
    skipSuccessfulRequests: config.skipSuccessfulRequests ?? false,
    skipFailedRequests: config.skipFailedRequests ?? false,
    handler: createRateLimitHandler(config.message),
    keyGenerator: (req: Request) => {
      // Use IP address as the key for rate limiting
      return req.ip || req.socket.remoteAddress || 'unknown'
    }
    // onLimitReached is deprecated in v7, removed
  })
}

/**
 * General API rate limiting - 100 requests per 15 minutes
 */
export const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many API requests from this IP, please try again later'
})

/**
 * Contact form rate limiting - 5 requests per 15 minutes (or lenient for tests)
 */
export const contactRateLimit = process.env.NODE_ENV === 'test' 
  ? createRateLimit({
      windowMs: 1000, // 1 second
      max: 1000, // High limit for tests
      message: 'Test contact rate limit exceeded'
    })
  : createRateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // Limit each IP to 5 contact form submissions per windowMs
      message: 'Too many contact form submissions from this IP, please try again later'
    })

/**
 * Newsletter signup rate limiting - 3 requests per 10 minutes (or lenient for tests)
 */
export const newsletterRateLimit = process.env.NODE_ENV === 'test'
  ? createRateLimit({
      windowMs: 1000, // 1 second
      max: 1000, // High limit for tests
      message: 'Test newsletter rate limit exceeded'
    })
  : createRateLimit({
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: 3, // Limit each IP to 3 newsletter signups per windowMs
      message: 'Too many newsletter signup attempts from this IP, please try again later'
    })

/**
 * Search rate limiting - 30 requests per minute
 */
export const searchRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 search requests per minute
  message: 'Too many search requests from this IP, please try again later'
})

/**
 * Authentication rate limiting - 10 requests per 15 minutes
 */
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth attempts per windowMs
  message: 'Too many authentication attempts from this IP, please try again later',
  skipSuccessfulRequests: true // Don't count successful auth attempts
})

/**
 * File upload rate limiting - 10 uploads per hour
 */
export const uploadRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 file uploads per hour
  message: 'Too many file upload attempts from this IP, please try again later'
})

/**
 * Strict rate limiting for sensitive operations - 3 requests per hour
 */
export const strictRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per hour
  message: 'Rate limit exceeded for this sensitive operation, please try again later'
})

/**
 * Development rate limiting (more lenient) - 1000 requests per 15 minutes
 */
export const developmentRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Very high limit for development
  message: 'Development rate limit exceeded'
})

/**
 * Rate limiting configuration based on environment
 */
export const getEnvironmentRateLimit = () => {
  if (process.env.NODE_ENV === 'development') {
    return developmentRateLimit
  }
  
  if (process.env.NODE_ENV === 'test') {
    // Very lenient rate limiting for tests
    return createRateLimit({
      windowMs: 1000, // 1 second
      max: 1000, // High limit for fast test execution
      message: 'Test rate limit exceeded'
    })
  }
  
  return apiRateLimit
}

/**
 * Creates a rate limiter for specific endpoints based on their risk level
 * @param endpoint - Endpoint identifier
 * @returns Appropriate rate limit middleware
 */
export const getEndpointRateLimit = (endpoint: string) => {
  switch (endpoint) {
    case 'contact':
      return contactRateLimit
    
    case 'newsletter':
      return newsletterRateLimit
    
    case 'search':
      return searchRateLimit
    
    case 'auth':
      return authRateLimit
    
    case 'upload':
      return uploadRateLimit
    
    case 'strict':
      return strictRateLimit
    
    case 'api':
    default:
      return getEnvironmentRateLimit()
  }
}

/**
 * IP whitelist bypass middleware
 * @param whitelist - Array of IP addresses to bypass rate limiting
 * @returns Middleware function that skips rate limiting for whitelisted IPs
 */
export const createIPWhitelist = (whitelist: string[]) => {
  return (req: Request, res: Response, next: Function) => {
    const clientIP = req.ip || req.socket.remoteAddress
    
    if (clientIP && whitelist.includes(clientIP)) {
      // Skip rate limiting for whitelisted IPs
      return next()
    }
    
    // Continue to rate limiting
    next()
  }
}

/**
 * Creates a dynamic rate limiter that adjusts based on server load
 * @param baseConfig - Base rate limit configuration
 * @returns Dynamic rate limit middleware
 */
export const createDynamicRateLimit = (baseConfig: RateLimitConfig) => {
  return rateLimit({
    ...baseConfig,
    max: (req: Request) => {
      // In a real implementation, you might check server metrics here
      // For now, just return the base max
      return baseConfig.max
    },
    handler: createRateLimitHandler(baseConfig.message)
  })
}

/**
 * Rate limit middleware that applies different limits based on user type
 * @param limits - Object with different limits for different user types
 * @returns Rate limit middleware
 */
export const createUserTypeRateLimit = (limits: {
  anonymous: number
  authenticated: number
  premium: number
}) => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: (req: Request) => {
      // In a real implementation, check user authentication status
      // For now, assume all users are anonymous
      return limits.anonymous
    },
    standardHeaders: true,
    handler: createRateLimitHandler('Rate limit exceeded based on user type')
  })
}

/**
 * Global rate limiting setup for the entire application
 */
export const setupGlobalRateLimit = () => {
  const environment = process.env.NODE_ENV || 'development'
  
  console.log(`Setting up rate limiting for environment: ${environment}`)
  
  switch (environment) {
    case 'production':
      return apiRateLimit
    
    case 'development':
      return developmentRateLimit
    
    case 'test':
      return createRateLimit({
        windowMs: 1000,
        max: 1000,
        message: 'Test environment rate limit'
      })
    
    default:
      return apiRateLimit
  }
}