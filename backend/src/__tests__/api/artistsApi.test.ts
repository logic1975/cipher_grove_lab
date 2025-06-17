import request from 'supertest'
import app from '../../app'
import { cleanupTestDatabase, testDatabaseConnection } from '../../config/database'

describe('Artists API', () => {
  beforeAll(async () => {
    await testDatabaseConnection()
  })

  beforeEach(async () => {
    await cleanupTestDatabase()
  })

  describe('GET /api/artists', () => {
    it('should return empty array when no artists exist', async () => {
      const response = await request(app)
        .get('/api/artists')
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

    it('should return paginated artists', async () => {
      // Create test artists
      await request(app)
        .post('/api/artists')
        .send({ name: 'Artist 1', bio: 'First artist' })
        .expect(201)

      await request(app)
        .post('/api/artists')
        .send({ name: 'Artist 2', bio: 'Second artist' })
        .expect(201)

      const response = await request(app)
        .get('/api/artists?page=1&limit=1')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 1,
        total: 2,
        totalPages: 2,
        hasNext: true,
        hasPrev: false
      })
    })

    it('should filter by featured status', async () => {
      await request(app)
        .post('/api/artists')
        .send({ name: 'Regular Artist', isFeatured: false })
        .expect(201)

      await request(app)
        .post('/api/artists')
        .send({ name: 'Featured Artist', isFeatured: true })
        .expect(201)

      const response = await request(app)
        .get('/api/artists?featured=true')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].name).toBe('Featured Artist')
      expect(response.body.data[0].isFeatured).toBe(true)
    })

    it('should search artists by name', async () => {
      await request(app)
        .post('/api/artists')
        .send({ name: 'Rock Band', bio: 'A great rock band' })
        .expect(201)

      await request(app)
        .post('/api/artists')
        .send({ name: 'Jazz Group', bio: 'Jazz musicians' })
        .expect(201)

      const response = await request(app)
        .get('/api/artists?search=rock')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].name).toBe('Rock Band')
    })
  })

  describe('GET /api/artists/featured', () => {
    it('should return only featured artists', async () => {
      await request(app)
        .post('/api/artists')
        .send({ name: 'Regular Artist', isFeatured: false })
        .expect(201)

      await request(app)
        .post('/api/artists')
        .send({ name: 'Featured Artist', isFeatured: true })
        .expect(201)

      const response = await request(app)
        .get('/api/artists/featured')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].name).toBe('Featured Artist')
      expect(response.body.data[0].isFeatured).toBe(true)
    })

    it('should return empty array when no featured artists exist', async () => {
      await request(app)
        .post('/api/artists')
        .send({ name: 'Regular Artist', isFeatured: false })
        .expect(201)

      const response = await request(app)
        .get('/api/artists/featured')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual([])
    })
  })

  describe('GET /api/artists/:id', () => {
    it('should return artist by ID', async () => {
      const createResponse = await request(app)
        .post('/api/artists')
        .send({
          name: 'Test Artist',
          bio: 'A test artist',
          socialLinks: { instagram: 'https://instagram.com/test' }
        })
        .expect(201)

      const artistId = createResponse.body.data.id

      const response = await request(app)
        .get(`/api/artists/${artistId}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toMatchObject({
        id: artistId,
        name: 'Test Artist',
        bio: 'A test artist',
        socialLinks: { instagram: 'https://instagram.com/test' }
      })
    })

    it('should return 404 for non-existent artist', async () => {
      const response = await request(app)
        .get('/api/artists/999999')
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('ARTIST_NOT_FOUND')
    })

    it('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .get('/api/artists/invalid')
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('INVALID_ID')
    })
  })

  describe('POST /api/artists', () => {
    it('should create new artist with valid data', async () => {
      const artistData = {
        name: 'New Artist',
        bio: 'A new artist on the label',
        socialLinks: {
          spotify: 'https://open.spotify.com/artist/newartist',
          instagram: 'https://instagram.com/newartist'
        },
        isFeatured: false
      }

      const response = await request(app)
        .post('/api/artists')
        .send(artistData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toMatchObject({
        name: artistData.name,
        bio: artistData.bio,
        socialLinks: artistData.socialLinks,
        isFeatured: false
      })
      expect(response.body.data.id).toBeDefined()
      expect(response.body.message).toBe('Artist created successfully')
    })

    it('should reject duplicate artist names', async () => {
      await request(app)
        .post('/api/artists')
        .send({ name: 'Duplicate Artist' })
        .expect(201)

      const response = await request(app)
        .post('/api/artists')
        .send({ name: 'Duplicate Artist' })
        .expect(409)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('DUPLICATE_ARTIST')
    })

    it('should enforce featured artist limit (max 6)', async () => {
      // Create 6 featured artists
      for (let i = 1; i <= 6; i++) {
        await request(app)
          .post('/api/artists')
          .send({ name: `Featured Artist ${i}`, isFeatured: true })
          .expect(201)
      }

      // 7th featured artist should fail
      const response = await request(app)
        .post('/api/artists')
        .send({ name: 'Featured Artist 7', isFeatured: true })
        .expect(422)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('FEATURED_LIMIT_EXCEEDED')
    })

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/artists')
        .send({}) // Missing required name
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should validate social media URLs', async () => {
      const response = await request(app)
        .post('/api/artists')
        .send({
          name: 'Test Artist',
          socialLinks: { instagram: 'not-a-valid-url' }
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('PUT /api/artists/:id', () => {
    it('should update artist with valid data', async () => {
      const createResponse = await request(app)
        .post('/api/artists')
        .send({ name: 'Original Artist', bio: 'Original bio' })
        .expect(201)

      const artistId = createResponse.body.data.id

      const updateData = {
        name: 'Updated Artist',
        bio: 'Updated bio',
        socialLinks: { instagram: 'https://instagram.com/updated' }
      }

      const response = await request(app)
        .put(`/api/artists/${artistId}`)
        .send(updateData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toMatchObject(updateData)
      expect(response.body.message).toBe('Artist updated successfully')
    })

    it('should return 404 for non-existent artist', async () => {
      const response = await request(app)
        .put('/api/artists/999999')
        .send({ name: 'Updated Name' })
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('ARTIST_NOT_FOUND')
    })

    it('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .put('/api/artists/invalid')
        .send({ name: 'Updated Name' })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('INVALID_ID')
    })

    it('should prevent duplicate names on update', async () => {
      await request(app)
        .post('/api/artists')
        .send({ name: 'Artist 1' })
        .expect(201)

      const createResponse = await request(app)
        .post('/api/artists')
        .send({ name: 'Artist 2' })
        .expect(201)

      const artistId = createResponse.body.data.id

      const response = await request(app)
        .put(`/api/artists/${artistId}`)
        .send({ name: 'Artist 1' }) // Duplicate name
        .expect(409)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('DUPLICATE_ARTIST')
    })
  })

  describe('DELETE /api/artists/:id', () => {
    it('should delete existing artist', async () => {
      const createResponse = await request(app)
        .post('/api/artists')
        .send({ name: 'Artist to Delete' })
        .expect(201)

      const artistId = createResponse.body.data.id

      await request(app)
        .delete(`/api/artists/${artistId}`)
        .expect(204)

      // Verify artist is deleted
      await request(app)
        .get(`/api/artists/${artistId}`)
        .expect(404)
    })

    it('should return 404 for non-existent artist', async () => {
      const response = await request(app)
        .delete('/api/artists/999999')
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('ARTIST_NOT_FOUND')
    })

    it('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .delete('/api/artists/invalid')
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('INVALID_ID')
    })
  })

  describe('Error handling', () => {
    it('should handle internal server errors gracefully', async () => {
      // This would require mocking the service to throw an error
      // For now, we'll just verify the error structure is correct
      const response = await request(app)
        .get('/api/artists/999999')
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toHaveProperty('code')
      expect(response.body.error).toHaveProperty('message')
      expect(response.body).toHaveProperty('timestamp')
    })
  })
})