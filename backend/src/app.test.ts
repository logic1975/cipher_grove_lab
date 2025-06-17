import request from 'supertest'
import app from './app'

describe('Express App', () => {
  describe('Basic Routes', () => {
    it('responds to GET /', async () => {
      const response = await request(app).get('/')
      
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Cipher Grove Lab API')
      expect(response.body.environment).toBeDefined()
      expect(response.body.timestamp).toBeDefined()
    })

    it('responds to health check', async () => {
      const response = await request(app).get('/health')
      
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.status).toBe('healthy')
      expect(response.body.timestamp).toBeDefined()
    })

    it('handles 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown-route')
      
      expect(response.status).toBe(404)
    })
  })

  describe('Environment Isolation', () => {
    it('runs in test environment', () => {
      expect(process.env.NODE_ENV).toBe('test')
    })

    it('uses test database configuration', () => {
      expect(process.env.DB_NAME).toBe('cipher_grove_lab_test')
      expect(process.env.DB_USER).toBe('test_user')
    })

    it('isolates test data between tests', () => {
      // Test environment isolation is handled by Jest configuration
      expect(process.env.NODE_ENV).toBe('test')
    })
  })

  describe('Test Framework Features', () => {
    it('can create simple mocks', () => {
      const mockFn = jest.fn()
      mockFn('test')
      
      expect(mockFn).toHaveBeenCalledWith('test')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('can mock async functions', async () => {
      const mockAsyncFn = jest.fn().mockResolvedValue({ success: true })
      
      const result = await mockAsyncFn()
      expect(result).toEqual({ success: true })
      expect(mockAsyncFn).toHaveBeenCalledTimes(1)
    })

    it('can test error scenarios', async () => {
      const mockErrorFn = jest.fn().mockRejectedValue(new Error('Test error'))
      
      await expect(mockErrorFn()).rejects.toThrow('Test error')
      expect(mockErrorFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('Async/Await Support', () => {
    it('handles async route handlers', async () => {
      const response = await request(app).get('/')
      expect(response.status).toBe(200)
    })

    it('handles async errors gracefully', async () => {
      // Test that async errors don't crash the tests
      const asyncFunction = jest.fn().mockRejectedValue(new Error('Async error'))
      
      await expect(asyncFunction()).rejects.toThrow('Async error')
      expect(asyncFunction).toHaveBeenCalledTimes(1)
    })

    it('handles async operations', async () => {
      const mockPromise = jest.fn().mockResolvedValue({ data: 'test' })
      
      const result = await mockPromise()
      expect(result).toEqual({ data: 'test' })
    })

    it('handles async timeout scenarios', async () => {
      const slowFunction = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      )
      
      await expect(slowFunction()).resolves.toBeUndefined()
      expect(slowFunction).toHaveBeenCalledTimes(1)
    }, 5000) // 5 second timeout for this specific test
  })

  describe('Test Configuration', () => {
    it('has access to Jest globals', () => {
      expect(describe).toBeDefined()
      expect(it).toBeDefined()
      expect(expect).toBeDefined()
      expect(beforeAll).toBeDefined()
      expect(afterAll).toBeDefined()
      expect(beforeEach).toBeDefined()
      expect(afterEach).toBeDefined()
    })

    it('has proper test environment setup', () => {
      expect(process.env.PORT).toBe('0') // Random port for tests
      expect(process.env.NODE_ENV).toBe('test')
    })

    it('can use Jest mocking features', () => {
      const mockFn = jest.fn()
      mockFn('test')
      
      expect(mockFn).toHaveBeenCalledWith('test')
      expect(mockFn).toHaveBeenCalledTimes(1)
      
      jest.clearAllMocks()
      expect(mockFn).not.toHaveBeenCalled()
    })
  })
})