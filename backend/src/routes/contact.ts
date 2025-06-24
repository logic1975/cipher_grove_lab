import { Router } from 'express'
import { ContactService } from '../services/contactService'
import { createValidationMiddleware, contactSchemas } from '../middleware/validationMiddleware'
import { asyncHandler } from '../middleware/errorHandlingMiddleware'
import { contactRateLimit, apiRateLimit } from '../middleware/rateLimitingMiddleware'

const router = Router()

// POST /api/contact - Submit a new contact form
router.post('/', 
  contactRateLimit, // 5 requests per 15 minutes
  createValidationMiddleware(contactSchemas.create),
  asyncHandler(async (req, res) => {
    const { name, email, subject, message, type } = req.body

    // Additional business rule check: Prevent spam submissions
    const hasRecentSubmissions = await ContactService.checkRecentSubmissions(email, 24)
    if (hasRecentSubmissions) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'TOO_MANY_SUBMISSIONS',
          message: 'You have submitted too many contact forms recently. Please wait before submitting again.'
        },
        timestamp: new Date().toISOString()
      })
    }

    const contact = await ContactService.createContact({
      name,
      email,
      subject,
      message,
      type
    })

    res.status(201).json({
      success: true,
      data: {
        id: contact.id,
        type: contact.type,
        createdAt: contact.createdAt
      },
      message: 'Contact form submitted successfully',
      timestamp: new Date().toISOString()
    })
  })
)

// GET /api/contact - Get all contacts (admin only)
router.get('/', 
  apiRateLimit,
  createValidationMiddleware(contactSchemas.list),
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const type = req.query.type as any
    const processed = req.query.processed === 'true' ? true : 
                     req.query.processed === 'false' ? false : undefined
    const search = req.query.search as string

    const result = await ContactService.getContacts({
      page,
      limit,
      type,
      processed,
      search
    })

    res.json({
      success: true,
      data: result.contacts,
      pagination: result.pagination,
      timestamp: new Date().toISOString()
    })
  })
)

// GET /api/contact/stats - Get contact statistics (admin only)
router.get('/stats', 
  apiRateLimit,
  asyncHandler(async (req, res) => {
    const stats = await ContactService.getContactStats()

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    })
  })
)

// GET /api/contact/unprocessed - Get recent unprocessed contacts (admin only)
router.get('/unprocessed', 
  apiRateLimit,
  createValidationMiddleware(contactSchemas.unprocessed),
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 5

    const contacts = await ContactService.getUnprocessedContacts(limit)

    res.json({
      success: true,
      data: contacts,
      timestamp: new Date().toISOString()
    })
  })
)

// GET /api/contact/:id - Get contact by ID (admin only)
router.get('/:id', 
  apiRateLimit,
  createValidationMiddleware(contactSchemas.getById),
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id)
    const contact = await ContactService.getContactById(id)

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONTACT_NOT_FOUND',
          message: 'Contact not found'
        },
        timestamp: new Date().toISOString()
      })
    }

    res.json({
      success: true,
      data: contact,
      timestamp: new Date().toISOString()
    })
  })
)

// PUT /api/contact/:id - Update contact (admin only - mark as processed)
router.put('/:id', 
  apiRateLimit,
  createValidationMiddleware(contactSchemas.update),
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id)
    const { processed } = req.body

    try {
      const contact = await ContactService.updateContact(id, { processed })

      res.json({
        success: true,
        data: contact,
        message: `Contact marked as ${processed ? 'processed' : 'unprocessed'}`,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      if (error instanceof Error && error.message === 'Contact not found') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CONTACT_NOT_FOUND',
            message: 'Contact not found'
          },
          timestamp: new Date().toISOString()
        })
      }
      throw error
    }
  })
)

// DELETE /api/contact/:id - Delete contact (admin only)
router.delete('/:id', 
  apiRateLimit,
  createValidationMiddleware(contactSchemas.getById),
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id)
    
    try {
      await ContactService.deleteContact(id)

      res.json({
        success: true,
        message: 'Contact deleted successfully',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      if (error instanceof Error && error.message === 'Contact not found') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CONTACT_NOT_FOUND',
            message: 'Contact not found'
          },
          timestamp: new Date().toISOString()
        })
      }
      throw error
    }
  })
)

export default router