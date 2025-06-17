import request from 'supertest'
import app from '../../app'
import { cleanupTestDatabase, testDatabaseConnection } from '../../config/database'

describe('News API', () => {
  beforeAll(async () => {
    await testDatabaseConnection()
  })

  beforeEach(async () => {
    await cleanupTestDatabase()
  })

  describe('GET /api/news', () => {
    it('should return empty array when no news exist', async () => {
      const response = await request(app)
        .get('/api/news')
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

    it('should return paginated news articles', async () => {
      // Create test news articles
      await request(app)
        .post('/api/news')
        .send({
          title: 'First News',
          content: 'This is the first news article content.',
          publishedAt: new Date().toISOString()
        })
        .expect(201)

      await request(app)
        .post('/api/news')
        .send({
          title: 'Second News',
          content: 'This is the second news article content.',
          publishedAt: new Date().toISOString()
        })
        .expect(201)

      const response = await request(app)
        .get('/api/news?page=1&limit=1')
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

    it('should filter by published status', async () => {
      // Create published article
      await request(app)
        .post('/api/news')
        .send({
          title: 'Published News',
          content: 'This is published content.',
          publishedAt: new Date().toISOString()
        })
        .expect(201)

      // Create draft article
      await request(app)
        .post('/api/news')
        .send({
          title: 'Draft News',
          content: 'This is draft content.',
          publishedAt: null
        })
        .expect(201)

      const response = await request(app)
        .get('/api/news?published=true')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].title).toBe('Published News')
      expect(response.body.data[0].publishedAt).not.toBeNull()
    })

    it('should search news by title and content', async () => {
      await request(app)
        .post('/api/news')
        .send({
          title: 'Music News Update',
          content: 'This is about the latest album release.',
          publishedAt: new Date().toISOString()
        })
        .expect(201)

      await request(app)
        .post('/api/news')
        .send({
          title: 'Band Tour Announcement',
          content: 'Tour dates have been announced.',
          publishedAt: new Date().toISOString()
        })
        .expect(201)

      const response = await request(app)
        .get('/api/news?search=album')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].title).toBe('Music News Update')
    })

    it('should sort news articles', async () => {
      const oldDate = new Date('2024-01-15').toISOString()
      const newDate = new Date('2024-06-15').toISOString()

      await request(app)
        .post('/api/news')
        .send({
          title: 'Older News',
          content: 'Older content.',
          publishedAt: oldDate
        })
        .expect(201)

      await request(app)
        .post('/api/news')
        .send({
          title: 'Newer News',
          content: 'Newer content.',
          publishedAt: newDate
        })
        .expect(201)

      const response = await request(app)
        .get('/api/news?sort=newest')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(2)
      expect(response.body.data[0].title).toBe('Newer News')
      expect(response.body.data[1].title).toBe('Older News')
    })
  })

  describe('GET /api/news/published', () => {
    it('should return only published news articles', async () => {
      // Create published article
      await request(app)
        .post('/api/news')
        .send({
          title: 'Published News',
          content: 'This is published content.',
          publishedAt: new Date().toISOString()
        })
        .expect(201)

      // Create draft article
      await request(app)
        .post('/api/news')
        .send({
          title: 'Draft News',
          content: 'This is draft content.',
          publishedAt: null
        })
        .expect(201)

      const response = await request(app)
        .get('/api/news/published')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].title).toBe('Published News')
      expect(response.body.data[0].publishedAt).not.toBeNull()
    })

    it('should return empty array when no published articles exist', async () => {
      // Create only draft article
      await request(app)
        .post('/api/news')
        .send({
          title: 'Draft News',
          content: 'This is draft content.',
          publishedAt: null
        })
        .expect(201)

      const response = await request(app)
        .get('/api/news/published')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual([])
    })

    it('should support pagination for published articles', async () => {
      // Create multiple published articles
      for (let i = 1; i <= 5; i++) {
        await request(app)
          .post('/api/news')
          .send({
            title: `Published News ${i}`,
            content: `Content for article ${i}.`,
            publishedAt: new Date().toISOString()
          })
          .expect(201)
      }

      const response = await request(app)
        .get('/api/news/published?page=1&limit=3')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(3)
      expect(response.body.pagination.total).toBe(5)
    })
  })

  describe('GET /api/news/drafts', () => {
    it('should return only draft news articles', async () => {
      // Create published article
      await request(app)
        .post('/api/news')
        .send({
          title: 'Published News',
          content: 'This is published content.',
          publishedAt: new Date().toISOString()
        })
        .expect(201)

      // Create draft article
      await request(app)
        .post('/api/news')
        .send({
          title: 'Draft News',
          content: 'This is draft content.',
          publishedAt: null
        })
        .expect(201)

      const response = await request(app)
        .get('/api/news/drafts')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].title).toBe('Draft News')
      expect(response.body.data[0].publishedAt).toBeNull()
    })

    it('should return empty array when no draft articles exist', async () => {
      // Create only published article
      await request(app)
        .post('/api/news')
        .send({
          title: 'Published News',
          content: 'This is published content.',
          publishedAt: new Date().toISOString()
        })
        .expect(201)

      const response = await request(app)
        .get('/api/news/drafts')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual([])
    })
  })

  describe('GET /api/news/latest', () => {
    it('should return latest published news with default limit', async () => {
      // Create multiple published articles
      for (let i = 1; i <= 7; i++) {
        await request(app)
          .post('/api/news')
          .send({
            title: `News ${i}`,
            content: `Content for news ${i}.`,
            publishedAt: new Date(Date.now() + i * 1000).toISOString() // Different timestamps
          })
          .expect(201)
      }

      const response = await request(app)
        .get('/api/news/latest')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(5) // Default limit
      expect(response.body.data[0].title).toBe('News 7') // Latest first
    })

    it('should respect custom limit parameter', async () => {
      // Create multiple published articles
      for (let i = 1; i <= 5; i++) {
        await request(app)
          .post('/api/news')
          .send({
            title: `News ${i}`,
            content: `Content for news ${i}.`,
            publishedAt: new Date(Date.now() + i * 1000).toISOString()
          })
          .expect(201)
      }

      const response = await request(app)
        .get('/api/news/latest?limit=3')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(3)
    })

    it('should exclude draft articles from latest', async () => {
      // Create published article
      await request(app)
        .post('/api/news')
        .send({
          title: 'Published News',
          content: 'Published content.',
          publishedAt: new Date().toISOString()
        })
        .expect(201)

      // Create draft article
      await request(app)
        .post('/api/news')
        .send({
          title: 'Draft News',
          content: 'Draft content.',
          publishedAt: null
        })
        .expect(201)

      const response = await request(app)
        .get('/api/news/latest')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].title).toBe('Published News')
    })
  })

  describe('GET /api/news/stats', () => {
    it('should return news statistics', async () => {
      // Create published articles
      await request(app)
        .post('/api/news')
        .send({
          title: 'Published 1',
          content: 'Content 1.',
          publishedAt: new Date().toISOString()
        })
        .expect(201)

      await request(app)
        .post('/api/news')
        .send({
          title: 'Published 2',
          content: 'Content 2.',
          publishedAt: new Date().toISOString()
        })
        .expect(201)

      // Create draft article
      await request(app)
        .post('/api/news')
        .send({
          title: 'Draft 1',
          content: 'Draft content.',
          publishedAt: null
        })
        .expect(201)

      const response = await request(app)
        .get('/api/news/stats')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('total', 3)
      expect(response.body.data).toHaveProperty('published', 2)
      expect(response.body.data).toHaveProperty('drafts', 1)
      expect(response.body.data).toHaveProperty('thisMonth')
    })

    it('should return zero stats when no news exist', async () => {
      const response = await request(app)
        .get('/api/news/stats')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.total).toBe(0)
      expect(response.body.data.published).toBe(0)
      expect(response.body.data.drafts).toBe(0)
    })
  })

  describe('GET /api/news/search', () => {
    it('should search news articles with query', async () => {
      await request(app)
        .post('/api/news')
        .send({
          title: 'Album Release News',
          content: 'New album is coming out soon.',
          publishedAt: new Date().toISOString()
        })
        .expect(201)

      await request(app)
        .post('/api/news')
        .send({
          title: 'Tour Announcement',
          content: 'Concert tour dates announced.',
          publishedAt: new Date().toISOString()
        })
        .expect(201)

      const response = await request(app)
        .get('/api/news/search?q=album')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].title).toBe('Album Release News')
    })

    it('should return 400 when query is missing', async () => {
      const response = await request(app)
        .get('/api/news/search')
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('MISSING_QUERY')
    })

    it('should support published-only filter in search', async () => {
      // Create published article with search term
      await request(app)
        .post('/api/news')
        .send({
          title: 'Published Album News',
          content: 'Album content.',
          publishedAt: new Date().toISOString()
        })
        .expect(201)

      // Create draft article with search term
      await request(app)
        .post('/api/news')
        .send({
          title: 'Draft Album News',
          content: 'Album content.',
          publishedAt: null
        })
        .expect(201)

      const response = await request(app)
        .get('/api/news/search?q=album&publishedOnly=true')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].title).toBe('Published Album News')
    })

    it('should include drafts when publishedOnly is false', async () => {
      // Create published article with search term
      await request(app)
        .post('/api/news')
        .send({
          title: 'Published Album News',
          content: 'Album content.',
          publishedAt: new Date().toISOString()
        })
        .expect(201)

      // Create draft article with search term
      await request(app)
        .post('/api/news')
        .send({
          title: 'Draft Album News',
          content: 'Album content.',
          publishedAt: null
        })
        .expect(201)

      const response = await request(app)
        .get('/api/news/search?q=album&publishedOnly=false')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(2)
    })
  })

  describe('GET /api/news/slug/:slug', () => {
    it('should return news article by slug', async () => {
      const createResponse = await request(app)
        .post('/api/news')
        .send({
          title: 'Test News Article',
          content: 'This is test content for the article.',
          slug: 'test-news-article',
          publishedAt: new Date().toISOString()
        })
        .expect(201)

      const response = await request(app)
        .get('/api/news/slug/test-news-article')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.title).toBe('Test News Article')
      expect(response.body.data.slug).toBe('test-news-article')
    })

    it('should return 404 for non-existent slug', async () => {
      const response = await request(app)
        .get('/api/news/slug/non-existent-slug')
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('NEWS_NOT_FOUND')
    })
  })

  describe('GET /api/news/:id', () => {
    it('should return news article by ID', async () => {
      const createResponse = await request(app)
        .post('/api/news')
        .send({
          title: 'Test News',
          content: 'This is test content.',
          author: 'Test Author',
          publishedAt: new Date().toISOString()
        })
        .expect(201)

      const newsId = createResponse.body.data.id

      const response = await request(app)
        .get(`/api/news/${newsId}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toMatchObject({
        id: newsId,
        title: 'Test News',
        content: 'This is test content.',
        author: 'Test Author'
      })
    })

    it('should return 404 for non-existent news', async () => {
      const response = await request(app)
        .get('/api/news/999999')
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('NEWS_NOT_FOUND')
    })

    it('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .get('/api/news/invalid')
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('INVALID_ID')
    })
  })

  describe('POST /api/news', () => {
    it('should create new news article with valid data', async () => {
      const newsData = {
        title: 'New Music News',
        content: 'This is exciting news about new music releases.',
        author: 'News Reporter',
        publishedAt: new Date().toISOString()
      }

      const response = await request(app)
        .post('/api/news')
        .send(newsData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toMatchObject({
        title: newsData.title,
        content: newsData.content,
        author: newsData.author
      })
      expect(response.body.data.id).toBeDefined()
      expect(response.body.data.slug).toBeDefined()
      expect(response.body.message).toBe('News article created successfully')
    })

    it('should auto-generate slug from title', async () => {
      const newsData = {
        title: 'Test Article Title',
        content: 'Article content here.',
        publishedAt: new Date().toISOString()
      }

      const response = await request(app)
        .post('/api/news')
        .send(newsData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.slug).toBe('test-article-title')
    })

    it('should create draft when publishedAt is null', async () => {
      const newsData = {
        title: 'Draft Article',
        content: 'This is a draft article.',
        publishedAt: null
      }

      const response = await request(app)
        .post('/api/news')
        .send(newsData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.publishedAt).toBeNull()
    })

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/news')
        .send({}) // Missing required fields
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should validate content length', async () => {
      const response = await request(app)
        .post('/api/news')
        .send({
          title: 'Test',
          content: 'Short' // Too short content
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should handle duplicate slugs', async () => {
      // Create first article
      await request(app)
        .post('/api/news')
        .send({
          title: 'Same Title',
          content: 'First article content.',
          slug: 'same-title'
        })
        .expect(201)

      // Create second article with same title (should get unique slug)
      const response = await request(app)
        .post('/api/news')
        .send({
          title: 'Same Title',
          content: 'Second article content.'
        })
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.slug).toBe('same-title-1') // Auto-incremented
    })
  })

  describe('PUT /api/news/:id', () => {
    it('should update news article with valid data', async () => {
      const createResponse = await request(app)
        .post('/api/news')
        .send({
          title: 'Original Title',
          content: 'Original content.',
          author: 'Original Author'
        })
        .expect(201)

      const newsId = createResponse.body.data.id

      const updateData = {
        title: 'Updated Title',
        content: 'Updated content.',
        author: 'Updated Author'
      }

      const response = await request(app)
        .put(`/api/news/${newsId}`)
        .send(updateData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toMatchObject(updateData)
      expect(response.body.message).toBe('News article updated successfully')
    })

    it('should return 404 for non-existent news', async () => {
      const response = await request(app)
        .put('/api/news/999999')
        .send({ title: 'Updated Title' })
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('NEWS_NOT_FOUND')
    })

    it('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .put('/api/news/invalid')
        .send({ title: 'Updated Title' })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('INVALID_ID')
    })

    it('should validate update data', async () => {
      const createResponse = await request(app)
        .post('/api/news')
        .send({
          title: 'Test News',
          content: 'Test content.'
        })
        .expect(201)

      const newsId = createResponse.body.data.id

      const response = await request(app)
        .put(`/api/news/${newsId}`)
        .send({
          content: 'Bad' // Too short content
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('PUT /api/news/:id/publish', () => {
    it('should publish a draft news article', async () => {
      const createResponse = await request(app)
        .post('/api/news')
        .send({
          title: 'Draft Article',
          content: 'This is a draft article.',
          publishedAt: null
        })
        .expect(201)

      const newsId = createResponse.body.data.id

      const response = await request(app)
        .put(`/api/news/${newsId}/publish`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.publishedAt).not.toBeNull()
      expect(response.body.message).toBe('News article published successfully')
    })

    it('should return 404 for non-existent news', async () => {
      const response = await request(app)
        .put('/api/news/999999/publish')
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('NEWS_NOT_FOUND')
    })

    it('should return 422 for already published article', async () => {
      const createResponse = await request(app)
        .post('/api/news')
        .send({
          title: 'Published Article',
          content: 'This is already published.',
          publishedAt: new Date().toISOString()
        })
        .expect(201)

      const newsId = createResponse.body.data.id

      const response = await request(app)
        .put(`/api/news/${newsId}/publish`)
        .expect(422)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('ALREADY_PUBLISHED')
    })
  })

  describe('PUT /api/news/:id/unpublish', () => {
    it('should unpublish a published news article', async () => {
      const createResponse = await request(app)
        .post('/api/news')
        .send({
          title: 'Published Article',
          content: 'This is a published article.',
          publishedAt: new Date().toISOString()
        })
        .expect(201)

      const newsId = createResponse.body.data.id

      const response = await request(app)
        .put(`/api/news/${newsId}/unpublish`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.publishedAt).toBeNull()
      expect(response.body.message).toBe('News article unpublished successfully')
    })

    it('should return 404 for non-existent news', async () => {
      const response = await request(app)
        .put('/api/news/999999/unpublish')
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('NEWS_NOT_FOUND')
    })

    it('should return 422 for already unpublished article', async () => {
      const createResponse = await request(app)
        .post('/api/news')
        .send({
          title: 'Draft Article',
          content: 'This is a draft.',
          publishedAt: null
        })
        .expect(201)

      const newsId = createResponse.body.data.id

      const response = await request(app)
        .put(`/api/news/${newsId}/unpublish`)
        .expect(422)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('NOT_PUBLISHED')
    })
  })

  describe('DELETE /api/news/:id', () => {
    it('should delete existing news article', async () => {
      const createResponse = await request(app)
        .post('/api/news')
        .send({
          title: 'Article to Delete',
          content: 'This article will be deleted.'
        })
        .expect(201)

      const newsId = createResponse.body.data.id

      await request(app)
        .delete(`/api/news/${newsId}`)
        .expect(204)

      // Verify article is deleted
      await request(app)
        .get(`/api/news/${newsId}`)
        .expect(404)
    })

    it('should return 404 for non-existent news', async () => {
      const response = await request(app)
        .delete('/api/news/999999')
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('NEWS_NOT_FOUND')
    })

    it('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .delete('/api/news/invalid')
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('INVALID_ID')
    })
  })

  describe('Error handling', () => {
    it('should handle internal server errors gracefully', async () => {
      const response = await request(app)
        .get('/api/news/999999')
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toHaveProperty('code')
      expect(response.body.error).toHaveProperty('message')
      expect(response.body).toHaveProperty('timestamp')
    })
  })
})