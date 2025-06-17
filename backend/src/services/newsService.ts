import { News, Prisma } from '@prisma/client'
import Joi from 'joi'
import { prisma } from '../config/database'

// Enhanced validation schemas for News
const createNewsSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  content: Joi.string().min(10).max(50000).required(),
  author: Joi.string().min(1).max(100).optional().default('Music Label'),
  slug: Joi.string().pattern(/^[a-z0-9-]+$/).max(255).optional(),
  publishedAt: Joi.date().optional().allow(null)
})

const updateNewsSchema = Joi.object({
  title: Joi.string().min(1).max(255).optional(),
  content: Joi.string().min(10).max(50000).optional(),
  author: Joi.string().min(1).max(100).optional(),
  slug: Joi.string().pattern(/^[a-z0-9-]+$/).max(255).optional(),
  publishedAt: Joi.date().optional().allow(null)
})

// Enhanced CRUD operations
export class NewsService {
  
  /**
   * Generate URL-friendly slug from title
   */
  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/-+/g, '-')      // Replace multiple hyphens with single
      .trim()
      .substring(0, 255)        // Limit length
  }
  
  /**
   * Get all news articles with optional filtering and pagination
   */
  static async getNews(options: {
    page?: number;
    limit?: number;
    published?: boolean;
    search?: string;
    sort?: 'newest' | 'oldest' | 'title';
  } = {}) {
    const { page = 1, limit = 10, published, search, sort = 'newest' } = options
    
    const skip = (page - 1) * limit
    
    const where: Prisma.NewsWhereInput = {}
    
    if (published !== undefined) {
      if (published) {
        where.publishedAt = { not: null }
      } else {
        where.publishedAt = null
      }
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // Sort options
    const orderBy: Prisma.NewsOrderByWithRelationInput[] = []
    switch (sort) {
      case 'newest':
        orderBy.push({ publishedAt: 'desc' })
        orderBy.push({ createdAt: 'desc' })
        break
      case 'oldest':
        orderBy.push({ publishedAt: 'asc' })
        orderBy.push({ createdAt: 'asc' })
        break
      case 'title':
        orderBy.push({ title: 'asc' })
        break
      default:
        orderBy.push({ publishedAt: 'desc' })
        orderBy.push({ createdAt: 'desc' })
    }
    
    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        skip,
        take: limit,
        orderBy
      }),
      prisma.news.count({ where })
    ])
    
    return {
      news,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
  }
  
  /**
   * Get single news article by ID
   */
  static async getNewsById(id: number): Promise<News | null> {
    return prisma.news.findUnique({
      where: { id }
    })
  }
  
  /**
   * Get single news article by slug
   */
  static async getNewsBySlug(slug: string): Promise<News | null> {
    return prisma.news.findUnique({
      where: { slug }
    })
  }
  
  /**
   * Create new news article with enhanced validation and auto slug generation
   */
  static async createNews(data: {
    title: string;
    content: string;
    author?: string;
    slug?: string;
    publishedAt?: Date | null;
  }): Promise<News> {
    // Validate input data
    const { error, value } = createNewsSchema.validate(data)
    if (error) {
      throw new Error(`Validation failed: ${error.details[0].message}`)
    }
    
    // Generate slug if not provided
    let finalSlug = value.slug
    if (!finalSlug) {
      finalSlug = this.generateSlug(value.title)
    }
    
    // Ensure slug is unique
    let uniqueSlug = finalSlug
    let counter = 1
    while (await prisma.news.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${finalSlug}-${counter}`
      counter++
    }
    
    try {
      const news = await prisma.news.create({
        data: {
          title: value.title,
          content: value.content,
          author: value.author || 'Music Label',
          slug: uniqueSlug,
          publishedAt: value.publishedAt
        }
      })
      
      return news
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('News article with this slug already exists')
        }
      }
      throw error
    }
  }
  
  /**
   * Update news article with enhanced validation
   */
  static async updateNews(id: number, data: {
    title?: string;
    content?: string;
    author?: string;
    slug?: string;
    publishedAt?: Date | null;
  }): Promise<News> {
    // Validate input data
    const { error, value } = updateNewsSchema.validate(data)
    if (error) {
      throw new Error(`Validation failed: ${error.details[0].message}`)
    }
    
    // Check if news exists
    const existingNews = await prisma.news.findUnique({
      where: { id }
    })
    
    if (!existingNews) {
      throw new Error('News article not found')
    }
    
    // Handle slug updates
    let finalSlug = value.slug
    if (value.title && !value.slug) {
      // If title is being updated but no new slug provided, generate new slug
      finalSlug = this.generateSlug(value.title)
    }
    
    // Ensure slug uniqueness if slug is being changed
    if (finalSlug && finalSlug !== existingNews.slug) {
      let uniqueSlug = finalSlug
      let counter = 1
      while (await prisma.news.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${finalSlug}-${counter}`
        counter++
      }
      finalSlug = uniqueSlug
    }
    
    try {
      const updateData = { ...value }
      if (finalSlug) {
        updateData.slug = finalSlug
      }
      
      const news = await prisma.news.update({
        where: { id },
        data: updateData
      })
      
      return news
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('News article not found')
        }
        if (error.code === 'P2002') {
          throw new Error('News article with this slug already exists')
        }
      }
      throw error
    }
  }
  
  /**
   * Delete news article
   */
  static async deleteNews(id: number): Promise<boolean> {
    try {
      await prisma.news.delete({
        where: { id }
      })
      return true
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('News article not found')
        }
      }
      throw error
    }
  }
  
  /**
   * Get published news articles
   */
  static async getPublishedNews(options: {
    page?: number;
    limit?: number;
    sort?: 'newest' | 'oldest';
  } = {}) {
    return this.getNews({
      ...options,
      published: true
    })
  }
  
  /**
   * Get draft news articles
   */
  static async getDraftNews(options: {
    page?: number;
    limit?: number;
  } = {}) {
    return this.getNews({
      ...options,
      published: false
    })
  }
  
  /**
   * Publish a news article
   */
  static async publishNews(id: number): Promise<News> {
    const existingNews = await prisma.news.findUnique({
      where: { id }
    })
    
    if (!existingNews) {
      throw new Error('News article not found')
    }
    
    if (existingNews.publishedAt) {
      throw new Error('News article is already published')
    }
    
    return prisma.news.update({
      where: { id },
      data: {
        publishedAt: new Date()
      }
    })
  }
  
  /**
   * Unpublish a news article (set to draft)
   */
  static async unpublishNews(id: number): Promise<News> {
    const existingNews = await prisma.news.findUnique({
      where: { id }
    })
    
    if (!existingNews) {
      throw new Error('News article not found')
    }
    
    if (!existingNews.publishedAt) {
      throw new Error('News article is already a draft')
    }
    
    return prisma.news.update({
      where: { id },
      data: {
        publishedAt: null
      }
    })
  }
  
  /**
   * Get latest published news
   */
  static async getLatestNews(limit: number = 5): Promise<News[]> {
    return prisma.news.findMany({
      where: {
        publishedAt: { not: null }
      },
      orderBy: { publishedAt: 'desc' },
      take: limit
    })
  }
  
  /**
   * Search news articles
   */
  static async searchNews(query: string, options: {
    page?: number;
    limit?: number;
    publishedOnly?: boolean;
  } = {}) {
    const { publishedOnly = true } = options
    
    return this.getNews({
      ...options,
      search: query,
      published: publishedOnly ? true : undefined
    })
  }
  
  /**
   * Get news statistics
   */
  static async getNewsStats() {
    const [total, published, drafts, thisMonth] = await Promise.all([
      prisma.news.count(),
      prisma.news.count({
        where: { publishedAt: { not: null } }
      }),
      prisma.news.count({
        where: { publishedAt: null }
      }),
      prisma.news.count({
        where: {
          publishedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            not: null
          }
        }
      })
    ])
    
    return {
      total,
      published,
      drafts,
      thisMonth
    }
  }
}