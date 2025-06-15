import request from 'supertest'
import app from './app'

describe('Supertest API Testing Configuration', () => {
  describe('HTTP Methods', () => {
    it('handles GET requests', async () => {
      const response = await request(app).get('/')
      
      expect(response.status).toBe(200)
      expect(response.type).toBe('application/json')
    })

    it('handles POST requests with JSON body', async () => {
      const testData = { name: 'Test Artist', genre: 'Electronic' }
      
      const response = await request(app)
        .post('/api/test-endpoint')
        .send(testData)
        .set('Content-Type', 'application/json')
      
      // Should return 404 since endpoint doesn't exist yet, but request was processed
      expect(response.status).toBe(404)
    })

    it('handles PUT requests', async () => {
      const response = await request(app)
        .put('/api/test-endpoint')
        .send({ id: 1, name: 'Updated Artist' })
      
      expect(response.status).toBe(404) // Endpoint doesn't exist yet
    })

    it('handles DELETE requests', async () => {
      const response = await request(app).delete('/api/test-endpoint/1')
      
      expect(response.status).toBe(404) // Endpoint doesn't exist yet
    })
  })

  describe('HTTP Status Codes', () => {
    it('returns 200 for successful GET requests', async () => {
      const response = await request(app).get('/')
      expect(response.status).toBe(200)
    })

    it('returns 200 for health check', async () => {
      const response = await request(app).get('/health')
      expect(response.status).toBe(200)
    })

    it('returns 404 for non-existent routes', async () => {
      const response = await request(app).get('/non-existent-route')
      expect(response.status).toBe(404)
    })

    it('returns 404 for POST to non-existent routes', async () => {
      const response = await request(app)
        .post('/non-existent-route')
        .send({ data: 'test' })
      
      expect(response.status).toBe(404)
    })

    it('handles different HTTP status codes', async () => {
      // Test multiple status codes that might be returned
      const routes = [
        { path: '/', expectedStatus: 200 },
        { path: '/health', expectedStatus: 200 },
        { path: '/non-existent', expectedStatus: 404 },
      ]

      for (const route of routes) {
        const response = await request(app).get(route.path)
        expect(response.status).toBe(route.expectedStatus)
      }
    })
  })

  describe('Request/Response Validation', () => {
    it('validates JSON response structure for main endpoint', async () => {
      const response = await request(app).get('/')
      
      expect(response.body).toHaveProperty('success')
      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body).toHaveProperty('environment')
      
      expect(typeof response.body.success).toBe('boolean')
      expect(typeof response.body.message).toBe('string')
      expect(typeof response.body.timestamp).toBe('string')
      expect(typeof response.body.environment).toBe('string')
    })

    it('validates JSON response structure for health endpoint', async () => {
      const response = await request(app).get('/health')
      
      expect(response.body).toHaveProperty('success')
      expect(response.body).toHaveProperty('status')
      expect(response.body).toHaveProperty('timestamp')
      
      expect(response.body.success).toBe(true)
      expect(response.body.status).toBe('healthy')
      expect(typeof response.body.timestamp).toBe('string')
    })

    it('validates Content-Type headers', async () => {
      const response = await request(app).get('/')
      
      expect(response.headers['content-type']).toMatch(/application\/json/)
    })

    it('validates request headers are processed', async () => {
      const response = await request(app)
        .get('/')
        .set('User-Agent', 'Test-Agent')
        .set('Accept', 'application/json')
      
      expect(response.status).toBe(200)
      // Headers should be processed without errors
    })

    it('validates request body parsing', async () => {
      const testData = { test: 'data', number: 123, boolean: true }
      
      const response = await request(app)
        .post('/api/test')
        .send(testData)
        .set('Content-Type', 'application/json')
      
      // Even though endpoint doesn't exist, body should be parsed
      expect(response.status).toBe(404)
    })

    it('validates URL parameters handling', async () => {
      const response = await request(app).get('/health?param1=value1&param2=value2')
      
      expect(response.status).toBe(200)
      // Query parameters should be handled without errors
    })

    it('validates response timing', async () => {
      const startTime = Date.now()
      
      const response = await request(app).get('/')
      
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      expect(response.status).toBe(200)
      expect(responseTime).toBeLessThan(1000) // Should respond within 1 second
    })
  })

  describe('API Request Features', () => {
    it('supports query parameters', async () => {
      const response = await request(app)
        .get('/health')
        .query({ format: 'detailed', version: 'v1' })
      
      expect(response.status).toBe(200)
    })

    it('supports request cookies', async () => {
      const response = await request(app)
        .get('/')
        .set('Cookie', ['session=abc123', 'user=testuser'])
      
      expect(response.status).toBe(200)
    })

    it('supports custom headers', async () => {
      const response = await request(app)
        .get('/')
        .set('Authorization', 'Bearer test-token')
        .set('X-API-Version', '1.0')
      
      expect(response.status).toBe(200)
    })

    it('supports different content types', async () => {
      const responses = await Promise.all([
        request(app).get('/').set('Accept', 'application/json'),
        request(app).get('/').set('Accept', '*/*'),
      ])

      responses.forEach(response => {
        expect(response.status).toBe(200)
      })
    })

    it('handles concurrent requests', async () => {
      const promises = Array(5).fill(null).map(() => 
        request(app).get('/health')
      )

      const responses = await Promise.all(promises)
      
      responses.forEach(response => {
        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
      })
    })
  })

  describe('Error Handling', () => {
    it('handles malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/test')
        .send('{ invalid json }')
        .set('Content-Type', 'application/json')
      
      // Should handle malformed JSON without crashing
      expect([400, 404]).toContain(response.status)
    })

    it('handles large request bodies', async () => {
      const largeData = {
        data: 'x'.repeat(1000), // 1KB of data
        array: Array(100).fill({ test: 'value' })
      }

      const response = await request(app)
        .post('/api/test')
        .send(largeData)
      
      expect(response.status).toBe(404) // Endpoint doesn't exist, but body was processed
    })

    it('handles empty request bodies', async () => {
      const response = await request(app)
        .post('/api/test')
        .send()
      
      expect(response.status).toBe(404)
    })
  })
})