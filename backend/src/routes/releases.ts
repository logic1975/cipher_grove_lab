import express, { Request, Response } from 'express'
import { ReleaseService } from '../services/releaseService'

const router = express.Router()

// GET /api/releases - Get all releases with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const artistId = req.query.artistId ? parseInt(req.query.artistId as string) : undefined
    const type = req.query.type as 'album' | 'single' | 'ep' | undefined
    const releaseDate = req.query.releaseDate as string
    const sort = req.query.sort as 'newest' | 'oldest' | 'title' | undefined
    const includeArtist = req.query.includeArtist !== 'false' // Default to true

    const result = await ReleaseService.getReleases({
      page,
      limit,
      artistId,
      type,
      releaseDate,
      sort,
      includeArtist
    })

    res.json({
      success: true,
      data: result.releases,
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

// GET /api/releases/latest - Get latest releases
router.get('/latest', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5
    const releases = await ReleaseService.getLatestReleases(limit)

    res.json({
      success: true,
      data: releases,
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

// GET /api/releases/stats - Get release statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await ReleaseService.getReleaseStats()

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

// GET /api/releases/type/:type - Get releases by type
router.get('/type/:type', async (req, res) => {
  try {
    const type = req.params.type as 'album' | 'single' | 'ep'
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10

    if (!['album', 'single', 'ep'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TYPE',
          message: 'Release type must be album, single, or ep'
        },
        timestamp: new Date().toISOString()
      })
    }

    const result = await ReleaseService.getReleasesByType(type, { page, limit })

    res.json({
      success: true,
      data: result.releases,
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

// GET /api/releases/:id - Get release by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const includeArtist = req.query.includeArtist !== 'false' // Default to true

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Release ID must be a valid number'
        },
        timestamp: new Date().toISOString()
      })
    }

    const release = await ReleaseService.getReleaseById(id, includeArtist)

    if (!release) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RELEASE_NOT_FOUND',
          message: 'Release not found'
        },
        timestamp: new Date().toISOString()
      })
    }

    res.json({
      success: true,
      data: release,
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

// POST /api/releases - Create new release
router.post('/', async (req, res) => {
  try {
    const release = await ReleaseService.createRelease(req.body)

    res.status(201).json({
      success: true,
      data: release,
      message: 'Release created successfully',
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
      if (error.message.includes('Artist not found')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ARTIST_NOT_FOUND',
            message: error.message
          },
          timestamp: new Date().toISOString()
        })
      }
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_RELEASE',
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

// PUT /api/releases/:id - Update release
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Release ID must be a valid number'
        },
        timestamp: new Date().toISOString()
      })
    }

    const release = await ReleaseService.updateRelease(id, req.body)

    res.json({
      success: true,
      data: release,
      message: 'Release updated successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'RELEASE_NOT_FOUND',
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
            code: 'DUPLICATE_RELEASE',
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

// DELETE /api/releases/:id - Delete release
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Release ID must be a valid number'
        },
        timestamp: new Date().toISOString()
      })
    }

    await ReleaseService.deleteRelease(id)

    res.status(204).send()
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RELEASE_NOT_FOUND',
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