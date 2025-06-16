import { PrismaClient, Artist, Prisma } from '@prisma/client'
import Joi from 'joi'

const prisma = new PrismaClient()

// Enhanced validation schemas for Artists
const socialPlatformSchema = Joi.object({
  spotify: Joi.string().uri().optional(),
  appleMusic: Joi.string().uri().optional(),
  youtube: Joi.string().uri().optional(),
  instagram: Joi.string().uri().optional(),
  facebook: Joi.string().uri().optional(),
  bandcamp: Joi.string().uri().optional(),
  soundcloud: Joi.string().uri().optional(),
  tiktok: Joi.string().uri().optional()
}).unknown(false) // Don't allow unknown platforms

const imageSizesSchema = Joi.object({
  thumbnail: Joi.string().pattern(/^\/uploads\/artists\/\d+_thumbnail\.(jpg|jpeg|png|webp)$/).optional(),
  profile: Joi.string().pattern(/^\/uploads\/artists\/\d+_profile\.(jpg|jpeg|png|webp)$/).optional(),
  featured: Joi.string().pattern(/^\/uploads\/artists\/\d+_featured\.(jpg|jpeg|png|webp)$/).optional()
}).unknown(false)

const createArtistSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  bio: Joi.string().max(5000).optional().allow(null),
  imageUrl: Joi.string().pattern(/^\/uploads\/artists\/\d+_profile\.(jpg|jpeg|png|webp)$/).optional().allow(null),
  imageAlt: Joi.string().max(255).optional().allow(null),
  imageSizes: imageSizesSchema.optional(),
  socialLinks: socialPlatformSchema.optional(),
  isFeatured: Joi.boolean().optional().default(false)
})

const updateArtistSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  bio: Joi.string().max(5000).optional().allow(null),
  imageUrl: Joi.string().pattern(/^\/uploads\/artists\/\d+_profile\.(jpg|jpeg|png|webp)$/).optional().allow(null),
  imageAlt: Joi.string().max(255).optional().allow(null),
  imageSizes: imageSizesSchema.optional(),
  socialLinks: socialPlatformSchema.optional(),
  isFeatured: Joi.boolean().optional()
})

// Enhanced CRUD operations
export class ArtistService {
  
  /**
   * Get all artists with optional filtering and pagination
   */
  static async getArtists(options: {
    page?: number;
    limit?: number;
    featured?: boolean;
    search?: string;
    includeReleases?: boolean;
  } = {}) {
    const { page = 1, limit = 10, featured, search, includeReleases = false } = options
    
    const skip = (page - 1) * limit
    
    const where: Prisma.ArtistWhereInput = {}
    
    if (featured !== undefined) {
      where.isFeatured = featured
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    const [artists, total] = await Promise.all([
      prisma.artist.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isFeatured: 'desc' }, // Featured artists first
          { createdAt: 'desc' }
        ],
        include: includeReleases ? {
          releases: {
            orderBy: { releaseDate: 'desc' },
            take: 5 // Limit releases per artist for performance
          }
        } : undefined
      }),
      prisma.artist.count({ where })
    ])
    
    return {
      artists,
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
   * Get single artist by ID with optional releases
   */
  static async getArtistById(id: number, includeReleases: boolean = false): Promise<Artist | null> {
    const artist = await prisma.artist.findUnique({
      where: { id },
      include: includeReleases ? {
        releases: {
          orderBy: { releaseDate: 'desc' }
        }
      } : undefined
    })
    
    return artist
  }
  
  /**
   * Create new artist with enhanced validation
   */
  static async createArtist(data: {
    name: string;
    bio?: string | null;
    imageUrl?: string | null;
    imageAlt?: string | null;
    imageSizes?: Record<string, string>;
    socialLinks?: Record<string, string>;
    isFeatured?: boolean;
  }): Promise<Artist> {
    // Validate input data
    const { error, value } = createArtistSchema.validate(data)
    if (error) {
      throw new Error(`Validation failed: ${error.details[0].message}`)
    }
    
    // Check for unique name
    const existingArtist = await prisma.artist.findUnique({
      where: { name: value.name }
    })
    
    if (existingArtist) {
      throw new Error('Artist with this name already exists')
    }
    
    // Check featured artist limit (max 6)
    if (value.isFeatured) {
      const featuredCount = await prisma.artist.count({
        where: { isFeatured: true }
      })
      
      if (featuredCount >= 6) {
        throw new Error('Maximum of 6 featured artists allowed')
      }
    }
    
    try {
      const artist = await prisma.artist.create({
        data: {
          name: value.name,
          bio: value.bio,
          imageUrl: value.imageUrl,
          imageAlt: value.imageAlt,
          imageSizes: value.imageSizes || {},
          socialLinks: value.socialLinks || {},
          isFeatured: value.isFeatured || false
        }
      })
      
      return artist
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Artist with this name already exists')
        }
      }
      throw error
    }
  }
  
  /**
   * Update artist with enhanced validation
   */
  static async updateArtist(id: number, data: {
    name?: string;
    bio?: string | null;
    imageUrl?: string | null;
    imageAlt?: string | null;
    imageSizes?: Record<string, string>;
    socialLinks?: Record<string, string>;
    isFeatured?: boolean;
  }): Promise<Artist> {
    // Validate input data
    const { error, value } = updateArtistSchema.validate(data)
    if (error) {
      throw new Error(`Validation failed: ${error.details[0].message}`)
    }
    
    // Check if artist exists
    const existingArtist = await prisma.artist.findUnique({
      where: { id }
    })
    
    if (!existingArtist) {
      throw new Error('Artist not found')
    }
    
    // Check for unique name if name is being updated
    if (value.name && value.name !== existingArtist.name) {
      const nameExists = await prisma.artist.findUnique({
        where: { name: value.name }
      })
      
      if (nameExists) {
        throw new Error('Artist with this name already exists')
      }
    }
    
    // Check featured artist limit if setting to featured
    if (value.isFeatured && !existingArtist.isFeatured) {
      const featuredCount = await prisma.artist.count({
        where: { isFeatured: true }
      })
      
      if (featuredCount >= 6) {
        throw new Error('Maximum of 6 featured artists allowed')
      }
    }
    
    try {
      const artist = await prisma.artist.update({
        where: { id },
        data: value
      })
      
      return artist
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Artist with this name already exists')
        }
        if (error.code === 'P2025') {
          throw new Error('Artist not found')
        }
      }
      throw error
    }
  }
  
  /**
   * Delete artist (CASCADE will handle releases)
   */
  static async deleteArtist(id: number): Promise<boolean> {
    try {
      await prisma.artist.delete({
        where: { id }
      })
      return true
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Artist not found')
        }
      }
      throw error
    }
  }
  
  /**
   * Get featured artists
   */
  static async getFeaturedArtists(): Promise<Artist[]> {
    return prisma.artist.findMany({
      where: { isFeatured: true },
      orderBy: { createdAt: 'desc' },
      take: 6
    })
  }
  
  /**
   * Update artist image information
   */
  static async updateArtistImage(id: number, imageData: {
    imageUrl?: string;
    imageAlt?: string;
    imageSizes?: Record<string, string>;
  }): Promise<Artist> {
    // Validate image data
    const schema = Joi.object({
      imageUrl: Joi.string().pattern(/^\/uploads\/artists\/\d+_profile\.(jpg|jpeg|png|webp)$/).optional(),
      imageAlt: Joi.string().max(255).optional(),
      imageSizes: imageSizesSchema.optional()
    })
    
    const { error, value } = schema.validate(imageData)
    if (error) {
      throw new Error(`Image validation failed: ${error.details[0].message}`)
    }
    
    try {
      const artist = await prisma.artist.update({
        where: { id },
        data: value
      })
      
      return artist
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Artist not found')
        }
      }
      throw error
    }
  }
}