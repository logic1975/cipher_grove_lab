import { Newsletter, Prisma } from '@prisma/client'
import Joi from 'joi'
import validator from 'validator'
import { prisma } from '../config/database'

// Validation schemas for Newsletter
const subscribeSchema = Joi.object({
  email: Joi.string().email().max(255).required().trim()
})

const getSubscribersSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  isActive: Joi.boolean().optional(),
  search: Joi.string().max(255).optional().trim()
})

// Newsletter business rules and validation
export class NewsletterService {
  
  /**
   * Subscribe an email to the newsletter
   */
  static async subscribe(data: { email: string }): Promise<Newsletter> {
    // Validate input data
    const { error, value } = subscribeSchema.validate(data)
    if (error) {
      throw new Error(`Validation failed: ${error.details[0].message}`)
    }

    // Additional email validation and sanitization
    const sanitizedEmail = validator.normalizeEmail(value.email, {
      gmail_remove_dots: true,
      gmail_remove_subaddress: true,
      outlookdotcom_remove_subaddress: true,
      yahoo_remove_subaddress: true,
      icloud_remove_subaddress: true
    })
    if (!sanitizedEmail || !validator.isEmail(sanitizedEmail)) {
      throw new Error('Invalid email address format')
    }

    // Business rule: Check if email domain is acceptable
    if (this.isBlockedEmailDomain(sanitizedEmail)) {
      throw new Error('Email domain is not allowed for newsletter subscription')
    }

    try {
      // Check if already subscribed (including previously unsubscribed)
      const existingSubscriber = await prisma.newsletter.findUnique({
        where: { email: sanitizedEmail }
      })

      if (existingSubscriber) {
        if (existingSubscriber.isActive) {
          throw new Error('Email is already subscribed to the newsletter')
        } else {
          // Reactivate previous subscription
          const reactivatedSubscriber = await prisma.newsletter.update({
            where: { email: sanitizedEmail },
            data: {
              isActive: true,
              subscribedAt: new Date(),
              unsubscribedAt: null
            }
          })
          return reactivatedSubscriber
        }
      }

      // Create new subscription
      const subscriber = await prisma.newsletter.create({
        data: {
          email: sanitizedEmail,
          isActive: true
        }
      })

      return subscriber
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Email is already subscribed to the newsletter')
        }
      }
      
      // Re-throw business logic errors without masking them
      if (error instanceof Error && error.message.includes('already subscribed')) {
        throw error
      }
      
      console.error('Error subscribing to newsletter:', error)
      throw new Error('Failed to subscribe to newsletter')
    }
  }

  /**
   * Unsubscribe an email from the newsletter
   */
  static async unsubscribe(email: string): Promise<Newsletter> {
    const sanitizedEmail = validator.normalizeEmail(email, {
      gmail_remove_dots: true,
      gmail_remove_subaddress: true,
      outlookdotcom_remove_subaddress: true,
      yahoo_remove_subaddress: true,
      icloud_remove_subaddress: true
    })
    if (!sanitizedEmail || !validator.isEmail(sanitizedEmail)) {
      throw new Error('Invalid email address format')
    }

    try {
      const subscriber = await prisma.newsletter.update({
        where: { email: sanitizedEmail },
        data: {
          isActive: false,
          unsubscribedAt: new Date()
        }
      })

      return subscriber
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Email is not subscribed to the newsletter')
        }
      }
      
      console.error('Error unsubscribing from newsletter:', error)
      throw new Error('Failed to unsubscribe from newsletter')
    }
  }

  /**
   * Get newsletter subscribers with pagination and filtering
   */
  static async getSubscribers(options: {
    page?: number
    limit?: number
    isActive?: boolean
    search?: string
  } = {}): Promise<{
    subscribers: Newsletter[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }> {
    // Validate options
    const { error, value } = getSubscribersSchema.validate(options)
    if (error) {
      throw new Error(`Validation failed: ${error.details[0].message}`)
    }

    const { page = 1, limit = 10, isActive, search } = value

    // Build where clause
    const where: Prisma.NewsletterWhereInput = {}
    
    if (isActive !== undefined) {
      where.isActive = isActive
    }
    
    if (search) {
      where.email = { contains: search, mode: 'insensitive' }
    }

    try {
      const [subscribers, total] = await Promise.all([
        prisma.newsletter.findMany({
          where,
          orderBy: { subscribedAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.newsletter.count({ where })
      ])

      const totalPages = Math.ceil(total / limit)

      return {
        subscribers,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    } catch (error) {
      console.error('Error fetching newsletter subscribers:', error)
      throw new Error('Failed to fetch newsletter subscribers')
    }
  }

  /**
   * Get subscriber by email
   */
  static async getSubscriberByEmail(email: string): Promise<Newsletter | null> {
    const sanitizedEmail = validator.normalizeEmail(email, {
      gmail_remove_dots: true,
      gmail_remove_subaddress: true,
      outlookdotcom_remove_subaddress: true,
      yahoo_remove_subaddress: true,
      icloud_remove_subaddress: true
    })
    if (!sanitizedEmail || !validator.isEmail(sanitizedEmail)) {
      throw new Error('Invalid email address format')
    }

    try {
      const subscriber = await prisma.newsletter.findUnique({
        where: { email: sanitizedEmail }
      })

      return subscriber
    } catch (error) {
      console.error('Error fetching subscriber by email:', error)
      throw new Error('Failed to fetch subscriber')
    }
  }

  /**
   * Get active subscribers for email campaigns
   */
  static async getActiveSubscribers(): Promise<Newsletter[]> {
    try {
      const subscribers = await prisma.newsletter.findMany({
        where: { isActive: true },
        orderBy: { subscribedAt: 'desc' }
      })

      return subscribers
    } catch (error) {
      console.error('Error fetching active subscribers:', error)
      throw new Error('Failed to fetch active subscribers')
    }
  }

  /**
   * Get newsletter statistics
   */
  static async getNewsletterStats(): Promise<{
    totalSubscribers: number
    activeSubscribers: number
    unsubscribedCount: number
    subscriptionsThisWeek: number
    subscriptionsThisMonth: number
    unsubscriptionsThisWeek: number
    unsubscriptionsThisMonth: number
    growthRate: number
  }> {
    try {
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

      const [
        totalSubscribers,
        activeSubscribers,
        unsubscribedCount,
        subscriptionsThisWeek,
        subscriptionsThisMonth,
        subscriptionsLastMonth,
        unsubscriptionsThisWeek,
        unsubscriptionsThisMonth
      ] = await Promise.all([
        prisma.newsletter.count(),
        prisma.newsletter.count({ where: { isActive: true } }),
        prisma.newsletter.count({ where: { isActive: false } }),
        prisma.newsletter.count({ 
          where: { 
            subscribedAt: { gte: oneWeekAgo },
            isActive: true 
          } 
        }),
        prisma.newsletter.count({ 
          where: { 
            subscribedAt: { gte: oneMonthAgo },
            isActive: true 
          } 
        }),
        prisma.newsletter.count({ 
          where: { 
            subscribedAt: { 
              gte: twoMonthsAgo,
              lt: oneMonthAgo 
            },
            isActive: true 
          } 
        }),
        prisma.newsletter.count({ 
          where: { 
            unsubscribedAt: { gte: oneWeekAgo } 
          } 
        }),
        prisma.newsletter.count({ 
          where: { 
            unsubscribedAt: { gte: oneMonthAgo } 
          } 
        })
      ])

      // Calculate growth rate (month over month)
      const growthRate = subscriptionsLastMonth > 0 
        ? ((subscriptionsThisMonth - subscriptionsLastMonth) / subscriptionsLastMonth) * 100
        : subscriptionsThisMonth > 0 ? 100 : 0

      return {
        totalSubscribers,
        activeSubscribers,
        unsubscribedCount,
        subscriptionsThisWeek,
        subscriptionsThisMonth,
        unsubscriptionsThisWeek,
        unsubscriptionsThisMonth,
        growthRate: Math.round(growthRate * 100) / 100 // Round to 2 decimal places
      }
    } catch (error) {
      console.error('Error fetching newsletter stats:', error)
      throw new Error('Failed to fetch newsletter statistics')
    }
  }

  /**
   * Delete subscriber (admin functionality - GDPR compliance)
   */
  static async deleteSubscriber(email: string): Promise<void> {
    const sanitizedEmail = validator.normalizeEmail(email, {
      gmail_remove_dots: true,
      gmail_remove_subaddress: true,
      outlookdotcom_remove_subaddress: true,
      yahoo_remove_subaddress: true,
      icloud_remove_subaddress: true
    })
    if (!sanitizedEmail || !validator.isEmail(sanitizedEmail)) {
      throw new Error('Invalid email address format')
    }

    try {
      await prisma.newsletter.delete({
        where: { email: sanitizedEmail }
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Subscriber not found')
        }
      }
      
      console.error('Error deleting subscriber:', error)
      throw new Error('Failed to delete subscriber')
    }
  }

  /**
   * Check if email domain is blocked
   * @private
   */
  private static isBlockedEmailDomain(email: string): boolean {
    const blockedDomains = [
      '10minutemail.com',
      'guerrillamail.com',
      'mailinator.com',
      'tempmail.org',
      'trashmail.com',
      // Add more temporary email domains as needed
    ]

    const domain = email.split('@')[1]?.toLowerCase()
    return blockedDomains.includes(domain)
  }

  /**
   * Business rule: Check if email has recent subscription attempts
   */
  static async checkRecentSubscriptionAttempts(email: string, hours: number = 1): Promise<boolean> {
    const sanitizedEmail = validator.normalizeEmail(email, {
      gmail_remove_dots: true,
      gmail_remove_subaddress: true,
      outlookdotcom_remove_subaddress: true,
      yahoo_remove_subaddress: true,
      icloud_remove_subaddress: true
    })
    if (!sanitizedEmail) {
      return false
    }

    // When hours is 0, we want to check if the subscription exists at all (just happened)
    // Add a small buffer (1 second) to account for timing differences
    const bufferMs = hours === 0 ? 1000 : 0
    const timeThreshold = new Date(Date.now() - (hours * 60 * 60 * 1000) - bufferMs)

    try {
      const subscriber = await prisma.newsletter.findUnique({
        where: { email: sanitizedEmail }
      })

      if (!subscriber) {
        return false
      }

      // Check if there was a recent subscription attempt
      // Only block if subscriber is currently active (to allow reactivation)
      return subscriber.isActive && subscriber.subscribedAt >= timeThreshold
    } catch (error) {
      console.error('Error checking recent subscription attempts:', error)
      return false
    }
  }

  /**
   * Validate email for subscription eligibility
   */
  static async validateSubscriptionEligibility(email: string): Promise<{
    eligible: boolean
    reason?: string
  }> {
    const sanitizedEmail = validator.normalizeEmail(email, {
      gmail_remove_dots: true,
      gmail_remove_subaddress: true,
      outlookdotcom_remove_subaddress: true,
      yahoo_remove_subaddress: true,
      icloud_remove_subaddress: true
    })
    if (!sanitizedEmail || !validator.isEmail(sanitizedEmail)) {
      return { eligible: false, reason: 'Invalid email format' }
    }

    if (this.isBlockedEmailDomain(sanitizedEmail)) {
      return { eligible: false, reason: 'Email domain not allowed' }
    }

    try {
      const existingSubscriber = await prisma.newsletter.findUnique({
        where: { email: sanitizedEmail }
      })

      if (existingSubscriber && existingSubscriber.isActive) {
        return { eligible: false, reason: 'Already subscribed' }
      }

      return { eligible: true }
    } catch (error) {
      console.error('Error validating subscription eligibility:', error)
      return { eligible: false, reason: 'Validation failed' }
    }
  }
}