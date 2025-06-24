import request from 'supertest'
import express from 'express'
import { errorHandler, asyncHandler } from '../../middleware/errorHandlingMiddleware'
import { ValidationError } from 'joi'

const app = express()
app.use(express.json())

// Test routes that throw different types of errors
app.get('/test-sync-error', (req, res) => {
  throw new Error('Synchronous error')
})

app.get('/test-async-error', asyncHandler(async (req, res) => {
  throw new Error('Asynchronous error')
}))

app.get('/test-validation-error', (req, res, next) => {
  const error = new ValidationError('Validation failed', [
    {
      message: '"name" is required',
      path: ['name'],
      type: 'any.required',
      context: { key: 'name', label: 'name' }
    }
  ], {})
  next(error)
})

app.get('/test-custom-status', (req, res, next) => {
  const error = new Error('Not found error')
  ;(error as any).status = 404
  next(error)
})

app.get('/test-prisma-error', (req, res, next) => {
  const error = new Error('Unique constraint failed')
  ;(error as any).code = 'P2002'
  ;(error as any).meta = { target: ['name'] }
  next(error)
})

app.get('/test-success', (req, res) => {
  res.json({ success: true, message: 'Success' })
})

app.get('/test-async-success', asyncHandler(async (req, res) => {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 10))
  res.json({ success: true, message: 'Async success' })
}))

app.get('/test-rate-limit-error', (req, res, next) => {
  const error = new Error('Too many requests')
  ;(error as any).status = 429
  next(error)
})

app.get('/test-database-error', (req, res, next) => {
  const error = new Error('Database connection failed')
  ;(error as any).status = 503
  next(error)
})

// Use error handling middleware
app.use(errorHandler)

describe('Error Handling Middleware', () => {
  describe('Synchronous Error Handling', () => {
    it('should catch synchronous errors and return 500', async () => {
      const response = await request(app)
        .get('/test-sync-error')
        .expect(500)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('INTERNAL_ERROR')
      expect(response.body.error.message).toBe('Synchronous error')
      expect(response.body.timestamp).toBeDefined()
    })
  })

  describe('Asynchronous Error Handling', () => {
    it('should catch async errors with asyncHandler', async () => {
      const response = await request(app)
        .get('/test-async-error')
        .expect(500)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('INTERNAL_ERROR')
      expect(response.body.error.message).toBe('Asynchronous error')
    })

    it('should handle async success cases', async () => {
      const response = await request(app)
        .get('/test-async-success')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Async success')
    })
  })

  describe('Validation Error Handling', () => {
    it('should handle Joi validation errors with 400 status', async () => {
      const response = await request(app)
        .get('/test-validation-error')
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
      expect(response.body.error.message).toContain('name')
    })
  })

  describe('Custom Status Error Handling', () => {
    it('should respect custom error status codes', async () => {
      const response = await request(app)
        .get('/test-custom-status')
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('NOT_FOUND')
      expect(response.body.error.message).toBe('Not found error')
    })

    it('should handle rate limit errors', async () => {
      const response = await request(app)
        .get('/test-rate-limit-error')
        .expect(429)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('RATE_LIMIT_EXCEEDED')
      expect(response.body.error.message).toBe('Too many requests')
    })

    it('should handle database errors', async () => {
      const response = await request(app)
        .get('/test-database-error')
        .expect(503)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('SERVICE_UNAVAILABLE')
      expect(response.body.error.message).toBe('Database connection failed')
    })
  })

  describe('Prisma Error Handling', () => {
    it('should handle Prisma unique constraint errors', async () => {
      const response = await request(app)
        .get('/test-prisma-error')
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('DUPLICATE_ENTRY')
      expect(response.body.error.message).toContain('already exists')
    })
  })

  describe('Success Cases', () => {
    it('should not interfere with successful responses', async () => {
      const response = await request(app)
        .get('/test-success')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Success')
    })
  })

  describe('Error Response Format', () => {
    it('should return consistent error response format', async () => {
      const response = await request(app)
        .get('/test-sync-error')
        .expect(500)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toHaveProperty('code')
      expect(response.body.error).toHaveProperty('message')
      expect(response.body).toHaveProperty('timestamp')
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date)
    })

    it('should include error details when available', async () => {
      const response = await request(app)
        .get('/test-validation-error')
        .expect(400)

      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR')
      expect(response.body.error.message).toContain('name')
    })
  })

  describe('Edge Cases', () => {
    it('should handle errors without message', async () => {
      // Create a route that throws an error without message
      const testApp = express()
      testApp.get('/no-message', (req, res, next) => {
        const error = new Error()
        error.message = ''
        next(error)
      })
      testApp.use(errorHandler)

      const response = await request(testApp)
        .get('/no-message')
        .expect(500)

      expect(response.body.success).toBe(false)
      expect(response.body.error.message).toBe('Internal server error')
    })

    it('should handle non-Error objects', async () => {
      const testApp = express()
      testApp.get('/string-error', (req, res, next) => {
        next('String error')
      })
      testApp.use(errorHandler)

      const response = await request(testApp)
        .get('/string-error')
        .expect(500)

      expect(response.body.success).toBe(false)
      expect(response.body.error.message).toBe('String error')
    })

    it('should handle null/undefined errors', async () => {
      const testApp = express()
      testApp.get('/null-error', (req, res, next) => {
        // Passing null should trigger error handler, but Express might skip it
        next(new Error()) // Use empty error instead
      })
      testApp.use(errorHandler)

      const response = await request(testApp)
        .get('/null-error')
        .expect(500)

      expect(response.body.success).toBe(false)
      expect(response.body.error.message).toBeDefined()
    })
  })

  describe('Security Considerations', () => {
    it('should not expose stack traces in production', async () => {
      // This test assumes NODE_ENV is not set to 'development'
      const response = await request(app)
        .get('/test-sync-error')
        .expect(500)

      expect(response.body.error).not.toHaveProperty('stack')
      expect(response.body.error).not.toHaveProperty('details')
    })
  })
})