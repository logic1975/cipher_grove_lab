// Test environment setup and configuration
import { cleanupTestDatabase, disconnectDatabase } from './config/database'

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.PORT = '0' // Use random port for tests
process.env.DB_HOST = 'localhost'
process.env.DB_PORT = '5432'
process.env.DB_NAME = 'cipher_grove_lab_test'
process.env.DB_USER = 'test_user'
process.env.DB_PASSWORD = 'test_password'

// Global setup for all tests
beforeAll(async () => {
  // Initial cleanup to ensure clean state
  await cleanupTestDatabase()
})

// Cleanup after all tests
afterAll(async () => {
  await cleanupTestDatabase()
  await disconnectDatabase()
})