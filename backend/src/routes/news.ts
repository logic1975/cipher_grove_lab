import express, { Request, Response } from 'express'
import { NewsService } from '../services/newsService'

const router = express.Router()

// GET /api/news - Get all news with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const published = req.query.published === 'true' ? true : 
                     req.query.published === 'false' ? false : undefined
    const search = req.query.search as string
    const sort = req.query.sort as 'newest' | 'oldest' | 'title' | undefined

    const result = await NewsService.getNews({
      page,
      limit,
      published,
      search,
      sort
    })

    res.json({
      success: true,
      data: result.news,
      pagination: result.pagination,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    })
  }
})

// GET /api/news/published - Get published news
router.get('/published', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10

    const result = await NewsService.getPublishedNews({ page, limit })

    res.json({
      success: true,
      data: result.news,
      pagination: result.pagination,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    })
  }
})

// GET /api/news/drafts - Get draft news
router.get('/drafts', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10

    const result = await NewsService.getDraftNews({ page, limit })

    res.json({
      success: true,
      data: result.news,
      pagination: result.pagination,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    })
  }
})

// GET /api/news/latest - Get latest published news
router.get('/latest', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5
    const news = await NewsService.getLatestNews(limit)

    res.json({
      success: true,
      data: news,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    })
  }
})

// GET /api/news/stats - Get news statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await NewsService.getNewsStats()

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    })
  }
})

// GET /api/news/search - Search news
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string
    const publishedOnly = req.query.publishedOnly !== 'false' // Default to true
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10

    if (!query) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_QUERY',
          message: 'Search query is required'
        },
        timestamp: new Date().toISOString()
      })
    }

    const result = await NewsService.searchNews(query, {
      publishedOnly,
      page,
      limit
    })

    res.json({
      success: true,
      data: result.news,
      pagination: result.pagination,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    })
  }
})

// GET /api/news/slug/:slug - Get news by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const slug = req.params.slug

    const news = await NewsService.getNewsBySlug(slug)

    if (!news) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NEWS_NOT_FOUND',
          message: 'News article not found'
        },
        timestamp: new Date().toISOString()
      })
    }

    res.json({
      success: true,
      data: news,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    })
  }
})

// GET /api/news/:id - Get news by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'News ID must be a valid number'
        },
        timestamp: new Date().toISOString()
      })
    }

    const news = await NewsService.getNewsById(id)

    if (!news) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NEWS_NOT_FOUND',
          message: 'News article not found'
        },
        timestamp: new Date().toISOString()
      })
    }

    res.json({
      success: true,
      data: news,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    })
  }
})

// POST /api/news - Create new news article
router.post('/', async (req, res) => {
  try {
    const news = await NewsService.createNews(req.body)

    res.status(201).json({
      success: true,
      data: news,
      message: 'News article created successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Validation failed')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message
          },
          timestamp: new Date().toISOString()
        })
      }
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_SLUG',
            message: error.message
          },
          timestamp: new Date().toISOString()
        })
      }
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    })
  }
})

// PUT /api/news/:id - Update news article
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'News ID must be a valid number'
        },
        timestamp: new Date().toISOString()
      })
    }

    const news = await NewsService.updateNews(id, req.body)

    res.json({
      success: true,
      data: news,
      message: 'News article updated successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NEWS_NOT_FOUND',
            message: error.message
          },
          timestamp: new Date().toISOString()
        })
      }
      if (error.message.includes('Validation failed')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message
          },
          timestamp: new Date().toISOString()
        })
      }
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_SLUG',
            message: error.message
          },
          timestamp: new Date().toISOString()
        })
      }
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    })
  }
})

// PUT /api/news/:id/publish - Publish news article
router.put('/:id/publish', async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'News ID must be a valid number'
        },
        timestamp: new Date().toISOString()
      })
    }

    const news = await NewsService.publishNews(id)

    res.json({
      success: true,
      data: news,
      message: 'News article published successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NEWS_NOT_FOUND',
            message: error.message
          },
          timestamp: new Date().toISOString()
        })
      }
      if (error.message.includes('already published')) {
        return res.status(422).json({
          success: false,
          error: {
            code: 'ALREADY_PUBLISHED',
            message: error.message
          },
          timestamp: new Date().toISOString()
        })
      }
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    })
  }
})

// PUT /api/news/:id/unpublish - Unpublish news article
router.put('/:id/unpublish', async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'News ID must be a valid number'
        },
        timestamp: new Date().toISOString()
      })
    }

    const news = await NewsService.unpublishNews(id)

    res.json({
      success: true,
      data: news,
      message: 'News article unpublished successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NEWS_NOT_FOUND',
            message: error.message
          },
          timestamp: new Date().toISOString()
        })
      }
      if (error.message.includes('already a draft')) {
        return res.status(422).json({
          success: false,
          error: {
            code: 'NOT_PUBLISHED',
            message: error.message
          },
          timestamp: new Date().toISOString()
        })
      }
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    })
  }
})

// DELETE /api/news/:id - Delete news article
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'News ID must be a valid number'
        },
        timestamp: new Date().toISOString()
      })
    }

    await NewsService.deleteNews(id)

    res.status(204).send()
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NEWS_NOT_FOUND',
          message: error.message
        },
        timestamp: new Date().toISOString()
      })
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    })
  }
})

export default router