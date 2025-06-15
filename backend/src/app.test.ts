import request from 'supertest'
import app from './app'
import { mockDatabase } from './test-setup'

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
      // Verify mocks are cleared between tests
      expect(mockDatabase.query).not.toHaveBeenCalled()
    })
  })

  describe('Database Mocking', () => {
    it('can mock database connections', async () => {
      mockDatabase.connect.mockResolvedValue(true)
      
      const result = await mockDatabase.connect()
      expect(result).toBe(true)
      expect(mockDatabase.connect).toHaveBeenCalledTimes(1)
    })

    it('can mock database queries', async () => {
      const mockResult = { id: 1, name: 'Test Artist' }
      mockDatabase.query.mockResolvedValue([mockResult])
      
      const result = await mockDatabase.query('SELECT * FROM artists WHERE id = $1', [1])
      expect(result).toEqual([mockResult])
      expect(mockDatabase.query).toHaveBeenCalledWith('SELECT * FROM artists WHERE id = $1', [1])
    })

    it('can mock database transactions', async () => {
      const mockTransaction = jest.fn().mockResolvedValue({ commit: jest.fn(), rollback: jest.fn() })
      mockDatabase.transaction.mockResolvedValue(mockTransaction)
      
      const transaction = await mockDatabase.transaction()
      expect(transaction).toBeDefined()
      expect(mockDatabase.transaction).toHaveBeenCalledTimes(1)
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

    it('handles async database operations', async () => {
      mockDatabase.query.mockResolvedValue([{ count: 5 }])
      
      const result = await mockDatabase.query('SELECT COUNT(*) as count FROM artists')
      expect(result).toEqual([{ count: 5 }])
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