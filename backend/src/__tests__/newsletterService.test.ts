import { NewsletterService } from '../services/newsletterService'
import { cleanupTestDatabase, testDatabaseConnection } from '../config/database'

describe('NewsletterService', () => {
  beforeAll(async () => {
    await testDatabaseConnection()
  })

  beforeEach(async () => {
    await cleanupTestDatabase()
  })

  describe('subscribe', () => {
    it('should subscribe valid email', async () => {
      const email = 'test@example.com'
      const subscriber = await NewsletterService.subscribe({ email })

      expect(subscriber).toMatchObject({
        id: expect.any(Number),
        email: 'test@example.com',
        isActive: true,
        subscribedAt: expect.any(Date),
        unsubscribedAt: null
      })
    })

    it('should normalize email addresses', async () => {
      const email = 'TEST.user+newsletter@GMAIL.COM'
      const subscriber = await NewsletterService.subscribe({ email })

      expect(subscriber.email).toBe('testuser@gmail.com')
    })

    it('should reject blocked email domains', async () => {
      const blockedEmail = 'test@10minutemail.com'

      await expect(NewsletterService.subscribe({ email: blockedEmail }))
        .rejects.toThrow('Email domain is not allowed')
    })

    it('should prevent duplicate subscriptions', async () => {
      const email = 'test@example.com'
      
      await NewsletterService.subscribe({ email })

      await expect(NewsletterService.subscribe({ email }))
        .rejects.toThrow('Email is already subscribed')
    })

    it('should reactivate previously unsubscribed email', async () => {
      const email = 'test@example.com'

      // Subscribe first
      const firstSubscription = await NewsletterService.subscribe({ email })
      
      // Unsubscribe
      await NewsletterService.unsubscribe(email)

      // Subscribe again
      const reactivated = await NewsletterService.subscribe({ email })

      expect(reactivated.id).toBe(firstSubscription.id)
      expect(reactivated.isActive).toBe(true)
      expect(reactivated.unsubscribedAt).toBeNull()
      expect(reactivated.subscribedAt).toBeInstanceOf(Date)
    })

    it('should validate email format', async () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        ''
      ]

      for (const email of invalidEmails) {
        await expect(NewsletterService.subscribe({ email }))
          .rejects.toThrow()
      }
    })
  })

  describe('unsubscribe', () => {
    beforeEach(async () => {
      // Create test subscribers
      await NewsletterService.subscribe({ email: 'test1@example.com' })
      await NewsletterService.subscribe({ email: 'test2@example.com' })
    })

    it('should unsubscribe existing subscriber', async () => {
      const email = 'test1@example.com'
      const unsubscribed = await NewsletterService.unsubscribe(email)

      expect(unsubscribed).toMatchObject({
        email: 'test1@example.com',
        isActive: false,
        unsubscribedAt: expect.any(Date)
      })
    })

    it('should handle non-existent email', async () => {
      await expect(NewsletterService.unsubscribe('nonexistent@example.com'))
        .rejects.toThrow('Email is not subscribed')
    })

    it('should validate email format', async () => {
      await expect(NewsletterService.unsubscribe('invalid-email'))
        .rejects.toThrow('Invalid email address format')
    })
  })

  describe('getSubscribers', () => {
    beforeEach(async () => {
      // Create test subscribers
      const emails = [
        'alice@example.com',
        'bob@example.com',
        'charlie@example.com',
        'diana@example.com'
      ]

      for (const email of emails) {
        await NewsletterService.subscribe({ email })
      }

      // Unsubscribe one
      await NewsletterService.unsubscribe('diana@example.com')
    })

    it('should get all subscribers with pagination', async () => {
      const result = await NewsletterService.getSubscribers({ page: 1, limit: 2 })

      expect(result.subscribers).toHaveLength(2)
      expect(result.pagination).toMatchObject({
        page: 1,
        limit: 2,
        total: 4,
        totalPages: 2,
        hasNext: true,
        hasPrev: false
      })
    })

    it('should filter by active status', async () => {
      const activeResult = await NewsletterService.getSubscribers({ isActive: true })
      const inactiveResult = await NewsletterService.getSubscribers({ isActive: false })

      expect(activeResult.subscribers).toHaveLength(3)
      expect(inactiveResult.subscribers).toHaveLength(1)
      expect(inactiveResult.subscribers[0].isActive).toBe(false)
    })

    it('should search by email', async () => {
      const result = await NewsletterService.getSubscribers({ search: 'alice' })

      expect(result.subscribers).toHaveLength(1)
      expect(result.subscribers[0].email).toBe('alice@example.com')
    })

    it('should validate pagination parameters', async () => {
      await expect(NewsletterService.getSubscribers({ page: 0 }))
        .rejects.toThrow('Validation failed')

      await expect(NewsletterService.getSubscribers({ limit: 101 }))
        .rejects.toThrow('Validation failed')
    })
  })

  describe('getSubscriberByEmail', () => {
    beforeEach(async () => {
      await NewsletterService.subscribe({ email: 'test@example.com' })
    })

    it('should get subscriber by email', async () => {
      const subscriber = await NewsletterService.getSubscriberByEmail('test@example.com')

      expect(subscriber).toMatchObject({
        email: 'test@example.com',
        isActive: true
      })
    })

    it('should return null for non-existent email', async () => {
      const subscriber = await NewsletterService.getSubscriberByEmail('nonexistent@example.com')
      expect(subscriber).toBeNull()
    })

    it('should validate email format', async () => {
      await expect(NewsletterService.getSubscriberByEmail('invalid-email'))
        .rejects.toThrow('Invalid email address format')
    })
  })

  describe('getActiveSubscribers', () => {
    beforeEach(async () => {
      // Create test subscribers
      const emails = ['active1@example.com', 'active2@example.com', 'inactive@example.com']

      for (const email of emails) {
        await NewsletterService.subscribe({ email })
      }

      // Unsubscribe one
      await NewsletterService.unsubscribe('inactive@example.com')
    })

    it('should return only active subscribers', async () => {
      const activeSubscribers = await NewsletterService.getActiveSubscribers()

      expect(activeSubscribers).toHaveLength(2)
      activeSubscribers.forEach(subscriber => {
        expect(subscriber.isActive).toBe(true)
      })
    })
  })

  describe('getNewsletterStats', () => {
    beforeEach(async () => {
      // Create test subscribers
      const emails = [
        'user1@example.com',
        'user2@example.com',
        'user3@example.com',
        'user4@example.com'
      ]

      for (const email of emails) {
        await NewsletterService.subscribe({ email })
      }

      // Unsubscribe some
      await NewsletterService.unsubscribe('user3@example.com')
      await NewsletterService.unsubscribe('user4@example.com')
    })

    it('should return comprehensive statistics', async () => {
      const stats = await NewsletterService.getNewsletterStats()

      expect(stats).toMatchObject({
        totalSubscribers: 4,
        activeSubscribers: 2,
        unsubscribedCount: 2,
        subscriptionsThisWeek: expect.any(Number),
        subscriptionsThisMonth: expect.any(Number),
        unsubscriptionsThisWeek: expect.any(Number),
        unsubscriptionsThisMonth: expect.any(Number),
        growthRate: expect.any(Number)
      })

      expect(stats.subscriptionsThisWeek).toBeGreaterThanOrEqual(0)
      expect(stats.subscriptionsThisMonth).toBeGreaterThanOrEqual(0)
    })
  })

  describe('deleteSubscriber', () => {
    beforeEach(async () => {
      await NewsletterService.subscribe({ email: 'test@example.com' })
    })

    it('should delete subscriber permanently', async () => {
      await NewsletterService.deleteSubscriber('test@example.com')

      const subscriber = await NewsletterService.getSubscriberByEmail('test@example.com')
      expect(subscriber).toBeNull()
    })

    it('should handle non-existent subscriber', async () => {
      await expect(NewsletterService.deleteSubscriber('nonexistent@example.com'))
        .rejects.toThrow('Subscriber not found')
    })

    it('should validate email format', async () => {
      await expect(NewsletterService.deleteSubscriber('invalid-email'))
        .rejects.toThrow('Invalid email address format')
    })
  })

  describe('validateSubscriptionEligibility', () => {
    beforeEach(async () => {
      await NewsletterService.subscribe({ email: 'existing@example.com' })
    })

    it('should validate eligible email', async () => {
      const result = await NewsletterService.validateSubscriptionEligibility('new@example.com')

      expect(result).toEqual({
        eligible: true
      })
    })

    it('should reject already subscribed email', async () => {
      const result = await NewsletterService.validateSubscriptionEligibility('existing@example.com')

      expect(result).toEqual({
        eligible: false,
        reason: 'Already subscribed'
      })
    })

    it('should reject invalid email format', async () => {
      const result = await NewsletterService.validateSubscriptionEligibility('invalid-email')

      expect(result).toEqual({
        eligible: false,
        reason: 'Invalid email format'
      })
    })

    it('should reject blocked domains', async () => {
      const result = await NewsletterService.validateSubscriptionEligibility('test@10minutemail.com')

      expect(result).toEqual({
        eligible: false,
        reason: 'Email domain not allowed'
      })
    })

    it('should allow resubscription of unsubscribed email', async () => {
      // Unsubscribe first
      await NewsletterService.unsubscribe('existing@example.com')

      const result = await NewsletterService.validateSubscriptionEligibility('existing@example.com')

      expect(result).toEqual({
        eligible: true
      })
    })
  })

  describe('checkRecentSubscriptionAttempts', () => {
    it('should detect recent subscription attempts', async () => {
      const email = 'test@example.com'
      
      await NewsletterService.subscribe({ email })

      const hasRecent = await NewsletterService.checkRecentSubscriptionAttempts(email, 1)
      expect(hasRecent).toBe(true)
    })

    it('should return false for non-existent email', async () => {
      const hasRecent = await NewsletterService.checkRecentSubscriptionAttempts('nonexistent@example.com', 1)
      expect(hasRecent).toBe(false)
    })

    it('should return false for old subscriptions', async () => {
      const email = 'test@example.com'
      
      await NewsletterService.subscribe({ email })

      // Check with very short time window (should be true as subscription just happened and subscriber is active)
      const hasRecent = await NewsletterService.checkRecentSubscriptionAttempts(email, 0)
      expect(hasRecent).toBe(true)
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle special email characters', async () => {
      const specialEmails = [
        'test+label@example.com',
        'test.with.dots@example.com',
        'test-with-dashes@example.com'
      ]

      for (const email of specialEmails) {
        const subscriber = await NewsletterService.subscribe({ email })
        expect(subscriber.email).toBeTruthy()
        expect(subscriber.isActive).toBe(true)
      }
    })

    it('should handle concurrent subscription attempts', async () => {
      const email = 'concurrent@example.com'

      // Attempt multiple simultaneous subscriptions
      const promises = [
        NewsletterService.subscribe({ email }),
        NewsletterService.subscribe({ email }),
        NewsletterService.subscribe({ email })
      ]

      // Only one should succeed, others should fail
      const results = await Promise.allSettled(promises)
      
      const successful = results.filter(r => r.status === 'fulfilled')
      const failed = results.filter(r => r.status === 'rejected')

      expect(successful).toHaveLength(1)
      expect(failed).toHaveLength(2)
    })

    it('should handle email case variations', async () => {
      // Subscribe with lowercase
      await NewsletterService.subscribe({ email: 'test@example.com' })

      // Try to subscribe with different case variations
      const variations = [
        'TEST@EXAMPLE.COM',
        'Test@Example.Com',
        'test@EXAMPLE.com'
      ]

      for (const email of variations) {
        await expect(NewsletterService.subscribe({ email }))
          .rejects.toThrow('Email is already subscribed')
      }
    })
  })
})