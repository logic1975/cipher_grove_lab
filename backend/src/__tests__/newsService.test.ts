import { NewsService } from '../services/newsService'
import { cleanupTestDatabase, testDatabaseConnection } from '../config/database'

describe('NewsService', () => {
  beforeAll(async () => {
    await testDatabaseConnection()
  })

  beforeEach(async () => {
    await cleanupTestDatabase()
  })

  describe('createNews', () => {
    it('should create a new news article with valid data', async () => {
      const newsData = {
        title: 'Test News Article',
        content: 'This is a comprehensive test content for the news article that should be at least 10 characters long.',
        author: 'Test Author',
        publishedAt: new Date('2024-06-15')
      }

      const news = await NewsService.createNews(newsData)

      expect(news).toMatchObject({
        title: newsData.title,
        content: newsData.content,
        author: newsData.author
      })
      expect(news.id).toBeDefined()
      expect(news.slug).toBeDefined()
      expect(news.slug).toBe('test-news-article')
      expect(news.publishedAt).toEqual(newsData.publishedAt)
      expect(news.createdAt).toBeDefined()
      expect(news.updatedAt).toBeDefined()
    })

    it('should auto-generate slug from title', async () => {
      const news = await NewsService.createNews({
        title: 'This Is A Test Title With Special Characters!@#',
        content: 'Test content that is long enough to pass validation.'
      })

      expect(news.slug).toBe('this-is-a-test-title-with-special-characters')
    })

    it('should use provided slug if valid', async () => {
      const news = await NewsService.createNews({
        title: 'Test Article',
        content: 'Test content that is long enough to pass validation.',
        slug: 'custom-slug'
      })

      expect(news.slug).toBe('custom-slug')
    })

    it('should ensure slug uniqueness', async () => {
      // Create first article
      await NewsService.createNews({
        title: 'Test Article',
        content: 'First test content that is long enough to pass validation.'
      })

      // Create second article with same title
      const secondNews = await NewsService.createNews({
        title: 'Test Article',
        content: 'Second test content that is long enough to pass validation.'
      })

      expect(secondNews.slug).toBe('test-article-1')
    })

    it('should use default author if not provided', async () => {
      const news = await NewsService.createNews({
        title: 'Test Article',
        content: 'Test content that is long enough to pass validation.'
      })

      expect(news.author).toBe('Music Label')
    })

    it('should create draft article when publishedAt is null', async () => {
      const news = await NewsService.createNews({
        title: 'Draft Article',
        content: 'Test content that is long enough to pass validation.',
        publishedAt: null
      })

      expect(news.publishedAt).toBeNull()
    })

    it('should validate title length', async () => {
      await expect(
        NewsService.createNews({
          title: '',
          content: 'Test content that is long enough to pass validation.'
        })
      ).rejects.toThrow('Validation failed')

      await expect(
        NewsService.createNews({
          title: 'a'.repeat(256),
          content: 'Test content that is long enough to pass validation.'
        })
      ).rejects.toThrow('Validation failed')
    })

    it('should validate content length', async () => {
      await expect(
        NewsService.createNews({
          title: 'Test Title',
          content: 'Short'
        })
      ).rejects.toThrow('Validation failed')

      await expect(
        NewsService.createNews({
          title: 'Test Title',
          content: 'a'.repeat(50001)
        })
      ).rejects.toThrow('Validation failed')
    })

    it('should validate author length', async () => {
      await expect(
        NewsService.createNews({
          title: 'Test Title',
          content: 'Test content that is long enough to pass validation.',
          author: ''
        })
      ).rejects.toThrow('Validation failed')

      await expect(
        NewsService.createNews({
          title: 'Test Title',
          content: 'Test content that is long enough to pass validation.',
          author: 'a'.repeat(101)
        })
      ).rejects.toThrow('Validation failed')
    })

    it('should validate slug format', async () => {
      await expect(
        NewsService.createNews({
          title: 'Test Title',
          content: 'Test content that is long enough to pass validation.',
          slug: 'Invalid Slug With Spaces'
        })
      ).rejects.toThrow('Validation failed')

      await expect(
        NewsService.createNews({
          title: 'Test Title',
          content: 'Test content that is long enough to pass validation.',
          slug: 'invalid-slug-with-special-chars!'
        })
      ).rejects.toThrow('Validation failed')
    })
  })

  describe('getNews', () => {
    beforeEach(async () => {
      // Create test news articles
      await NewsService.createNews({
        title: 'Published Article 1',
        content: 'Content for published article 1 that is long enough.',
        publishedAt: new Date('2024-01-15')
      })
      await NewsService.createNews({
        title: 'Published Article 2',
        content: 'Content for published article 2 that is long enough.',
        publishedAt: new Date('2024-02-10')
      })
      await NewsService.createNews({
        title: 'Draft Article',
        content: 'Content for draft article that is long enough.',
        publishedAt: null
      })
    })

    it('should return paginated news articles', async () => {
      const result = await NewsService.getNews({ page: 1, limit: 2 })

      expect(result.news).toHaveLength(2)
      expect(result.pagination).toMatchObject({
        page: 1,
        limit: 2,
        total: 3,
        totalPages: 2,
        hasNext: true,
        hasPrev: false
      })
    })

    it('should filter by published status', async () => {
      const publishedResult = await NewsService.getNews({ published: true })
      const draftResult = await NewsService.getNews({ published: false })

      expect(publishedResult.news).toHaveLength(2)
      expect(draftResult.news).toHaveLength(1)
      
      publishedResult.news.forEach(article => {
        expect(article.publishedAt).not.toBeNull()
      })
      
      draftResult.news.forEach(article => {
        expect(article.publishedAt).toBeNull()
      })
    })

    it('should search in title, content, and author', async () => {
      const result = await NewsService.getNews({ search: 'published' })

      expect(result.news.length).toBeGreaterThan(0)
      result.news.forEach(article => {
        expect(
          article.title.toLowerCase().includes('published') ||
          article.content.toLowerCase().includes('published') ||
          article.author.toLowerCase().includes('published')
        ).toBe(true)
      })
    })

    it('should sort articles correctly', async () => {
      const newestResult = await NewsService.getNews({ sort: 'newest' })
      const oldestResult = await NewsService.getNews({ sort: 'oldest' })
      const titleResult = await NewsService.getNews({ sort: 'title' })

      // Newest first (published articles come first, then by creation date)
      // Note: Draft articles (null publishedAt) may come first, then published by date
      const publishedArticles = newestResult.news.filter(n => n.publishedAt !== null)
      expect(publishedArticles[0].title).toBe('Published Article 2') // Feb 10
      expect(publishedArticles[1].title).toBe('Published Article 1') // Jan 15

      // Oldest first
      const oldestPublished = oldestResult.news.filter(n => n.publishedAt !== null)
      expect(oldestPublished[0].title).toBe('Published Article 1') // Jan 15
      expect(oldestPublished[1].title).toBe('Published Article 2') // Feb 10

      // Title alphabetical
      expect(titleResult.news[0].title).toBe('Draft Article')
      expect(titleResult.news[1].title).toBe('Published Article 1')
      expect(titleResult.news[2].title).toBe('Published Article 2')
    })
  })

  describe('getNewsById', () => {
    let testNewsId: number

    beforeEach(async () => {
      const news = await NewsService.createNews({
        title: 'Test News',
        content: 'Test content that is long enough to pass validation.'
      })
      testNewsId = news.id
    })

    it('should return news article by ID', async () => {
      const news = await NewsService.getNewsById(testNewsId)

      expect(news).toMatchObject({
        id: testNewsId,
        title: 'Test News'
      })
    })

    it('should return null for non-existent news', async () => {
      const news = await NewsService.getNewsById(99999)
      expect(news).toBeNull()
    })
  })

  describe('getNewsBySlug', () => {
    beforeEach(async () => {
      await NewsService.createNews({
        title: 'Test News',
        content: 'Test content that is long enough to pass validation.',
        slug: 'test-news-slug'
      })
    })

    it('should return news article by slug', async () => {
      const news = await NewsService.getNewsBySlug('test-news-slug')

      expect(news).toMatchObject({
        title: 'Test News',
        slug: 'test-news-slug'
      })
    })

    it('should return null for non-existent slug', async () => {
      const news = await NewsService.getNewsBySlug('non-existent-slug')
      expect(news).toBeNull()
    })
  })

  describe('updateNews', () => {
    let testNewsId: number

    beforeEach(async () => {
      const news = await NewsService.createNews({
        title: 'Original Title',
        content: 'Original content that is long enough to pass validation.',
        author: 'Original Author'
      })
      testNewsId = news.id
    })

    it('should update news with valid data', async () => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content that is long enough to pass validation.',
        author: 'Updated Author'
      }

      const updatedNews = await NewsService.updateNews(testNewsId, updateData)

      expect(updatedNews).toMatchObject(updateData)
      expect(updatedNews.slug).toBe('updated-title')
      expect(updatedNews.updatedAt.getTime()).toBeGreaterThan(updatedNews.createdAt.getTime())
    })

    it('should throw error for non-existent news', async () => {
      await expect(
        NewsService.updateNews(99999, { title: 'Updated Title' })
      ).rejects.toThrow('News article not found')
    })

    it('should auto-generate new slug when title changes', async () => {
      const updatedNews = await NewsService.updateNews(testNewsId, {
        title: 'Completely New Title'
      })

      expect(updatedNews.slug).toBe('completely-new-title')
    })

    it('should use provided slug when updating', async () => {
      const updatedNews = await NewsService.updateNews(testNewsId, {
        title: 'New Title',
        slug: 'custom-new-slug'
      })

      expect(updatedNews.slug).toBe('custom-new-slug')
    })

    it('should ensure slug uniqueness on update', async () => {
      // Create another article
      await NewsService.createNews({
        title: 'Another Article',
        content: 'Another content that is long enough to pass validation.',
        slug: 'existing-slug'
      })

      // Try to update first article with existing slug
      const updatedNews = await NewsService.updateNews(testNewsId, {
        slug: 'existing-slug'
      })

      expect(updatedNews.slug).toBe('existing-slug-1')
    })

    it('should validate updated data', async () => {
      await expect(
        NewsService.updateNews(testNewsId, { title: '' })
      ).rejects.toThrow('Validation failed')

      await expect(
        NewsService.updateNews(testNewsId, { content: 'Short' })
      ).rejects.toThrow('Validation failed')
    })
  })

  describe('deleteNews', () => {
    let testNewsId: number

    beforeEach(async () => {
      const news = await NewsService.createNews({
        title: 'News to Delete',
        content: 'Content that will be deleted and is long enough.'
      })
      testNewsId = news.id
    })

    it('should delete existing news', async () => {
      const result = await NewsService.deleteNews(testNewsId)
      expect(result).toBe(true)

      const news = await NewsService.getNewsById(testNewsId)
      expect(news).toBeNull()
    })

    it('should throw error for non-existent news', async () => {
      await expect(
        NewsService.deleteNews(99999)
      ).rejects.toThrow('News article not found')
    })
  })

  describe('getPublishedNews', () => {
    beforeEach(async () => {
      await NewsService.createNews({
        title: 'Published Article',
        content: 'Published content that is long enough.',
        publishedAt: new Date()
      })
      await NewsService.createNews({
        title: 'Draft Article',
        content: 'Draft content that is long enough.',
        publishedAt: null
      })
    })

    it('should return only published articles', async () => {
      const result = await NewsService.getPublishedNews()

      expect(result.news).toHaveLength(1)
      expect(result.news[0].title).toBe('Published Article')
      expect(result.news[0].publishedAt).not.toBeNull()
    })
  })

  describe('getDraftNews', () => {
    beforeEach(async () => {
      await NewsService.createNews({
        title: 'Published Article',
        content: 'Published content that is long enough.',
        publishedAt: new Date()
      })
      await NewsService.createNews({
        title: 'Draft Article',
        content: 'Draft content that is long enough.',
        publishedAt: null
      })
    })

    it('should return only draft articles', async () => {
      const result = await NewsService.getDraftNews()

      expect(result.news).toHaveLength(1)
      expect(result.news[0].title).toBe('Draft Article')
      expect(result.news[0].publishedAt).toBeNull()
    })
  })

  describe('publishNews', () => {
    let draftNewsId: number

    beforeEach(async () => {
      const news = await NewsService.createNews({
        title: 'Draft Article',
        content: 'Draft content that is long enough.',
        publishedAt: null
      })
      draftNewsId = news.id
    })

    it('should publish a draft article', async () => {
      const publishedNews = await NewsService.publishNews(draftNewsId)

      expect(publishedNews.publishedAt).not.toBeNull()
      expect(publishedNews.publishedAt).toBeInstanceOf(Date)
    })

    it('should throw error for non-existent article', async () => {
      await expect(
        NewsService.publishNews(99999)
      ).rejects.toThrow('News article not found')
    })

    it('should throw error when trying to publish already published article', async () => {
      await NewsService.publishNews(draftNewsId)

      await expect(
        NewsService.publishNews(draftNewsId)
      ).rejects.toThrow('News article is already published')
    })
  })

  describe('unpublishNews', () => {
    let publishedNewsId: number

    beforeEach(async () => {
      const news = await NewsService.createNews({
        title: 'Published Article',
        content: 'Published content that is long enough.',
        publishedAt: new Date()
      })
      publishedNewsId = news.id
    })

    it('should unpublish a published article', async () => {
      const unpublishedNews = await NewsService.unpublishNews(publishedNewsId)

      expect(unpublishedNews.publishedAt).toBeNull()
    })

    it('should throw error for non-existent article', async () => {
      await expect(
        NewsService.unpublishNews(99999)
      ).rejects.toThrow('News article not found')
    })

    it('should throw error when trying to unpublish draft article', async () => {
      await NewsService.unpublishNews(publishedNewsId)

      await expect(
        NewsService.unpublishNews(publishedNewsId)
      ).rejects.toThrow('News article is already a draft')
    })
  })

  describe('getLatestNews', () => {
    beforeEach(async () => {
      // Create news with different publish dates
      await NewsService.createNews({
        title: 'Oldest News',
        content: 'Oldest content that is long enough.',
        publishedAt: new Date('2024-01-01')
      })
      await NewsService.createNews({
        title: 'Middle News',
        content: 'Middle content that is long enough.',
        publishedAt: new Date('2024-02-01')
      })
      await NewsService.createNews({
        title: 'Latest News',
        content: 'Latest content that is long enough.',
        publishedAt: new Date('2024-03-01')
      })
      await NewsService.createNews({
        title: 'Draft News',
        content: 'Draft content that is long enough.',
        publishedAt: null
      })
    })

    it('should return latest published news in descending order', async () => {
      const latestNews = await NewsService.getLatestNews(2)

      expect(latestNews).toHaveLength(2)
      expect(latestNews[0].title).toBe('Latest News')
      expect(latestNews[1].title).toBe('Middle News')
      
      // Should not include draft
      expect(latestNews.find(news => news.title === 'Draft News')).toBeUndefined()
    })

    it('should limit results correctly', async () => {
      const latestNews = await NewsService.getLatestNews(5)

      expect(latestNews.length).toBeLessThanOrEqual(5)
      expect(latestNews).toHaveLength(3) // Only 3 published articles
    })
  })

  describe('searchNews', () => {
    beforeEach(async () => {
      await NewsService.createNews({
        title: 'Technology News',
        content: 'Content about technology that is long enough.',
        publishedAt: new Date()
      })
      await NewsService.createNews({
        title: 'Music Industry Update',
        content: 'Content about music industry that is long enough.',
        publishedAt: new Date()
      })
      await NewsService.createNews({
        title: 'Draft Technology Article',
        content: 'Draft content about technology that is long enough.',
        publishedAt: null
      })
    })

    it('should search in published articles by default', async () => {
      const result = await NewsService.searchNews('technology')

      expect(result.news).toHaveLength(1)
      expect(result.news[0].title).toBe('Technology News')
      expect(result.news[0].publishedAt).not.toBeNull()
    })

    it('should search in all articles when publishedOnly is false', async () => {
      const result = await NewsService.searchNews('technology', { publishedOnly: false })

      expect(result.news).toHaveLength(2)
      expect(result.news.find(news => news.title === 'Draft Technology Article')).toBeDefined()
    })

    it('should search in content', async () => {
      const result = await NewsService.searchNews('music industry')

      expect(result.news).toHaveLength(1)
      expect(result.news[0].title).toBe('Music Industry Update')
    })
  })

  describe('getNewsStats', () => {
    beforeEach(async () => {
      const currentDate = new Date()
      const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      
      // Create articles for current month
      await NewsService.createNews({
        title: 'Current Month Article 1',
        content: 'Content for current month that is long enough.',
        publishedAt: currentMonth
      })
      await NewsService.createNews({
        title: 'Current Month Article 2',
        content: 'Content for current month that is long enough.',
        publishedAt: new Date(currentMonth.getTime() + 24 * 60 * 60 * 1000) // Next day
      })
      
      // Create article for previous month
      const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 15)
      await NewsService.createNews({
        title: 'Previous Month Article',
        content: 'Content for previous month that is long enough.',
        publishedAt: previousMonth
      })
      
      // Create draft article
      await NewsService.createNews({
        title: 'Draft Article',
        content: 'Draft content that is long enough.',
        publishedAt: null
      })
    })

    it('should return news statistics', async () => {
      const stats = await NewsService.getNewsStats()

      expect(stats.total).toBe(4)
      expect(stats.published).toBe(3)
      expect(stats.drafts).toBe(1)
      expect(stats.thisMonth).toBe(2)
    })
  })
})