import request from 'supertest'
import app from '../../app'
import { cleanupTestDatabase, testDatabaseConnection } from '../../config/database'

describe('Releases API', () => {
  beforeAll(async () => {
    await testDatabaseConnection()
  })

  beforeEach(async () => {
    await cleanupTestDatabase()
  })

  describe('GET /api/releases', () => {
    it('should return empty array when no releases exist', async () => {
      const response = await request(app)
        .get('/api/releases')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual([])
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      })
      expect(response.body.timestamp).toBeDefined()
    })

    it('should return paginated releases with artist data', async () => {
      // Create test artist first
      const artistResponse = await request(app)
        .post('/api/artists')
        .send({ name: 'Test Artist', bio: 'A test artist' })
        .expect(201)

      const artistId = artistResponse.body.data.id

      // Create test releases
      await request(app)
        .post('/api/releases')
        .send({
          artistId,
          title: 'First Album',
          type: 'album',
          releaseDate: '2024-03-15'
        })
        .expect(201)

      await request(app)
        .post('/api/releases')
        .send({
          artistId,
          title: 'Second Album',
          type: 'single',
          releaseDate: '2024-04-15'
        })
        .expect(201)

      const response = await request(app)
        .get('/api/releases?page=1&limit=1')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0]).toHaveProperty('artist')
      expect(response.body.data[0].artist.name).toBe('Test Artist')
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 1,
        total: 2,
        totalPages: 2,
        hasNext: true,
        hasPrev: false
      })
    })

    it('should filter releases by artist ID', async () => {
      // Create two artists
      const artist1Response = await request(app)
        .post('/api/artists')
        .send({ name: 'Artist 1' })
        .expect(201)

      const artist2Response = await request(app)
        .post('/api/artists')
        .send({ name: 'Artist 2' })
        .expect(201)

      const artist1Id = artist1Response.body.data.id
      const artist2Id = artist2Response.body.data.id

      // Create releases for both artists
      await request(app)
        .post('/api/releases')
        .send({
          artistId: artist1Id,
          title: 'Artist 1 Album',
          type: 'album',
          releaseDate: '2024-03-15'
        })
        .expect(201)

      await request(app)
        .post('/api/releases')
        .send({
          artistId: artist2Id,
          title: 'Artist 2 Album',
          type: 'album',
          releaseDate: '2024-04-15'
        })
        .expect(201)

      const response = await request(app)
        .get(`/api/releases?artistId=${artist1Id}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].title).toBe('Artist 1 Album')
      expect(response.body.data[0].artist.id).toBe(artist1Id)
    })

    it('should filter releases by type', async () => {
      // Create test artist
      const artistResponse = await request(app)
        .post('/api/artists')
        .send({ name: 'Test Artist' })
        .expect(201)

      const artistId = artistResponse.body.data.id

      // Create releases of different types
      await request(app)
        .post('/api/releases')
        .send({
          artistId,
          title: 'Test Album',
          type: 'album',
          releaseDate: '2024-03-15'
        })
        .expect(201)

      await request(app)
        .post('/api/releases')
        .send({
          artistId,
          title: 'Test Single',
          type: 'single',
          releaseDate: '2024-04-15'
        })
        .expect(201)

      const response = await request(app)
        .get('/api/releases?type=single')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].title).toBe('Test Single')
      expect(response.body.data[0].type).toBe('single')
    })

    it('should sort releases by date', async () => {
      // Create test artist
      const artistResponse = await request(app)
        .post('/api/artists')
        .send({ name: 'Test Artist' })
        .expect(201)

      const artistId = artistResponse.body.data.id

      // Create releases with different dates
      await request(app)
        .post('/api/releases')
        .send({
          artistId,
          title: 'Older Release',
          type: 'album',
          releaseDate: '2024-01-15'
        })
        .expect(201)

      await request(app)
        .post('/api/releases')
        .send({
          artistId,
          title: 'Newer Release',
          type: 'album',
          releaseDate: '2024-06-15'
        })
        .expect(201)

      const response = await request(app)
        .get('/api/releases?sort=newest')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(2)
      expect(response.body.data[0].title).toBe('Newer Release')
      expect(response.body.data[1].title).toBe('Older Release')
    })
  })

  describe('GET /api/releases/latest', () => {
    it('should return latest releases with default limit', async () => {
      // Create test artist
      const artistResponse = await request(app)
        .post('/api/artists')
        .send({ name: 'Test Artist' })
        .expect(201)

      const artistId = artistResponse.body.data.id

      // Create multiple releases
      for (let i = 1; i <= 7; i++) {
        await request(app)
          .post('/api/releases')
          .send({
            artistId,
            title: `Release ${i}`,
            type: 'single',
            releaseDate: `2024-0${i < 10 ? '0' + i : i}-15`
          })
          .expect(201)
      }

      const response = await request(app)
        .get('/api/releases/latest')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(5) // Default limit
      expect(response.body.data[0].title).toBe('Release 7') // Latest first
    })

    it('should respect custom limit parameter', async () => {
      // Create test artist
      const artistResponse = await request(app)
        .post('/api/artists')
        .send({ name: 'Test Artist' })
        .expect(201)

      const artistId = artistResponse.body.data.id

      // Create multiple releases
      for (let i = 1; i <= 5; i++) {
        await request(app)
          .post('/api/releases')
          .send({
            artistId,
            title: `Release ${i}`,
            type: 'single',
            releaseDate: `2024-0${i}-15`
          })
          .expect(201)
      }

      const response = await request(app)
        .get('/api/releases/latest?limit=3')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(3)
    })
  })

  describe('GET /api/releases/stats', () => {
    it('should return release statistics', async () => {
      // Create test artist
      const artistResponse = await request(app)
        .post('/api/artists')
        .send({ name: 'Test Artist' })
        .expect(201)

      const artistId = artistResponse.body.data.id

      // Create releases of different types
      await request(app)
        .post('/api/releases')
        .send({
          artistId,
          title: 'Album 1',
          type: 'album',
          releaseDate: '2024-03-15'
        })
        .expect(201)

      await request(app)
        .post('/api/releases')
        .send({
          artistId,
          title: 'Single 1',
          type: 'single',
          releaseDate: '2024-04-15'
        })
        .expect(201)

      const response = await request(app)
        .get('/api/releases/stats')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('total')
      expect(response.body.data).toHaveProperty('byType')
      expect(response.body.data.total).toBe(2)
      expect(response.body.data.byType).toHaveProperty('album', 1)
      expect(response.body.data.byType).toHaveProperty('single', 1)
    })

    it('should return zero stats when no releases exist', async () => {
      const response = await request(app)
        .get('/api/releases/stats')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.total).toBe(0)
    })
  })

  describe('GET /api/releases/type/:type', () => {
    it('should return releases filtered by type with pagination', async () => {
      // Create test artist
      const artistResponse = await request(app)
        .post('/api/artists')
        .send({ name: 'Test Artist' })
        .expect(201)

      const artistId = artistResponse.body.data.id

      // Create releases of different types
      await request(app)
        .post('/api/releases')
        .send({
          artistId,
          title: 'Album 1',
          type: 'album',
          releaseDate: '2024-03-15'
        })
        .expect(201)

      await request(app)
        .post('/api/releases')
        .send({
          artistId,
          title: 'Single 1',
          type: 'single',
          releaseDate: '2024-04-15'
        })
        .expect(201)

      const response = await request(app)
        .get('/api/releases/type/album')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].title).toBe('Album 1')
      expect(response.body.data[0].type).toBe('album')
      expect(response.body.pagination).toBeDefined()
    })

    it('should return 400 for invalid release type', async () => {
      const response = await request(app)
        .get('/api/releases/type/invalid')
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('INVALID_TYPE')
    })
  })

  describe('GET /api/releases/:id', () => {
    it('should return release by ID with artist data', async () => {
      // Create test artist
      const artistResponse = await request(app)
        .post('/api/artists')
        .send({ name: 'Test Artist', bio: 'Artist bio' })
        .expect(201)

      const artistId = artistResponse.body.data.id

      // Create test release
      const createResponse = await request(app)
        .post('/api/releases')
        .send({
          artistId,
          title: 'Test Album',
          type: 'album',
          releaseDate: '2024-03-15',
          description: 'A great album',
          streamingLinks: {
            spotify: 'https://open.spotify.com/album/test'
          }
        })
        .expect(201)

      const releaseId = createResponse.body.data.id

      const response = await request(app)
        .get(`/api/releases/${releaseId}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toMatchObject({
        id: releaseId,
        title: 'Test Album',
        type: 'album',
        description: 'A great album',
        streamingLinks: { spotify: 'https://open.spotify.com/album/test' }
      })
      expect(response.body.data.artist).toMatchObject({
        id: artistId,
        name: 'Test Artist'
      })
    })

    it('should return 404 for non-existent release', async () => {
      const response = await request(app)
        .get('/api/releases/999999')
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('RELEASE_NOT_FOUND')
    })

    it('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .get('/api/releases/invalid')
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('INVALID_ID')
    })
  })

  describe('POST /api/releases', () => {
    it('should create new release with valid data', async () => {
      // Create test artist first
      const artistResponse = await request(app)
        .post('/api/artists')
        .send({ name: 'Test Artist' })
        .expect(201)

      const artistId = artistResponse.body.data.id

      const releaseData = {
        artistId,
        title: 'New Album',
        type: 'album',
        releaseDate: '2024-06-15',
        description: 'A fantastic new album',
        streamingLinks: {
          spotify: 'https://open.spotify.com/album/newalbum',
          appleMusic: 'https://music.apple.com/album/newalbum'
        }
      }

      const response = await request(app)
        .post('/api/releases')
        .send(releaseData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toMatchObject({
        title: releaseData.title,
        type: releaseData.type,
        description: releaseData.description,
        streamingLinks: releaseData.streamingLinks
      })
      expect(response.body.data.id).toBeDefined()
      expect(response.body.message).toBe('Release created successfully')
    })

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/releases')
        .send({}) // Missing required fields
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should validate artist exists', async () => {
      const releaseData = {
        artistId: 999999, // Non-existent artist
        title: 'Test Album',
        type: 'album',
        releaseDate: '2024-06-15'
      }

      const response = await request(app)
        .post('/api/releases')
        .send(releaseData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('ARTIST_NOT_FOUND')
    })

    it('should validate release type', async () => {
      // Create test artist first
      const artistResponse = await request(app)
        .post('/api/artists')
        .send({ name: 'Test Artist' })
        .expect(201)

      const artistId = artistResponse.body.data.id

      const releaseData = {
        artistId,
        title: 'Test Album',
        type: 'invalid_type', // Invalid type
        releaseDate: '2024-06-15'
      }

      const response = await request(app)
        .post('/api/releases')
        .send(releaseData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should validate streaming platform URLs', async () => {
      // Create test artist first
      const artistResponse = await request(app)
        .post('/api/artists')
        .send({ name: 'Test Artist' })
        .expect(201)

      const artistId = artistResponse.body.data.id

      const releaseData = {
        artistId,
        title: 'Test Album',
        type: 'album',
        releaseDate: '2024-06-15',
        streamingLinks: {
          spotify: 'invalid-url' // Invalid URL
        }
      }

      const response = await request(app)
        .post('/api/releases')
        .send(releaseData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('PUT /api/releases/:id', () => {
    it('should update release with valid data', async () => {
      // Create test artist
      const artistResponse = await request(app)
        .post('/api/artists')
        .send({ name: 'Test Artist' })
        .expect(201)

      const artistId = artistResponse.body.data.id

      // Create test release
      const createResponse = await request(app)
        .post('/api/releases')
        .send({
          artistId,
          title: 'Original Title',
          type: 'album',
          releaseDate: '2024-03-15'
        })
        .expect(201)

      const releaseId = createResponse.body.data.id

      const updateData = {
        title: 'Updated Title',
        description: 'Updated description',
        streamingLinks: {
          spotify: 'https://open.spotify.com/album/updated'
        }
      }

      const response = await request(app)
        .put(`/api/releases/${releaseId}`)
        .send(updateData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toMatchObject(updateData)
      expect(response.body.message).toBe('Release updated successfully')
    })

    it('should return 404 for non-existent release', async () => {
      const response = await request(app)
        .put('/api/releases/999999')
        .send({ title: 'Updated Title' })
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('RELEASE_NOT_FOUND')
    })

    it('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .put('/api/releases/invalid')
        .send({ title: 'Updated Title' })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('INVALID_ID')
    })

    it('should validate update data', async () => {
      // Create test artist and release
      const artistResponse = await request(app)
        .post('/api/artists')
        .send({ name: 'Test Artist' })
        .expect(201)

      const artistId = artistResponse.body.data.id

      const createResponse = await request(app)
        .post('/api/releases')
        .send({
          artistId,
          title: 'Test Album',
          type: 'album',
          releaseDate: '2024-03-15'
        })
        .expect(201)

      const releaseId = createResponse.body.data.id

      const response = await request(app)
        .put(`/api/releases/${releaseId}`)
        .send({
          type: 'invalid_type' // Invalid type
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('DELETE /api/releases/:id', () => {
    it('should delete existing release', async () => {
      // Create test artist
      const artistResponse = await request(app)
        .post('/api/artists')
        .send({ name: 'Test Artist' })
        .expect(201)

      const artistId = artistResponse.body.data.id

      // Create test release
      const createResponse = await request(app)
        .post('/api/releases')
        .send({
          artistId,
          title: 'Release to Delete',
          type: 'single',
          releaseDate: '2024-03-15'
        })
        .expect(201)

      const releaseId = createResponse.body.data.id

      await request(app)
        .delete(`/api/releases/${releaseId}`)
        .expect(204)

      // Verify release is deleted
      await request(app)
        .get(`/api/releases/${releaseId}`)
        .expect(404)
    })

    it('should return 404 for non-existent release', async () => {
      const response = await request(app)
        .delete('/api/releases/999999')
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('RELEASE_NOT_FOUND')
    })

    it('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .delete('/api/releases/invalid')
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('INVALID_ID')
    })
  })

  describe('Error handling', () => {
    it('should handle internal server errors gracefully', async () => {
      const response = await request(app)
        .get('/api/releases/999999')
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toHaveProperty('code')
      expect(response.body.error).toHaveProperty('message')
      expect(response.body).toHaveProperty('timestamp')
    })
  })
})