import request from 'supertest'
import app from '../../app'
import { cleanupTestDatabase } from '../../config/database'
import { ArtistService } from '../../services/artistService'
import { ReleaseService } from '../../services/releaseService'

import { ImageProcessingService } from '../../services/imageProcessingService'

// Mock image processing service
jest.mock('../../services/imageProcessingService')

describe('Image Upload API Endpoints', () => {
  beforeEach(async () => {
    await cleanupTestDatabase()
    
    // Set up mocks with implementation that uses actual parameters
    ;(ImageProcessingService.processArtistImage as jest.Mock).mockImplementation(
      async (file, artistId, altText) => ({
        imageUrl: `/uploads/artists/${artistId}_profile.webp`,
        imageAlt: altText,
        imageSizes: {
          thumbnail: `/uploads/artists/${artistId}_thumbnail.webp`,
          profile: `/uploads/artists/${artistId}_profile.webp`,
          featured: `/uploads/artists/${artistId}_featured.webp`
        }
      })
    )
    
    ;(ImageProcessingService.processReleaseCoverArt as jest.Mock).mockImplementation(
      async (file, releaseId, altText) => ({
        coverArtUrl: `/uploads/releases/${releaseId}_medium.webp`,
        coverArtAlt: altText,
        coverArtSizes: {
          small: `/uploads/releases/${releaseId}_small.webp`,
          medium: `/uploads/releases/${releaseId}_medium.webp`,
          large: `/uploads/releases/${releaseId}_large.webp`
        }
      })
    )
  })

  describe('POST /api/artists/:id/image', () => {
    it('should upload artist image successfully', async () => {
      // Create test artist
      const artist = await ArtistService.createArtist({
        name: 'Test Artist',
        bio: 'Test bio'
      })

      // Create a test image buffer
      const imageBuffer = Buffer.from('fake-image-data')

      const response = await request(app)
        .post(`/api/artists/${artist.id}/image`)
        .attach('image', imageBuffer, {
          filename: 'test-image.jpg',
          contentType: 'image/jpeg'
        })
        .field('altText', 'Custom alt text')
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        message: 'Artist image uploaded successfully',
        data: expect.objectContaining({
          id: artist.id,
          name: 'Test Artist',
          imageUrl: expect.stringContaining(`/uploads/artists/${artist.id}_profile.webp`),
          imageAlt: 'Custom alt text'
        })
      })
    })

    it('should generate default alt text if not provided', async () => {
      const artist = await ArtistService.createArtist({
        name: 'Test Artist',
        bio: 'Test bio'
      })

      const imageBuffer = Buffer.from('fake-image-data')

      const response = await request(app)
        .post(`/api/artists/${artist.id}/image`)
        .attach('image', imageBuffer, {
          filename: 'test-image.jpg',
          contentType: 'image/jpeg'
        })
        .expect(200)

      expect(response.body.data.imageAlt).toBe('Test Artist profile photo')
    })

    it('should return 404 for non-existent artist', async () => {
      const imageBuffer = Buffer.from('fake-image-data')

      const response = await request(app)
        .post('/api/artists/999/image')
        .attach('image', imageBuffer, {
          filename: 'test-image.jpg',
          contentType: 'image/jpeg'
        })
        .expect(404)

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'ARTIST_NOT_FOUND',
          message: 'Artist not found'
        }
      })
    })

    it('should return 400 for invalid artist ID', async () => {
      const imageBuffer = Buffer.from('fake-image-data')

      const response = await request(app)
        .post('/api/artists/invalid/image')
        .attach('image', imageBuffer, {
          filename: 'test-image.jpg',
          contentType: 'image/jpeg'
        })
        .expect(400)

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Artist ID must be a valid number'
        }
      })
    })

    it('should return 400 when no file is uploaded', async () => {
      const artist = await ArtistService.createArtist({
        name: 'Test Artist',
        bio: 'Test bio'
      })

      const response = await request(app)
        .post(`/api/artists/${artist.id}/image`)
        .expect(400)

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'NO_FILE_UPLOADED',
          message: 'No image file was uploaded'
        }
      })
    })

    it('should reject files that are too large', async () => {
      const artist = await ArtistService.createArtist({
        name: 'Test Artist',
        bio: 'Test bio'
      })

      // Create a buffer larger than 5MB
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024, 'a')

      const response = await request(app)
        .post(`/api/artists/${artist.id}/image`)
        .attach('image', largeBuffer, {
          filename: 'large-image.jpg',
          contentType: 'image/jpeg'
        })
        .expect(400)

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'File size exceeds 5MB limit'
        }
      })
    })

    it('should reject invalid file types', async () => {
      const artist = await ArtistService.createArtist({
        name: 'Test Artist',
        bio: 'Test bio'
      })

      const textBuffer = Buffer.from('not-an-image')

      const response = await request(app)
        .post(`/api/artists/${artist.id}/image`)
        .attach('image', textBuffer, 'document.txt')
        .expect(400)

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'INVALID_FILE_TYPE'
        }
      })
    })
  })

  describe('POST /api/releases/:id/cover-art', () => {
    it('should upload release cover art successfully', async () => {
      // Create test artist and release
      const artist = await ArtistService.createArtist({
        name: 'Test Artist',
        bio: 'Test bio'
      })

      const release = await ReleaseService.createRelease({
        artistId: artist.id,
        title: 'Test Album',
        type: 'album',
        releaseDate: new Date('2024-03-15')
      })

      const imageBuffer = Buffer.from('fake-cover-art-data')

      const response = await request(app)
        .post(`/api/releases/${release.id}/cover-art`)
        .attach('image', imageBuffer, {
          filename: 'cover-art.jpg',
          contentType: 'image/jpeg'
        })
        .field('altText', 'Custom cover art alt text')
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        message: 'Release cover art uploaded successfully',
        data: expect.objectContaining({
          id: release.id,
          title: 'Test Album',
          coverArtUrl: expect.stringContaining(`/uploads/releases/${release.id}_medium.webp`),
          coverArtAlt: 'Custom cover art alt text'
        })
      })
    })

    it('should generate default alt text for release cover art', async () => {
      const artist = await ArtistService.createArtist({
        name: 'Test Artist',
        bio: 'Test bio'
      })

      const release = await ReleaseService.createRelease({
        artistId: artist.id,
        title: 'Test Album',
        type: 'album',
        releaseDate: new Date('2024-03-15')
      })

      const imageBuffer = Buffer.from('fake-cover-art-data')

      const response = await request(app)
        .post(`/api/releases/${release.id}/cover-art`)
        .attach('image', imageBuffer, {
          filename: 'cover-art.jpg',
          contentType: 'image/jpeg'
        })
        .expect(200)

      expect(response.body.data.coverArtAlt).toBe('Test Album album cover')
    })

    it('should return 404 for non-existent release', async () => {
      const imageBuffer = Buffer.from('fake-cover-art-data')

      const response = await request(app)
        .post('/api/releases/999/cover-art')
        .attach('image', imageBuffer, {
          filename: 'cover-art.jpg',
          contentType: 'image/jpeg'
        })
        .expect(404)

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'RELEASE_NOT_FOUND',
          message: 'Release not found'
        }
      })
    })

    it('should return 400 for invalid release ID', async () => {
      const imageBuffer = Buffer.from('fake-cover-art-data')

      const response = await request(app)
        .post('/api/releases/invalid/cover-art')
        .attach('image', imageBuffer, {
          filename: 'cover-art.jpg',
          contentType: 'image/jpeg'
        })
        .expect(400)

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Release ID must be a valid number'
        }
      })
    })

    it('should return 400 when no file is uploaded for release', async () => {
      const artist = await ArtistService.createArtist({
        name: 'Test Artist',
        bio: 'Test bio'
      })

      const release = await ReleaseService.createRelease({
        artistId: artist.id,
        title: 'Test Album',
        type: 'album',
        releaseDate: new Date('2024-03-15')
      })

      const response = await request(app)
        .post(`/api/releases/${release.id}/cover-art`)
        .expect(400)

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'NO_FILE_UPLOADED',
          message: 'No cover art file was uploaded'
        }
      })
    })
  })
})