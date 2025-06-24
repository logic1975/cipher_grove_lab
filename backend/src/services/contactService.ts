import { Contact, ContactType, Prisma } from '@prisma/client'
import Joi from 'joi'
import validator from 'validator'
import { prisma } from '../config/database'

// Validation schemas for Contact
const createContactSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().trim(),
  email: Joi.string().email().max(255).required().trim(),
  subject: Joi.string().min(5).max(200).required().trim(),
  message: Joi.string().min(10).max(2000).required().trim(),
  type: Joi.string().valid('demo', 'business', 'general', 'press').required()
})

const getContactsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  type: Joi.string().valid('demo', 'business', 'general', 'press').optional(),
  processed: Joi.boolean().optional(),
  search: Joi.string().max(255).optional().trim()
})

const updateContactSchema = Joi.object({
  processed: Joi.boolean().required()
})

// Contact business rules and validation
export class ContactService {
  
  /**
   * Create a new contact submission with validation and sanitization
   */
  static async createContact(data: {
    name: string
    email: string
    subject: string
    message: string
    type: ContactType
  }): Promise<Contact> {
    // Validate input data
    const { error, value } = createContactSchema.validate(data)
    if (error) {
      throw new Error(`Validation failed: ${error.details[0].message}`)
    }

    // Additional email validation and sanitization with comprehensive normalization
    const sanitizedEmail = validator.normalizeEmail(value.email, {
      gmail_remove_dots: true,
      gmail_remove_subaddress: true,
      outlookdotcom_remove_subaddress: true,
      yahoo_remove_subaddress: true,
      icloud_remove_subaddress: true,
      all_lowercase: true
    })
    if (!sanitizedEmail || !validator.isEmail(sanitizedEmail)) {
      throw new Error('Invalid email address format')
    }

    // Sanitize text inputs to prevent XSS
    const sanitizedData = {
      name: validator.escape(value.name),
      email: sanitizedEmail,
      subject: validator.escape(value.subject),
      message: validator.escape(value.message),
      type: value.type as ContactType
    }

    // Business rule: Check for spam patterns
    if (this.isSpamContent(sanitizedData.message) || this.isSpamContent(sanitizedData.subject)) {
      throw new Error('Message content detected as spam')
    }

    // Business rule: Limit demo submissions to reasonable length
    if (sanitizedData.type === 'demo' && sanitizedData.message.length < 50) {
      throw new Error('Demo submissions require a more detailed message (minimum 50 characters)')
    }

    try {
      const contact = await prisma.contact.create({
        data: sanitizedData
      })

      return contact
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('A contact with this information already exists')
        }
      }
      
      console.error('Error creating contact:', error)
      throw new Error('Failed to create contact submission')
    }
  }

  /**
   * Get contacts with pagination and filtering
   */
  static async getContacts(options: {
    page?: number
    limit?: number
    type?: ContactType
    processed?: boolean
    search?: string
  } = {}): Promise<{
    contacts: Contact[]
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
    const { error, value } = getContactsSchema.validate(options)
    if (error) {
      throw new Error(`Validation failed: ${error.details[0].message}`)
    }

    const { page = 1, limit = 10, type, processed, search } = value

    // Build where clause
    const where: Prisma.ContactWhereInput = {}
    
    if (type !== undefined) {
      where.type = type
    }
    
    if (processed !== undefined) {
      where.processed = processed
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ]
    }

    try {
      const [contacts, total] = await Promise.all([
        prisma.contact.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.contact.count({ where })
      ])

      const totalPages = Math.ceil(total / limit)

      return {
        contacts,
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
      console.error('Error fetching contacts:', error)
      throw new Error('Failed to fetch contacts')
    }
  }

  /**
   * Get contact by ID
   */
  static async getContactById(id: number): Promise<Contact | null> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid contact ID')
    }

    try {
      const contact = await prisma.contact.findUnique({
        where: { id }
      })

      return contact
    } catch (error) {
      console.error('Error fetching contact by ID:', error)
      throw new Error('Failed to fetch contact')
    }
  }

  /**
   * Update contact processed status
   */
  static async updateContact(id: number, data: { processed: boolean }): Promise<Contact> {
    // Validate input
    const { error, value } = updateContactSchema.validate(data)
    if (error) {
      throw new Error(`Validation failed: ${error.details[0].message}`)
    }

    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid contact ID')
    }

    try {
      const contact = await prisma.contact.update({
        where: { id },
        data: { processed: value.processed }
      })

      return contact
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Contact not found')
        }
      }
      
      console.error('Error updating contact:', error)
      throw new Error('Failed to update contact')
    }
  }

  /**
   * Delete contact (admin functionality)
   */
  static async deleteContact(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid contact ID')
    }

    try {
      await prisma.contact.delete({
        where: { id }
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Contact not found')
        }
      }
      
      console.error('Error deleting contact:', error)
      throw new Error('Failed to delete contact')
    }
  }

  /**
   * Get contact statistics
   */
  static async getContactStats(): Promise<{
    total: number
    processed: number
    unprocessed: number
    byType: Record<ContactType, number>
    thisWeek: number
    thisMonth: number
  }> {
    try {
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const [
        total,
        processed,
        unprocessed,
        demoCount,
        businessCount,
        generalCount,
        pressCount,
        thisWeek,
        thisMonth
      ] = await Promise.all([
        prisma.contact.count(),
        prisma.contact.count({ where: { processed: true } }),
        prisma.contact.count({ where: { processed: false } }),
        prisma.contact.count({ where: { type: 'demo' } }),
        prisma.contact.count({ where: { type: 'business' } }),
        prisma.contact.count({ where: { type: 'general' } }),
        prisma.contact.count({ where: { type: 'press' } }),
        prisma.contact.count({ where: { createdAt: { gte: oneWeekAgo } } }),
        prisma.contact.count({ where: { createdAt: { gte: oneMonthAgo } } })
      ])

      return {
        total,
        processed,
        unprocessed,
        byType: {
          demo: demoCount,
          business: businessCount,
          general: generalCount,
          press: pressCount
        },
        thisWeek,
        thisMonth
      }
    } catch (error) {
      console.error('Error fetching contact stats:', error)
      throw new Error('Failed to fetch contact statistics')
    }
  }

  /**
   * Check for spam patterns in content
   * @private
   */
  private static isSpamContent(content: string): boolean {
    const spamPatterns = [
      /\b(viagra|cialis|casino|lottery|winner)\b/i,
      /\b(buy now|click here|free money|guaranteed)\b/i,
      /\$\$\$|\$\d+/,
      /(http:\/\/|https:\/\/)\S*\.(tk|ml|ga|cf)\b/i, // Suspicious domains
      /(.)\1{10,}/, // Repeated characters
      /[A-Z]{20,}/, // All caps text blocks
    ]

    return spamPatterns.some(pattern => pattern.test(content))
  }

  /**
   * Get recent unprocessed contacts for admin dashboard
   */
  static async getUnprocessedContacts(limit: number = 5): Promise<Contact[]> {
    if (!Number.isInteger(limit) || limit <= 0 || limit > 50) {
      throw new Error('Invalid limit value')
    }

    try {
      const contacts = await prisma.contact.findMany({
        where: { processed: false },
        orderBy: { createdAt: 'desc' },
        take: limit
      })

      return contacts
    } catch (error) {
      console.error('Error fetching unprocessed contacts:', error)
      throw new Error('Failed to fetch unprocessed contacts')
    }
  }

  /**
   * Business rule: Check if email has submitted too many contacts recently
   */
  static async checkRecentSubmissions(email: string, hours: number = 24): Promise<boolean> {
    const sanitizedEmail = validator.normalizeEmail(email)
    if (!sanitizedEmail) {
      return false
    }

    const timeThreshold = new Date(Date.now() - hours * 60 * 60 * 1000)

    try {
      const recentCount = await prisma.contact.count({
        where: {
          email: sanitizedEmail,
          createdAt: { gte: timeThreshold }
        }
      })

      // Business rule: Max 3 submissions per email per day
      return recentCount >= 3
    } catch (error) {
      console.error('Error checking recent submissions:', error)
      return false
    }
  }
}