import request from 'supertest'
import express from 'express'
import { validateRequest, createValidationMiddleware } from '../../middleware/validationMiddleware'
import Joi from 'joi'

const app = express()
app.use(express.json())

// Test schemas
const testSchema = {
  body: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    email: Joi.string().email().optional(),
    age: Joi.number().integer().min(0).max(120).optional()
  }),
  params: Joi.object({
    id: Joi.number().integer().positive().required()
  }),
  query: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional()
  })
}

// Separate schemas for different validation types
const bodyOnlySchema = {
  body: testSchema.body,
  params: testSchema.params
}

const queryOnlySchema = {
  params: testSchema.params,
  query: testSchema.query
}

// Test routes
app.post('/test-body/:id', createValidationMiddleware(bodyOnlySchema), (req, res) => {
  res.json({ success: true, data: req.body })
})

app.get('/test-query/:id', createValidationMiddleware(queryOnlySchema), (req, res) => {
  res.json({ success: true, data: req.query })
})

app.post('/test-all/:id', createValidationMiddleware(testSchema), (req, res) => {
  res.json({ success: true, data: { body: req.body, params: req.params, query: req.query } })
})

describe('Validation Middleware', () => {
  describe('Body Validation', () => {
    it('should pass valid body data', async () => {
      const response = await request(app)
        .post('/test-body/123')
        .send({ name: 'Test User', email: 'test@example.com', age: 25 })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.name).toBe('Test User')
    })

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/test-body/123')
        .send({ email: 'test@example.com' })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
      expect(response.body.error.message).toContain('name')
    })

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/test-body/123')
        .send({ name: 'Test User', email: 'invalid-email' })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.message).toContain('email')
    })

    it('should reject age out of range', async () => {
      const response = await request(app)
        .post('/test-body/123')
        .send({ name: 'Test User', age: 150 })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.message).toContain('age')
    })

    it('should reject name too long', async () => {
      const response = await request(app)
        .post('/test-body/123')
        .send({ name: 'A'.repeat(101) })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.message).toContain('name')
    })
  })

  describe('Params Validation', () => {
    it('should pass valid numeric ID', async () => {
      const response = await request(app)
        .post('/test-body/123')
        .send({ name: 'Test User' })
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should reject non-numeric ID', async () => {
      const response = await request(app)
        .post('/test-body/abc')
        .send({ name: 'Test User' })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.message).toContain('id')
    })

    it('should reject negative ID', async () => {
      const response = await request(app)
        .post('/test-body/-1')
        .send({ name: 'Test User' })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.message).toContain('id')
    })

    it('should reject zero ID', async () => {
      const response = await request(app)
        .post('/test-body/0')
        .send({ name: 'Test User' })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.message).toContain('id')
    })
  })

  describe('Query Validation', () => {
    it('should pass valid query parameters', async () => {
      const response = await request(app)
        .get('/test-query/123?page=2&limit=10')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.page).toBe('2')
      expect(response.body.data.limit).toBe('10')
    })

    it('should pass without optional query parameters', async () => {
      const response = await request(app)
        .get('/test-query/123')
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should reject invalid page number', async () => {
      const response = await request(app)
        .get('/test-query/123?page=0')
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.message).toContain('page')
    })

    it('should reject limit too high', async () => {
      const response = await request(app)
        .get('/test-query/123?limit=101')
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.message).toContain('limit')
    })

    it('should reject non-numeric query values', async () => {
      const response = await request(app)
        .get('/test-query/123?page=abc')
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.message).toContain('page')
    })
  })

  describe('Combined Validation', () => {
    it('should validate all parts successfully', async () => {
      const response = await request(app)
        .post('/test-all/123?page=1&limit=20')
        .send({ name: 'Test User', email: 'test@example.com' })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.body.name).toBe('Test User')
    })

    it('should fail if any part is invalid', async () => {
      const response = await request(app)
        .post('/test-all/abc?page=1&limit=20')
        .send({ name: 'Test User' })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.message).toContain('id')
    })
  })

  describe('Error Response Format', () => {
    it('should return consistent error format', async () => {
      const response = await request(app)
        .post('/test-body/123')
        .send({})
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR')
      expect(response.body.error).toHaveProperty('message')
      expect(response.body).toHaveProperty('timestamp')
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date)
    })

    it('should include field details in validation errors', async () => {
      const response = await request(app)
        .post('/test-body/123')
        .send({ name: '', email: 'invalid' })
        .expect(400)

      expect(response.body.error.message).toContain('name')
      expect(response.body.error.message).toContain('email')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty request body gracefully', async () => {
      const response = await request(app)
        .post('/test-body/123')
        .send({}) // Send empty object
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should handle malformed JSON gracefully', async () => {
      // Note: Express's built-in JSON parser will handle malformed JSON
      // before it reaches our validation middleware
      const response = await request(app)
        .post('/test-body/123')
        .type('json')
        .send('{ "invalid": json }') // Invalid JSON syntax
        .expect(400)

      // The error should come from JSON parsing, not our validator
      expect(response.body).toBeDefined()
    })

    it('should handle very large valid requests', async () => {
      const response = await request(app)
        .post('/test-body/123')
        .send({ 
          name: 'A'.repeat(100), // Max allowed length
          email: 'test@example.com'
        })
        .expect(200)

      expect(response.body.success).toBe(true)
    })
  })
})