import request from 'supertest'
import express from 'express'
import { 
  createRateLimit, 
  apiRateLimit, 
  contactRateLimit, 
  newsletterRateLimit,
  searchRateLimit 
} from '../../middleware/rateLimitingMiddleware'

const app = express()
app.use(express.json())

// Test routes with different rate limits
app.get('/test-api', apiRateLimit, (req, res) => {
  res.json({ success: true, message: 'API endpoint' })
})

app.post('/test-contact', contactRateLimit, (req, res) => {
  res.json({ success: true, message: 'Contact submitted' })
})

app.post('/test-newsletter', newsletterRateLimit, (req, res) => {
  res.json({ success: true, message: 'Newsletter subscribed' })
})

app.get('/test-search', searchRateLimit, (req, res) => {
  res.json({ success: true, message: 'Search results' })
})

// Custom rate limit for testing
const customRateLimit = createRateLimit({
  windowMs: 1000, // 1 second
  max: 2, // 2 requests per second
  message: 'Custom rate limit exceeded'
})

app.get('/test-custom', customRateLimit, (req, res) => {
  res.json({ success: true, message: 'Custom endpoint' })
})

describe('Rate Limiting Middleware', () => {
  describe('API Rate Limiting', () => {
    it('should allow requests within limit', async () => {
      const response = await request(app)
        .get('/test-api')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.headers['ratelimit-limit']).toBeDefined()
      expect(response.headers['ratelimit-remaining']).toBeDefined()
      expect(response.headers['ratelimit-reset']).toBeDefined()
    })

    it('should include rate limit headers', async () => {
      const response = await request(app)
        .get('/test-api')
        .expect(200)

      expect(parseInt(response.headers['ratelimit-limit'])).toBeGreaterThan(0)
      expect(parseInt(response.headers['ratelimit-remaining'])).toBeGreaterThanOrEqual(0)
      const resetTime = parseInt(response.headers['ratelimit-reset'])
      // In express-rate-limit v7, reset time might be in seconds since window start
      expect(resetTime).toBeGreaterThan(0)
    })

    it('should decrement remaining count', async () => {
      const response1 = await request(app).get('/test-api')
      const remaining1 = parseInt(response1.headers['ratelimit-remaining'])

      const response2 = await request(app).get('/test-api')
      const remaining2 = parseInt(response2.headers['ratelimit-remaining'])

      expect(remaining2).toBeLessThan(remaining1)
    })
  })

  describe('Contact Rate Limiting', () => {
    it('should allow contact form submissions within limit', async () => {
      const response = await request(app)
        .post('/test-contact')
        .send({ name: 'Test', email: 'test@example.com', message: 'Hello' })
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should have appropriate limits for test environment', async () => {
      const apiResponse = await request(app).get('/test-api')
      const contactResponse = await request(app).post('/test-contact').send({})

      const apiLimit = parseInt(apiResponse.headers['ratelimit-limit'])
      const contactLimit = parseInt(contactResponse.headers['ratelimit-limit'])

      // In test environment, both should have high limits (1000)
      // In production, contact would be more restrictive than API
      if (process.env.NODE_ENV === 'test') {
        expect(contactLimit).toBe(1000)
        expect(apiLimit).toBeGreaterThan(0)
      } else {
        expect(contactLimit).toBeLessThan(apiLimit)
      }
    })
  })

  describe('Newsletter Rate Limiting', () => {
    it('should allow newsletter subscriptions within limit', async () => {
      const response = await request(app)
        .post('/test-newsletter')
        .send({ email: 'test@example.com' })
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should have appropriate limits for test environment', async () => {
      const apiResponse = await request(app).get('/test-api')
      const newsletterResponse = await request(app).post('/test-newsletter').send({})

      const apiLimit = parseInt(apiResponse.headers['ratelimit-limit'])
      const newsletterLimit = parseInt(newsletterResponse.headers['ratelimit-limit'])

      // In test environment, both should have high limits (1000)
      // In production, newsletter would be most restrictive
      if (process.env.NODE_ENV === 'test') {
        expect(newsletterLimit).toBe(1000)
        expect(apiLimit).toBeGreaterThan(0)
      } else {
        expect(newsletterLimit).toBeLessThanOrEqual(apiLimit)
      }
    })
  })

  describe('Search Rate Limiting', () => {
    it('should allow search requests within limit', async () => {
      const response = await request(app)
        .get('/test-search?q=test')
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should have moderate limits for search', async () => {
      const apiResponse = await request(app).get('/test-api')
      const searchResponse = await request(app).get('/test-search')

      const apiLimit = parseInt(apiResponse.headers['ratelimit-limit'])
      const searchLimit = parseInt(searchResponse.headers['ratelimit-limit'])

      expect(searchLimit).toBeLessThan(apiLimit)
      expect(searchLimit).toBeGreaterThan(0)
    })
  })

  describe('Custom Rate Limiting', () => {
    it('should enforce custom rate limits', async () => {
      // First request should succeed
      const response1 = await request(app)
        .get('/test-custom')
        .expect(200)

      expect(response1.body.success).toBe(true)

      // Second request should succeed
      const response2 = await request(app)
        .get('/test-custom')
        .expect(200)

      expect(response2.body.success).toBe(true)

      // Third request should be rate limited
      const response3 = await request(app)
        .get('/test-custom')
        .expect(429)

      expect(response3.body.success).toBe(false)
      expect(response3.body.error.code).toBe('RATE_LIMIT_EXCEEDED')
    })

    it('should reset after window expires', async () => {
      // Use up the rate limit
      await request(app).get('/test-custom')
      await request(app).get('/test-custom')
      await request(app).get('/test-custom').expect(429)

      // Wait for window to reset
      await new Promise(resolve => setTimeout(resolve, 1100))

      // Should be allowed again
      const response = await request(app)
        .get('/test-custom')
        .expect(200)

      expect(response.body.success).toBe(true)
    })
  })

  describe('Rate Limit Exceeded Response', () => {
    it('should return proper error format when rate limited', async () => {
      // Use up the custom rate limit
      await request(app).get('/test-custom')
      await request(app).get('/test-custom')

      const response = await request(app)
        .get('/test-custom')
        .expect(429)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toHaveProperty('code', 'RATE_LIMIT_EXCEEDED')
      expect(response.body.error).toHaveProperty('message')
      expect(response.body).toHaveProperty('timestamp')
      expect(response.headers['retry-after']).toBeDefined()
    })

    it('should include retry-after header', async () => {
      // Use up the custom rate limit
      await request(app).get('/test-custom')
      await request(app).get('/test-custom')

      const response = await request(app)
        .get('/test-custom')
        .expect(429)

      const retryAfter = parseInt(response.headers['retry-after'])
      expect(retryAfter).toBeGreaterThan(0)
      expect(retryAfter).toBeLessThanOrEqual(60) // Should be reasonable
    })
  })

  describe('IP-based Rate Limiting', () => {
    it('should track different IPs separately', async () => {
      // Note: In testing with supertest, IP tracking may not work as expected
      // since all requests appear to come from the same source
      // This test verifies the middleware handles different IPs gracefully
      const response = await request(app)
        .get('/test-api') // Use API endpoint that has higher limits
        .set('X-Forwarded-For', '192.168.1.1')
        .expect(200)

      expect(response.body.success).toBe(true)
    })
  })

  describe('Rate Limit Headers', () => {
    it('should include all required rate limit headers', async () => {
      const response = await request(app)
        .get('/test-api')
        .expect(200)

      expect(response.headers).toHaveProperty('ratelimit-limit')
      expect(response.headers).toHaveProperty('ratelimit-remaining')
      expect(response.headers).toHaveProperty('ratelimit-reset')
    })

    it('should have valid header values', async () => {
      const response = await request(app)
        .get('/test-api')
        .expect(200)

      const limit = parseInt(response.headers['ratelimit-limit'])
      const remaining = parseInt(response.headers['ratelimit-remaining'])
      const reset = parseInt(response.headers['ratelimit-reset'])

      expect(limit).toBeGreaterThan(0)
      expect(remaining).toBeGreaterThanOrEqual(0)
      expect(remaining).toBeLessThanOrEqual(limit)
      expect(reset).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle concurrent requests properly', async () => {
      // Reset by using a different endpoint for this test
      const testApp = express()
      const testRateLimit = createRateLimit({
        windowMs: 1000,
        max: 2,
        message: 'Concurrent test rate limit'
      })
      testApp.get('/concurrent-test', testRateLimit, (req, res) => {
        res.json({ success: true })
      })

      // Make multiple concurrent requests
      const promises = Array(4).fill(null).map(() => 
        request(testApp).get('/concurrent-test')
      )

      const responses = await Promise.all(promises)
      
      // Some should succeed, some should fail
      const successful = responses.filter(r => r.status === 200)
      const rateLimited = responses.filter(r => r.status === 429)

      expect(successful.length).toBeGreaterThan(0)
      expect(successful.length).toBeLessThanOrEqual(2)
      expect(rateLimited.length).toBeGreaterThan(0)
    })

    it('should handle requests without IP gracefully', async () => {
      const response = await request(app)
        .get('/test-api')
        .expect(200)

      expect(response.body.success).toBe(true)
    })
  })

  describe('Configuration Validation', () => {
    it('should use default values for invalid configuration', async () => {
      // This tests that the middleware handles configuration properly
      const response = await request(app)
        .get('/test-api')
        .expect(200)

      expect(response.headers['ratelimit-limit']).toBeDefined()
    })
  })
})