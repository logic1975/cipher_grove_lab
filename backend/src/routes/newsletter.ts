import { Router } from 'express'
import { NewsletterService } from '../services/newsletterService'
import { createValidationMiddleware, newsletterSchemas } from '../middleware/validationMiddleware'
import { asyncHandler } from '../middleware/errorHandlingMiddleware'
import { newsletterRateLimit, apiRateLimit } from '../middleware/rateLimitingMiddleware'

const router = Router()

// POST /api/newsletter/subscribe - Subscribe to newsletter
router.post('/subscribe', 
  newsletterRateLimit, // 3 requests per 10 minutes
  createValidationMiddleware(newsletterSchemas.subscribe),
  asyncHandler(async (req, res) => {
    const { email } = req.body

    // Check subscription eligibility first
    const eligibility = await NewsletterService.validateSubscriptionEligibility(email)
    if (!eligibility.eligible) {
      const statusCode = eligibility.reason === 'Already subscribed' ? 409 : 400
      return res.status(statusCode).json({
        success: false,
        error: {
          code: eligibility.reason === 'Already subscribed' ? 'ALREADY_SUBSCRIBED' : 'SUBSCRIPTION_INVALID',
          message: eligibility.reason || 'Subscription not allowed'
        },
        timestamp: new Date().toISOString()
      })
    }

    // Additional business rule check: Prevent rapid subscription attempts
    const hasRecentAttempts = await NewsletterService.checkRecentSubscriptionAttempts(email, 1)
    if (hasRecentAttempts) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RECENT_SUBSCRIPTION_ATTEMPT',
          message: 'Recent subscription attempt detected. Please wait before trying again.'
        },
        timestamp: new Date().toISOString()
      })
    }

    const subscriber = await NewsletterService.subscribe({ email })

    res.status(201).json({
      success: true,
      data: {
        email: subscriber.email,
        subscribedAt: subscriber.subscribedAt,
        isActive: subscriber.isActive
      },
      message: 'Successfully subscribed to newsletter',
      timestamp: new Date().toISOString()
    })
  })
)

// POST /api/newsletter/unsubscribe - Unsubscribe from newsletter
router.post('/unsubscribe', 
  apiRateLimit, // Use general rate limit for unsubscribe (less restrictive)
  createValidationMiddleware(newsletterSchemas.unsubscribe),
  asyncHandler(async (req, res) => {
    const { email } = req.body

    // Check if subscriber exists first
    const existingSubscriber = await NewsletterService.getSubscriberByEmail(email)
    if (!existingSubscriber) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'EMAIL_NOT_SUBSCRIBED',
          message: 'Email is not subscribed to newsletter'
        },
        timestamp: new Date().toISOString()
      })
    }

    const subscriber = await NewsletterService.unsubscribe(email)

    res.json({
      success: true,
      data: {
        email: subscriber.email,
        unsubscribedAt: subscriber.unsubscribedAt,
        isActive: subscriber.isActive
      },
      message: 'Successfully unsubscribed from newsletter',
      timestamp: new Date().toISOString()
    })
  })
)

// GET /api/newsletter/subscribers - Get all subscribers (admin only)
router.get('/subscribers', 
  apiRateLimit,
  createValidationMiddleware(newsletterSchemas.list),
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const isActive = req.query.isActive === 'true' ? true : 
                     req.query.isActive === 'false' ? false : undefined
    const search = req.query.search as string

    const result = await NewsletterService.getSubscribers({
      page,
      limit,
      isActive,
      search
    })

    res.json({
      success: true,
      data: result.subscribers,
      pagination: result.pagination,
      timestamp: new Date().toISOString()
    })
  })
)

// GET /api/newsletter/stats - Get newsletter statistics (admin only)
router.get('/stats', 
  apiRateLimit,
  asyncHandler(async (req, res) => {
    const stats = await NewsletterService.getNewsletterStats()

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    })
  })
)

// GET /api/newsletter/active - Get active subscribers for email campaigns (admin only)
router.get('/active', 
  apiRateLimit,
  asyncHandler(async (req, res) => {
    const activeSubscribers = await NewsletterService.getActiveSubscribers()

    res.json({
      success: true,
      data: activeSubscribers,
      count: activeSubscribers.length,
      timestamp: new Date().toISOString()
    })
  })
)

// GET /api/newsletter/subscriber/:email - Get subscriber by email (admin only)
router.get('/subscriber/:email', 
  apiRateLimit,
  createValidationMiddleware(newsletterSchemas.getByEmail),
  asyncHandler(async (req, res) => {
    const email = req.params.email
    const subscriber = await NewsletterService.getSubscriberByEmail(email)

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SUBSCRIBER_NOT_FOUND',
          message: 'Subscriber not found'
        },
        timestamp: new Date().toISOString()
      })
    }

    res.json({
      success: true,
      data: subscriber,
      timestamp: new Date().toISOString()
    })
  })
)

// DELETE /api/newsletter/subscriber/:email - Delete subscriber (admin only - GDPR compliance)
router.delete('/subscriber/:email', 
  apiRateLimit,
  createValidationMiddleware(newsletterSchemas.getByEmail),
  asyncHandler(async (req, res) => {
    const email = req.params.email
    
    // Check if subscriber exists first
    const existingSubscriber = await NewsletterService.getSubscriberByEmail(email)
    if (!existingSubscriber) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SUBSCRIBER_NOT_FOUND',
          message: 'Subscriber not found'
        },
        timestamp: new Date().toISOString()
      })
    }
    
    await NewsletterService.deleteSubscriber(email)

    res.json({
      success: true,
      message: 'Subscriber deleted successfully',
      timestamp: new Date().toISOString()
    })
  })
)

// GET /api/newsletter/check/:email - Check subscription status (public endpoint)
router.get('/check/:email', 
  apiRateLimit,
  createValidationMiddleware(newsletterSchemas.getByEmail),
  asyncHandler(async (req, res) => {
    const email = req.params.email
    const eligibility = await NewsletterService.validateSubscriptionEligibility(email)

    res.json({
      success: true,
      data: {
        email,
        eligible: eligibility.eligible,
        reason: eligibility.reason
      },
      timestamp: new Date().toISOString()
    })
  })
)

export default router