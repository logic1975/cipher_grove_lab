import express from 'express'
import dotenv from 'dotenv'
import path from 'path'

// Import API routes
import artistRoutes from './routes/artists'
import releaseRoutes from './routes/releases'
import newsRoutes from './routes/news'
import contactRoutes from './routes/contact'
import newsletterRoutes from './routes/newsletter'
import concertRoutes from './routes/concerts'

// Load environment variables
dotenv.config()

const app = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static file serving for uploads with proper headers
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1d', // Cache for 1 day
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath, stat) => {
    // Set proper MIME types and cache headers
    res.set({
      'Cache-Control': 'public, max-age=86400', // 1 day
      'X-Content-Type-Options': 'nosniff', // Security header
      'X-Frame-Options': 'DENY' // Prevent embedding in frames
    })
    
    // Set specific headers for image files
    const ext = path.extname(filePath).toLowerCase()
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      res.set('Content-Type', `image/${ext === '.jpg' ? 'jpeg' : ext.slice(1)}`)
    }
  }
}))

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

// API routes
app.use('/api/artists', artistRoutes)
app.use('/api/releases', releaseRoutes)
app.use('/api/news', newsRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/newsletter', newsletterRoutes)
app.use('/api/concerts', concertRoutes)

export default app