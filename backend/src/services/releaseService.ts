import { Release, ReleaseType, Prisma, Artist } from '@prisma/client'
import { prisma } from '../config/database'
import Joi from 'joi'

// Type for Release with Artist included
type ReleaseWithArtist = Release & {
  artist: Artist
}

// Enhanced validation schemas for Releases
const streamingPlatformSchema = Joi.object({
  spotify: Joi.string().uri().optional(),
  appleMusic: Joi.string().uri().optional(),
  youtube: Joi.string().uri().optional(),
  bandcamp: Joi.string().uri().optional(),
  soundcloud: Joi.string().uri().optional()
}).unknown(false) // Don't allow unknown platforms

const coverArtSizesSchema = Joi.object({
  small: Joi.string().pattern(/^\/uploads\/releases\/\d+_small\.(jpg|jpeg|png|webp)$/).optional(),
  medium: Joi.string().pattern(/^\/uploads\/releases\/\d+_medium\.(jpg|jpeg|png|webp)$/).optional(),
  large: Joi.string().pattern(/^\/uploads\/releases\/\d+_large\.(jpg|jpeg|png|webp)$/).optional()
}).unknown(false)

const createReleaseSchema = Joi.object({
  artistId: Joi.number().integer().positive().required(),
  title: Joi.string().min(1).max(255).required(),
  type: Joi.string().valid('album', 'single', 'ep').required(),
  releaseDate: Joi.date().min('1900-01-01').max(new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000)).required(), // Max 2 years in future
  coverArtUrl: Joi.string().pattern(/^\/uploads\/releases\/\d+_medium\.(jpg|jpeg|png|webp)$/).optional().allow(null),
  coverArtAlt: Joi.string().max(255).optional().allow(null),
  coverArtSizes: coverArtSizesSchema.optional(),
  streamingLinks: streamingPlatformSchema.optional(),
  description: Joi.string().max(2000).optional().allow(null)
})

const updateReleaseSchema = Joi.object({
  artistId: Joi.number().integer().positive().optional(),
  title: Joi.string().min(1).max(255).optional(),
  type: Joi.string().valid('album', 'single', 'ep').optional(),
  releaseDate: Joi.date().min('1900-01-01').max(new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000)).optional(),
  coverArtUrl: Joi.string().pattern(/^\/uploads\/releases\/\d+_medium\.(jpg|jpeg|png|webp)$/).optional().allow(null),
  coverArtAlt: Joi.string().max(255).optional().allow(null),
  coverArtSizes: coverArtSizesSchema.optional(),
  streamingLinks: streamingPlatformSchema.optional(),
  description: Joi.string().max(2000).optional().allow(null)
})

// Enhanced CRUD operations
export class ReleaseService {
  
  /**
   * Get all releases with optional filtering and pagination
   */
  static async getReleases(options: {
    page?: number;
    limit?: number;
    artistId?: number;
    type?: ReleaseType;
    releaseDate?: string; // YYYY-MM-DD format
    sort?: 'newest' | 'oldest' | 'title';
    includeArtist?: boolean;
  } = {}) {
    const { page = 1, limit = 10, artistId, type, releaseDate, sort = 'newest', includeArtist = true } = options
    
    const skip = (page - 1) * limit
    
    const where: Prisma.ReleaseWhereInput = {}
    
    if (artistId) {
      where.artistId = artistId
    }
    
    if (type) {
      where.type = type
    }
    
    if (releaseDate) {
      const date = new Date(releaseDate)
      where.releaseDate = {
        gte: date,
        lt: new Date(date.getTime() + 24 * 60 * 60 * 1000) // Next day
      }
    }
    
    // Sort options
    const orderBy: Prisma.ReleaseOrderByWithRelationInput[] = []
    switch (sort) {
      case 'newest':
        orderBy.push({ releaseDate: 'desc' })
        break
      case 'oldest':
        orderBy.push({ releaseDate: 'asc' })
        break
      case 'title':
        orderBy.push({ title: 'asc' })
        break
      default:
        orderBy.push({ releaseDate: 'desc' })
    }
    orderBy.push({ createdAt: 'desc' }) // Secondary sort
    
    const [releases, total] = await Promise.all([
      prisma.release.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: includeArtist ? {
          artist: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              imageAlt: true,
              isFeatured: true
            }
          }
        } : undefined
      }),
      prisma.release.count({ where })
    ])
    
    return {
      releases,
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
   * Get single release by ID with artist information
   */
  static async getReleaseById(id: number, includeArtist: boolean = true) {
    const release = await prisma.release.findUnique({
      where: { id },
      include: includeArtist ? {
        artist: true
      } : undefined
    })
    
    return release
  }
  
  /**
   * Get releases by artist ID
   */
  static async getReleasesByArtist(artistId: number, options: {
    page?: number;
    limit?: number;
    type?: ReleaseType;
  } = {}) {
    return this.getReleases({
      ...options,
      artistId,
      includeArtist: false
    })
  }
  
  /**
   * Create new release with enhanced validation
   */
  static async createRelease(data: {
    artistId: number;
    title: string;
    type: ReleaseType;
    releaseDate: Date;
    coverArtUrl?: string | null;
    coverArtAlt?: string | null;
    coverArtSizes?: Record<string, string>;
    streamingLinks?: Record<string, string>;
    description?: string | null;
  }): Promise<ReleaseWithArtist> {
    // Validate input data
    const { error, value } = createReleaseSchema.validate(data)
    if (error) {
      throw new Error(`Validation failed: ${error.details[0].message}`)
    }
    
    // Check if artist exists
    const artist = await prisma.artist.findUnique({
      where: { id: value.artistId }
    })
    
    if (!artist) {
      throw new Error('Artist not found')
    }
    
    // Check for duplicate title by same artist
    const existingRelease = await prisma.release.findFirst({
      where: {
        artistId: value.artistId,
        title: value.title
      }
    })
    
    if (existingRelease) {
      throw new Error('Release with this title already exists for this artist')
    }
    
    try {
      const release = await prisma.release.create({
        data: {
          artistId: value.artistId,
          title: value.title,
          type: value.type,
          releaseDate: value.releaseDate,
          coverArtUrl: value.coverArtUrl,
          coverArtAlt: value.coverArtAlt,
          coverArtSizes: value.coverArtSizes || {},
          streamingLinks: value.streamingLinks || {},
          description: value.description
        },
        include: {
          artist: true
        }
      })
      
      return release
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new Error('Artist not found')
        }
      }
      throw error
    }
  }
  
  /**
   * Update release with enhanced validation
   */
  static async updateRelease(id: number, data: {
    artistId?: number;
    title?: string;
    type?: ReleaseType;
    releaseDate?: Date;
    coverArtUrl?: string | null;
    coverArtAlt?: string | null;
    coverArtSizes?: Record<string, string>;
    streamingLinks?: Record<string, string>;
    description?: string | null;
  }): Promise<ReleaseWithArtist> {
    // Validate input data
    const { error, value } = updateReleaseSchema.validate(data)
    if (error) {
      throw new Error(`Validation failed: ${error.details[0].message}`)
    }
    
    // Check if release exists
    const existingRelease = await prisma.release.findUnique({
      where: { id }
    })
    
    if (!existingRelease) {
      throw new Error('Release not found')
    }
    
    // Check if new artist exists (if changing artist)
    if (value.artistId && value.artistId !== existingRelease.artistId) {
      const artist = await prisma.artist.findUnique({
        where: { id: value.artistId }
      })
      
      if (!artist) {
        throw new Error('New artist not found')
      }
    }
    
    // Check for duplicate title if title or artist is changing
    if ((value.title && value.title !== existingRelease.title) || 
        (value.artistId && value.artistId !== existingRelease.artistId)) {
      const duplicateRelease = await prisma.release.findFirst({
        where: {
          artistId: value.artistId || existingRelease.artistId,
          title: value.title || existingRelease.title,
          NOT: { id }
        }
      })
      
      if (duplicateRelease) {
        throw new Error('Release with this title already exists for this artist')
      }
    }
    
    try {
      const release = await prisma.release.update({
        where: { id },
        data: value,
        include: {
          artist: true
        }
      })
      
      return release
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Release not found')
        }
        if (error.code === 'P2003') {
          throw new Error('Artist not found')
        }
      }
      throw error
    }
  }
  
  /**
   * Delete release
   */
  static async deleteRelease(id: number): Promise<boolean> {
    try {
      await prisma.release.delete({
        where: { id }
      })
      return true
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Release not found')
        }
      }
      throw error
    }
  }
  
  /**
   * Get latest releases
   */
  static async getLatestReleases(limit: number = 5) {
    return prisma.release.findMany({
      take: limit,
      orderBy: { releaseDate: 'desc' },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            isFeatured: true
          }
        }
      }
    })
  }
  
  /**
   * Get releases by type
   */
  static async getReleasesByType(type: ReleaseType, options: {
    page?: number;
    limit?: number;
  } = {}) {
    return this.getReleases({
      ...options,
      type
    })
  }
  
  /**
   * Update release cover art information
   */
  static async updateReleaseCoverArt(id: number, coverArtData: {
    coverArtUrl?: string;
    coverArtAlt?: string;
    coverArtSizes?: Record<string, string>;
  }): Promise<ReleaseWithArtist> {
    // Validate cover art data
    const schema = Joi.object({
      coverArtUrl: Joi.string().pattern(/^\/uploads\/releases\/\d+_medium\.(jpg|jpeg|png|webp)$/).optional(),
      coverArtAlt: Joi.string().max(255).optional(),
      coverArtSizes: coverArtSizesSchema.optional()
    })
    
    const { error, value } = schema.validate(coverArtData)
    if (error) {
      throw new Error(`Cover art validation failed: ${error.details[0].message}`)
    }
    
    try {
      const release = await prisma.release.update({
        where: { id },
        data: value,
        include: {
          artist: true
        }
      })
      
      return release
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Release not found')
        }
      }
      throw error
    }
  }
  
  /**
   * Get release statistics
   */
  static async getReleaseStats() {
    const [total, byType, thisYear] = await Promise.all([
      prisma.release.count(),
      prisma.release.groupBy({
        by: ['type'],
        _count: { type: true }
      }),
      prisma.release.count({
        where: {
          releaseDate: {
            gte: new Date(new Date().getFullYear(), 0, 1)
          }
        }
      })
    ])
    
    return {
      total,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count.type
        return acc
      }, {} as Record<ReleaseType, number>),
      thisYear
    }
  }
}