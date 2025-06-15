// Test environment setup and configuration

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.PORT = '0' // Use random port for tests
process.env.DB_HOST = 'localhost'
process.env.DB_PORT = '5432'
process.env.DB_NAME = 'cipher_grove_lab_test'
process.env.DB_USER = 'test_user'
process.env.DB_PASSWORD = 'test_password'

// Database connection mock (to be updated when we add database)
export const mockDatabase = {
  connect: jest.fn().mockResolvedValue(true),
  disconnect: jest.fn().mockResolvedValue(true),
  query: jest.fn(),
  transaction: jest.fn(),
}