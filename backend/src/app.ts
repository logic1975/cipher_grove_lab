import express from 'express'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const app = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Basic route for testing
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Cipher Grove Lab API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
})

export default app