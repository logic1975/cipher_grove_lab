import request from 'supertest'
import app from '../app'
import fs from 'fs'
import path from 'path'

describe('File Serving', () => {
  const testImagePath = path.join(__dirname, '../../uploads/artists/test-image.jpg')
  
  beforeAll(() => {
    // Create a simple test image file (1x1 pixel JPEG)
    const testImageBuffer = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
      0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
      0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
      0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C,
      0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D,
      0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20,
      0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
      0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27,
      0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34,
      0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11,
      0x01, 0x03, 0x11, 0x01, 0xFF, 0xC4, 0x00, 0x14,
      0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x08, 0xFF, 0xC4, 0x00, 0x14, 0x10, 0x01,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0xFF, 0xDA, 0x00, 0x0C, 0x03, 0x01, 0x00, 0x02,
      0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0xB2, 0xFF, 0xD9
    ])
    
    // Ensure directory exists
    const dir = path.dirname(testImagePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    fs.writeFileSync(testImagePath, testImageBuffer)
  })

  afterAll(() => {
    // Clean up test file
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath)
    }
  })

  describe('Static file serving', () => {
    it('should serve uploaded files from /uploads route', async () => {
      const response = await request(app)
        .get('/uploads/artists/test-image.jpg')
        .expect(200)

      expect(response.headers['content-type']).toBe('image/jpeg')
      expect(response.headers['cache-control']).toBe('public, max-age=86400')
      expect(response.headers['x-content-type-options']).toBe('nosniff')
      expect(response.headers['x-frame-options']).toBe('DENY')
    })

    it('should return 404 for non-existent files', async () => {
      await request(app)
        .get('/uploads/artists/non-existent.jpg')
        .expect(404)
    })

    it('should handle different image extensions', async () => {
      // Test WebP extension handling
      const webpPath = path.join(__dirname, '../../uploads/releases/test.webp')
      const dir = path.dirname(webpPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      
      // Create minimal WebP file
      const webpBuffer = Buffer.from([
        0x52, 0x49, 0x46, 0x46, 0x1A, 0x00, 0x00, 0x00,
        0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x20,
        0x0E, 0x00, 0x00, 0x00, 0x90, 0x01, 0x00, 0x9D,
        0x01, 0x2A, 0x01, 0x00, 0x01, 0x00, 0x02, 0x00
      ])
      fs.writeFileSync(webpPath, webpBuffer)

      const response = await request(app)
        .get('/uploads/releases/test.webp')
        .expect(200)

      expect(response.headers['content-type']).toBe('image/webp')

      // Clean up
      fs.unlinkSync(webpPath)
    })

    it('should include etag header for caching', async () => {
      const response = await request(app)
        .get('/uploads/artists/test-image.jpg')
        .expect(200)

      expect(response.headers.etag).toBeDefined()
      expect(response.headers['last-modified']).toBeDefined()
    })
  })

  describe('Directory permissions', () => {
    it('should not allow directory traversal', async () => {
      await request(app)
        .get('/uploads/../package.json')
        .expect(404)
    })

    it('should not allow access outside uploads directory', async () => {
      await request(app)
        .get('/uploads/../../package.json')
        .expect(404)
    })
  })

  describe('MIME type handling', () => {
    const testCases = [
      { ext: '.jpg', expected: 'image/jpeg' },
      { ext: '.jpeg', expected: 'image/jpeg' },
      { ext: '.png', expected: 'image/png' },
      { ext: '.webp', expected: 'image/webp' }
    ]

    testCases.forEach(({ ext, expected }) => {
      it(`should set correct MIME type for ${ext} files`, async () => {
        const testPath = path.join(__dirname, `../../uploads/artists/test${ext}`)
        
        // Create minimal file
        fs.writeFileSync(testPath, Buffer.from([0x00, 0x01, 0x02, 0x03]))

        const response = await request(app)
          .get(`/uploads/artists/test${ext}`)
          .expect(200)

        expect(response.headers['content-type']).toBe(expected)

        // Clean up
        fs.unlinkSync(testPath)
      })
    })
  })
})