import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'

export interface ValidationSchemas {
  body?: Joi.ObjectSchema
  params?: Joi.ObjectSchema
  query?: Joi.ObjectSchema
}

export interface ValidationError {
  success: false
  error: {
    code: string
    message: string
  }
  timestamp: string
}

/**
 * Creates a validation middleware for request validation
 * @param schemas - Object containing Joi schemas for body, params, and query
 * @returns Express middleware function
 */
export const createValidationMiddleware = (schemas: ValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = []

    // Validate request body
    if (schemas.body) {
      // If body is undefined but schema exists, treat as empty object for validation
      const bodyToValidate = req.body !== undefined ? req.body : {}
      const { error } = schemas.body.validate(bodyToValidate, { 
        abortEarly: false,
        stripUnknown: true,
        convert: true
      })
      
      if (error) {
        error.details.forEach(detail => {
          errors.push(detail.message)
        })
      }
    }

    // Validate request parameters
    if (schemas.params) {
      // Convert string params to appropriate types for validation
      const convertedParams: any = {}
      Object.keys(req.params).forEach(key => {
        const value = req.params[key]
        // Try to convert to number if it looks like a number
        if (/^\d+$/.test(value)) {
          convertedParams[key] = parseInt(value, 10)
        } else {
          convertedParams[key] = value
        }
      })

      const { error } = schemas.params.validate(convertedParams, { 
        abortEarly: false,
        stripUnknown: true,
        convert: true
      })
      
      if (error) {
        error.details.forEach(detail => {
          errors.push(detail.message)
        })
      }
    }

    // Validate query parameters
    if (schemas.query) {
      // Convert string query params to appropriate types for validation
      const convertedQuery: any = {}
      Object.keys(req.query).forEach(key => {
        const value = req.query[key] as string
        // Try to convert to number if it looks like a number
        if (/^\d+$/.test(value)) {
          convertedQuery[key] = parseInt(value, 10)
        } else {
          convertedQuery[key] = value
        }
      })

      const { error } = schemas.query.validate(convertedQuery, { 
        abortEarly: false,
        stripUnknown: true,
        convert: true
      })
      
      if (error) {
        error.details.forEach(detail => {
          errors.push(detail.message)
        })
      }
    }

    // If there are validation errors, return 400
    if (errors.length > 0) {
      const response: ValidationError = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: errors.join('; ')
        },
        timestamp: new Date().toISOString()
      }

      return res.status(400).json(response)
    }

    next()
  }
}

/**
 * Generic validation middleware that can be used with pre-defined schemas
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  // This is a placeholder that can be used for basic validation
  // Most validation should use createValidationMiddleware with specific schemas
  next()
}

// Common validation schemas for reuse across the application
export const commonSchemas = {
  // ID parameter validation
  idParam: Joi.object({
    id: Joi.number().integer().positive().required()
  }),

  // Pagination query validation
  paginationQuery: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional()
  }),

  // Search query validation
  searchQuery: Joi.object({
    q: Joi.string().min(1).max(100).optional(),
    search: Joi.string().min(1).max(100).optional()
  }),

  // Sort query validation
  sortQuery: Joi.object({
    sort: Joi.string().valid('name', 'createdAt', 'updatedAt', 'releaseDate', 'publishedAt').optional(),
    order: Joi.string().valid('asc', 'desc').optional()
  })
}

// Artist-specific validation schemas
export const artistSchemas = {
  create: {
    body: Joi.object({
      name: Joi.string().min(1).max(255).required(),
      bio: Joi.string().max(5000).optional().allow(null, ''),
      socialLinks: Joi.object({
        spotify: Joi.string().uri().optional(),
        appleMusic: Joi.string().uri().optional(),
        youtube: Joi.string().uri().optional(),
        instagram: Joi.string().uri().optional(),
        facebook: Joi.string().uri().optional(),
        bandcamp: Joi.string().uri().optional(),
        soundcloud: Joi.string().uri().optional(),
        tiktok: Joi.string().uri().optional()
      }).optional(),
      isFeatured: Joi.boolean().optional()
    })
  },

  update: {
    params: commonSchemas.idParam,
    body: Joi.object({
      name: Joi.string().min(1).max(255).optional(),
      bio: Joi.string().max(5000).optional().allow(null, ''),
      socialLinks: Joi.object({
        spotify: Joi.string().uri().optional(),
        appleMusic: Joi.string().uri().optional(),
        youtube: Joi.string().uri().optional(),
        instagram: Joi.string().uri().optional(),
        facebook: Joi.string().uri().optional(),
        bandcamp: Joi.string().uri().optional(),
        soundcloud: Joi.string().uri().optional(),
        tiktok: Joi.string().uri().optional()
      }).optional(),
      isFeatured: Joi.boolean().optional()
    })
  },

  list: {
    query: Joi.object({
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      q: Joi.string().min(1).max(100).optional(),
      search: Joi.string().min(1).max(100).optional(),
      featured: Joi.boolean().optional(),
      includeReleases: Joi.boolean().optional()
    })
  },

  getById: {
    params: commonSchemas.idParam,
    query: Joi.object({
      includeReleases: Joi.boolean().optional()
    })
  }
}

// Release-specific validation schemas
export const releaseSchemas = {
  create: {
    body: Joi.object({
      artistId: Joi.number().integer().positive().required(),
      title: Joi.string().min(1).max(255).required(),
      type: Joi.string().valid('album', 'single', 'ep').required(),
      releaseDate: Joi.date().max('now').min('1900-01-01').required(),
      description: Joi.string().max(2000).optional().allow(null, ''),
      streamingLinks: Joi.object({
        spotify: Joi.string().uri().optional(),
        appleMusic: Joi.string().uri().optional(),
        youtube: Joi.string().uri().optional(),
        bandcamp: Joi.string().uri().optional(),
        soundcloud: Joi.string().uri().optional()
      }).optional()
    })
  },

  update: {
    params: commonSchemas.idParam,
    body: Joi.object({
      title: Joi.string().min(1).max(255).optional(),
      type: Joi.string().valid('album', 'single', 'ep').optional(),
      releaseDate: Joi.date().max('now').min('1900-01-01').optional(),
      description: Joi.string().max(2000).optional().allow(null, ''),
      streamingLinks: Joi.object({
        spotify: Joi.string().uri().optional(),
        appleMusic: Joi.string().uri().optional(),
        youtube: Joi.string().uri().optional(),
        bandcamp: Joi.string().uri().optional(),
        soundcloud: Joi.string().uri().optional()
      }).optional()
    })
  },

  list: {
    query: Joi.object({
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      q: Joi.string().min(1).max(100).optional(),
      search: Joi.string().min(1).max(100).optional(),
      artistId: Joi.number().integer().positive().optional(),
      type: Joi.string().valid('album', 'single', 'ep').optional(),
      includeArtist: Joi.boolean().optional()
    })
  },

  getById: {
    params: commonSchemas.idParam,
    query: Joi.object({
      includeArtist: Joi.boolean().optional()
    })
  }
}

// News-specific validation schemas
export const newsSchemas = {
  create: {
    body: Joi.object({
      title: Joi.string().min(1).max(255).required(),
      content: Joi.string().min(10).required(),
      author: Joi.string().min(1).max(100).optional(),
      publishedAt: Joi.date().optional().allow(null)
    })
  },

  update: {
    params: commonSchemas.idParam,
    body: Joi.object({
      title: Joi.string().min(1).max(255).optional(),
      content: Joi.string().min(10).optional(),
      author: Joi.string().min(1).max(100).optional(),
      publishedAt: Joi.date().optional().allow(null)
    })
  },

  list: {
    query: Joi.object({
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      q: Joi.string().min(1).max(100).optional(),
      search: Joi.string().min(1).max(100).optional(),
      published: Joi.boolean().optional()
    })
  },

  getById: {
    params: commonSchemas.idParam
  },

  getBySlug: {
    params: Joi.object({
      slug: Joi.string().min(1).max(255).required()
    })
  }
}

// Contact-specific validation schemas
export const contactSchemas = {
  create: {
    body: Joi.object({
      name: Joi.string().min(2).max(100).required().trim(),
      email: Joi.string().email().max(255).required().trim(),
      subject: Joi.string().min(5).max(200).required().trim(),
      message: Joi.string().min(10).max(2000).required().trim(),
      type: Joi.string().valid('demo', 'business', 'general', 'press').required()
    })
  },

  list: {
    query: Joi.object({
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      q: Joi.string().min(1).max(100).optional(),
      search: Joi.string().min(1).max(100).optional(),
      type: Joi.string().valid('demo', 'business', 'general', 'press').optional(),
      processed: Joi.boolean().optional()
    })
  },

  getById: {
    params: commonSchemas.idParam
  },

  update: {
    params: commonSchemas.idParam,
    body: Joi.object({
      processed: Joi.boolean().required()
    })
  },

  unprocessed: {
    query: Joi.object({
      limit: Joi.number().integer().min(1).max(50).optional()
    })
  }
}

// Newsletter-specific validation schemas
export const newsletterSchemas = {
  subscribe: {
    body: Joi.object({
      email: Joi.string().email().max(255).required().trim()
    })
  },

  unsubscribe: {
    body: Joi.object({
      email: Joi.string().email().max(255).required().trim()
    })
  },

  list: {
    query: Joi.object({
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      q: Joi.string().min(1).max(100).optional(),
      search: Joi.string().min(1).max(100).optional(),
      isActive: Joi.boolean().optional()
    })
  },

  getByEmail: {
    params: Joi.object({
      email: Joi.string().email().required()
    })
  }
}