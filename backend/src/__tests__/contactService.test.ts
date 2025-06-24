import { ContactService } from '../services/contactService'
import { cleanupTestDatabase, testDatabaseConnection } from '../config/database'
import { ContactType } from '@prisma/client'

describe('ContactService', () => {
  beforeAll(async () => {
    await testDatabaseConnection()
  })

  beforeEach(async () => {
    await cleanupTestDatabase()
  })

  describe('createContact', () => {
    it('should create a contact with valid data', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        subject: 'Demo Submission',
        message: 'I would like to submit my demo for consideration. I have been working on my music for 3 years.',
        type: 'demo' as ContactType
      }

      const contact = await ContactService.createContact(contactData)

      expect(contact).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        email: 'john.doe@example.com',
        subject: expect.any(String),
        message: expect.any(String),
        type: 'demo',
        processed: false,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })

    it('should sanitize input data to prevent XSS', async () => {
      const contactData = {
        name: 'John <script>alert("xss")</script> Doe',
        email: 'john.doe@example.com',
        subject: 'Test <img src=x onerror=alert(1)> Subject',
        message: 'This is a test message with <script>malicious</script> content.',
        type: 'general' as ContactType
      }

      const contact = await ContactService.createContact(contactData)

      expect(contact.name).not.toContain('<script>')
      expect(contact.subject).not.toContain('<img')
      expect(contact.message).not.toContain('<script>')
      expect(contact.name).toContain('John')
      expect(contact.name).toContain('Doe')
    })

    it('should normalize email addresses', async () => {
      const contactData = {
        name: 'Test User',
        email: 'TEST.user+label@GMAIL.COM',
        subject: 'Test Subject',
        message: 'This is a test message that is long enough to pass validation.',
        type: 'business' as ContactType
      }

      const contact = await ContactService.createContact(contactData)

      expect(contact.email).toBe('testuser@gmail.com')
    })

    it('should enforce demo submission message length', async () => {
      const contactData = {
        name: 'Artist',
        email: 'artist@example.com',
        subject: 'Short Demo',
        message: 'This is short demo message', // 28 chars: passes Joi (>10) but fails demo rule (<50)
        type: 'demo' as ContactType
      }

      await expect(ContactService.createContact(contactData))
        .rejects.toThrow('Demo submissions require a more detailed message (minimum 50 characters)')
    })

    it('should detect spam content', async () => {
      const spamData = {
        name: 'Spammer',
        email: 'spam@example.com',
        subject: 'Buy viagra now - guaranteed results!',
        message: 'This is clearly spam content with casino and lottery keywords.',
        type: 'general' as ContactType
      }

      await expect(ContactService.createContact(spamData))
        .rejects.toThrow('Message content detected as spam')
    })

    it('should validate required fields', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        subject: 'Hi',
        message: 'Short',
        type: 'invalid' as any
      }

      await expect(ContactService.createContact(invalidData))
        .rejects.toThrow('Validation failed')
    })

    it('should handle all contact types', async () => {
      const contactTypes: ContactType[] = ['demo', 'business', 'general', 'press']

      for (const type of contactTypes) {
        const contactData = {
          name: `User ${type}`,
          email: `user.${type}@example.com`,
          subject: `${type} inquiry`,
          message: `This is a ${type} inquiry with sufficient content for validation.`,
          type
        }

        const contact = await ContactService.createContact(contactData)
        expect(contact.type).toBe(type)
      }
    })
  })

  describe('getContacts', () => {
    beforeEach(async () => {
      // Create test data
      const contacts = [
        {
          name: 'Alice Johnson',
          email: 'alice@example.com',
          subject: 'Demo Submission',
          message: 'I would like to submit my demo for your consideration.',
          type: 'demo' as ContactType
        },
        {
          name: 'Bob Smith',
          email: 'bob@example.com',
          subject: 'Business Partnership',
          message: 'I am interested in discussing a business partnership.',
          type: 'business' as ContactType
        },
        {
          name: 'Charlie Brown',
          email: 'charlie@example.com',
          subject: 'General Question',
          message: 'I have a general question about your music label.',
          type: 'general' as ContactType
        }
      ]

      for (const contact of contacts) {
        await ContactService.createContact(contact)
      }
    })

    it('should get all contacts with pagination', async () => {
      const result = await ContactService.getContacts({ page: 1, limit: 2 })

      expect(result.contacts).toHaveLength(2)
      expect(result.pagination).toMatchObject({
        page: 1,
        limit: 2,
        total: 3,
        totalPages: 2,
        hasNext: true,
        hasPrev: false
      })
    })

    it('should filter contacts by type', async () => {
      const result = await ContactService.getContacts({ type: 'demo' })

      expect(result.contacts).toHaveLength(1)
      expect(result.contacts[0].type).toBe('demo')
      expect(result.contacts[0].email).toBe('alice@example.com')
    })

    it('should filter contacts by processed status', async () => {
      // Mark one contact as processed
      const allContacts = await ContactService.getContacts()
      await ContactService.updateContact(allContacts.contacts[0].id, { processed: true })

      const unprocessedResult = await ContactService.getContacts({ processed: false })
      const processedResult = await ContactService.getContacts({ processed: true })

      expect(unprocessedResult.contacts).toHaveLength(2)
      expect(processedResult.contacts).toHaveLength(1)
      expect(processedResult.contacts[0].processed).toBe(true)
    })

    it('should search contacts by content', async () => {
      const result = await ContactService.getContacts({ search: 'demo' })

      expect(result.contacts).toHaveLength(1)
      expect(result.contacts[0].type).toBe('demo')
    })

    it('should validate pagination parameters', async () => {
      await expect(ContactService.getContacts({ page: 0 }))
        .rejects.toThrow('Validation failed')

      await expect(ContactService.getContacts({ limit: 101 }))
        .rejects.toThrow('Validation failed')
    })
  })

  describe('getContactById', () => {
    it('should get contact by valid ID', async () => {
      const contactData = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'This is a test message with sufficient length.',
        type: 'general' as ContactType
      }

      const createdContact = await ContactService.createContact(contactData)
      const retrievedContact = await ContactService.getContactById(createdContact.id)

      expect(retrievedContact).toMatchObject({
        id: createdContact.id,
        email: 'test@example.com',
        type: 'general'
      })
    })

    it('should return null for non-existent contact', async () => {
      const contact = await ContactService.getContactById(999999)
      expect(contact).toBeNull()
    })

    it('should validate ID parameter', async () => {
      await expect(ContactService.getContactById(-1))
        .rejects.toThrow('Invalid contact ID')

      await expect(ContactService.getContactById(0))
        .rejects.toThrow('Invalid contact ID')
    })
  })

  describe('updateContact', () => {
    it('should update contact processed status', async () => {
      const contactData = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'This is a test message with sufficient length.',
        type: 'general' as ContactType
      }

      const contact = await ContactService.createContact(contactData)
      expect(contact.processed).toBe(false)

      const updatedContact = await ContactService.updateContact(contact.id, { processed: true })
      expect(updatedContact.processed).toBe(true)
      expect(updatedContact.id).toBe(contact.id)
    })

    it('should handle non-existent contact', async () => {
      await expect(ContactService.updateContact(999999, { processed: true }))
        .rejects.toThrow('Contact not found')
    })

    it('should validate update data', async () => {
      const contactData = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'This is a test message with sufficient length.',
        type: 'general' as ContactType
      }

      const contact = await ContactService.createContact(contactData)

      await expect(ContactService.updateContact(contact.id, {} as any))
        .rejects.toThrow('Validation failed')
    })
  })

  describe('deleteContact', () => {
    it('should delete contact successfully', async () => {
      const contactData = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'This is a test message with sufficient length.',
        type: 'general' as ContactType
      }

      const contact = await ContactService.createContact(contactData)

      await ContactService.deleteContact(contact.id)

      const deletedContact = await ContactService.getContactById(contact.id)
      expect(deletedContact).toBeNull()
    })

    it('should handle non-existent contact deletion', async () => {
      await expect(ContactService.deleteContact(999999))
        .rejects.toThrow('Contact not found')
    })
  })

  describe('getContactStats', () => {
    beforeEach(async () => {
      // Create test data with different types and statuses
      const contacts = [
        {
          name: 'Demo User 1',
          email: 'demo1@example.com',
          subject: 'Demo 1',
          message: 'Demo submission number one with sufficient content.',
          type: 'demo' as ContactType
        },
        {
          name: 'Demo User 2',
          email: 'demo2@example.com',
          subject: 'Demo 2',
          message: 'Demo submission number two with sufficient content.',
          type: 'demo' as ContactType
        },
        {
          name: 'Business User',
          email: 'business@example.com',
          subject: 'Business Inquiry',
          message: 'Business inquiry with sufficient content for validation.',
          type: 'business' as ContactType
        }
      ]

      for (const contact of contacts) {
        await ContactService.createContact(contact)
      }

      // Mark one as processed
      const allContacts = await ContactService.getContacts()
      await ContactService.updateContact(allContacts.contacts[0].id, { processed: true })
    })

    it('should return comprehensive statistics', async () => {
      const stats = await ContactService.getContactStats()

      expect(stats).toMatchObject({
        total: 3,
        processed: 1,
        unprocessed: 2,
        byType: {
          demo: 2,
          business: 1,
          general: 0,
          press: 0
        },
        thisWeek: 3,
        thisMonth: 3
      })
    })
  })

  describe('checkRecentSubmissions', () => {
    it('should detect recent submissions from same email', async () => {
      const email = 'test@example.com'
      
      // Create first contact
      await ContactService.createContact({
        name: 'Test User',
        email,
        subject: 'First Contact',
        message: 'This is the first contact message with sufficient length.',
        type: 'general' as ContactType
      })

      const hasRecent = await ContactService.checkRecentSubmissions(email, 24)
      expect(hasRecent).toBe(false) // Should be false for first submission

      // Create second contact
      await ContactService.createContact({
        name: 'Test User',
        email,
        subject: 'Second Contact',
        message: 'This is the second contact message with sufficient length.',
        type: 'general' as ContactType
      })

      // Create third contact
      await ContactService.createContact({
        name: 'Test User',
        email,
        subject: 'Third Contact',
        message: 'This is the third contact message with sufficient length.',
        type: 'general' as ContactType
      })

      const hasRecentAfterThree = await ContactService.checkRecentSubmissions(email, 24)
      expect(hasRecentAfterThree).toBe(true) // Should be true after 3 submissions
    })

    it('should return false for non-existent email', async () => {
      const hasRecent = await ContactService.checkRecentSubmissions('nonexistent@example.com', 24)
      expect(hasRecent).toBe(false)
    })
  })

  describe('getUnprocessedContacts', () => {
    beforeEach(async () => {
      // Create test contacts
      for (let i = 1; i <= 5; i++) {
        await ContactService.createContact({
          name: `User ${i}`,
          email: `user${i}@example.com`,
          subject: `Subject ${i}`,
          message: `This is message ${i} with sufficient content for validation.`,
          type: 'general' as ContactType
        })
      }

      // Process some contacts
      const allContacts = await ContactService.getContacts()
      await ContactService.updateContact(allContacts.contacts[0].id, { processed: true })
      await ContactService.updateContact(allContacts.contacts[1].id, { processed: true })
    })

    it('should return unprocessed contacts only', async () => {
      const unprocessed = await ContactService.getUnprocessedContacts(10)

      expect(unprocessed).toHaveLength(3)
      unprocessed.forEach(contact => {
        expect(contact.processed).toBe(false)
      })
    })

    it('should respect limit parameter', async () => {
      const limited = await ContactService.getUnprocessedContacts(2)
      expect(limited).toHaveLength(2)
    })

    it('should validate limit parameter', async () => {
      await expect(ContactService.getUnprocessedContacts(-1))
        .rejects.toThrow('Invalid limit value')

      await expect(ContactService.getUnprocessedContacts(51))
        .rejects.toThrow('Invalid limit value')
    })
  })
})