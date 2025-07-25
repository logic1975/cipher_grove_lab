import { Router } from 'express'
import { ArtistService } from '../services/artistService'
import { ImageProcessingService } from '../services/imageProcessingService'
import { singleImageUpload, handleMulterError } from '../middleware/multerConfig'
import { createValidationMiddleware, artistSchemas } from '../middleware/validationMiddleware'
import { asyncHandler } from '../middleware/errorHandlingMiddleware'
import { apiRateLimit, uploadRateLimit } from '../middleware/rateLimitingMiddleware'

const router = Router()

// GET /api/artists - Get all artists with pagination and filtering
router.get('/', 
  apiRateLimit,
  createValidationMiddleware(artistSchemas.list),
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const featured = req.query.featured === 'true' ? true : undefined
    const search = req.query.search as string
    const includeReleases = req.query.includeReleases === 'true'

    const result = await ArtistService.getArtists({
      page,
      limit,
      featured,
      search,
      includeReleases
    })

    res.json({
      success: true,
      data: result.artists,
      pagination: result.pagination,
      timestamp: new Date().toISOString()
    })
  })
)

// GET /api/artists/featured - Get featured artists
router.get('/featured', 
  apiRateLimit,
  asyncHandler(async (req, res) => {
    const artists = await ArtistService.getFeaturedArtists()

    res.json({
      success: true,
      data: artists,
      timestamp: new Date().toISOString()
    })
  })
)

// GET /api/artists/:id - Get artist by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const includeReleases = req.query.includeReleases === 'true'

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Artist ID must be a valid number'
        },
        timestamp: new Date().toISOString()
      })
    }

    const artist = await ArtistService.getArtistById(id, includeReleases)

    if (!artist) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ARTIST_NOT_FOUND',
          message: 'Artist not found'
        },
        timestamp: new Date().toISOString()
      })
    }

    res.json({
      success: true,
      data: artist,
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

// POST /api/artists - Create new artist
router.post('/', async (req, res) => {
  try {
    const artist = await ArtistService.createArtist(req.body)

    res.status(201).json({
      success: true,
      data: artist,
      message: 'Artist created successfully',
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
            code: 'DUPLICATE_ARTIST',
            message: error.message
          },
          timestamp: new Date().toISOString()
        })
      }
      if (error.message.includes('Maximum of 6 featured artists')) {
        return res.status(422).json({
          success: false,
          error: {
            code: 'FEATURED_LIMIT_EXCEEDED',
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

// PUT /api/artists/:id - Update artist
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Artist ID must be a valid number'
        },
        timestamp: new Date().toISOString()
      })
    }

    const artist = await ArtistService.updateArtist(id, req.body)

    res.json({
      success: true,
      data: artist,
      message: 'Artist updated successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'ARTIST_NOT_FOUND',
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
            code: 'DUPLICATE_ARTIST',
            message: error.message
          },
          timestamp: new Date().toISOString()
        })
      }
      if (error.message.includes('Maximum of 6 featured artists')) {
        return res.status(422).json({
          success: false,
          error: {
            code: 'FEATURED_LIMIT_EXCEEDED',
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

// DELETE /api/artists/:id - Delete artist
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Artist ID must be a valid number'
        },
        timestamp: new Date().toISOString()
      })
    }

    await ArtistService.deleteArtist(id)

    res.status(204).send()
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ARTIST_NOT_FOUND',
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

// POST /api/artists/:id/image - Upload artist image
router.post('/:id/image', 
  uploadRateLimit,
  createValidationMiddleware(artistSchemas.getById),
  singleImageUpload, 
  handleMulterError, 
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Artist ID must be a valid number'
        },
        timestamp: new Date().toISOString()
      })
    }

    // Check if artist exists
    const existingArtist = await ArtistService.getArtistById(id)
    if (!existingArtist) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ARTIST_NOT_FOUND',
          message: 'Artist not found'
        },
        timestamp: new Date().toISOString()
      })
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE_UPLOADED',
          message: 'No image file was uploaded'
        },
        timestamp: new Date().toISOString()
      })
    }

    // Get alt text from request body or generate default
    const altText = req.body.altText || `${existingArtist.name} profile photo`

    // Process the image
    const imageData = await ImageProcessingService.processArtistImage(
      req.file,
      id,
      altText
    )

    // Update artist with new image data
    const updatedArtist = await ArtistService.updateArtist(id, imageData)

    res.json({
      success: true,
      data: updatedArtist,
      message: 'Artist image uploaded successfully',
      timestamp: new Date().toISOString()
    })
  })
)

export default router