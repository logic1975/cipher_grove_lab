import { PrismaClient, Concert, Artist } from '@prisma/client';
import Joi from 'joi';

const prisma = new PrismaClient();

// Validation schemas
const createConcertSchema = Joi.object({
  artistId: Joi.number().integer().positive().required(),
  venue: Joi.string().min(1).max(255).required(),
  city: Joi.string().min(1).max(100).required(),
  country: Joi.string().min(1).max(100).required(),
  date: Joi.date().min('now').required(),
  time: Joi.date().optional(),
  ticketLink: Joi.string().uri().optional(),
  notes: Joi.string().max(2000).optional()
});

const updateConcertSchema = Joi.object({
  venue: Joi.string().min(1).max(255).optional(),
  city: Joi.string().min(1).max(100).optional(),
  country: Joi.string().min(1).max(100).optional(),
  date: Joi.date().min('now').optional(),
  time: Joi.date().optional(),
  ticketLink: Joi.string().uri().optional(),
  notes: Joi.string().max(2000).optional()
});

// Types
interface CreateConcertData {
  artistId: number;
  venue: string;
  city: string;
  country: string;
  date: Date;
  time?: Date;
  ticketLink?: string;
  notes?: string;
}

interface UpdateConcertData {
  venue?: string;
  city?: string;
  country?: string;
  date?: Date;
  time?: Date;
  ticketLink?: string;
  notes?: string;
}

interface ConcertFilters {
  artistId?: number;
  dateFrom?: Date;
  dateTo?: Date;
}

interface PaginatedConcerts {
  concerts: (Concert & { artist?: Artist })[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface ConcertStats {
  total: number;
  upcoming: number;
  thisMonth: number;
}

export class ConcertService {
  static async createConcert(data: CreateConcertData): Promise<Concert> {
    // Validate input data
    const { error, value } = createConcertSchema.validate(data);
    if (error) {
      throw new Error(error.details[0].message);
    }

    // Check if artist exists
    const artist = await prisma.artist.findUnique({
      where: { id: value.artistId }
    });
    
    if (!artist) {
      throw new Error('Artist not found');
    }

    // Validate date is in the future
    if (value.date <= new Date()) {
      throw new Error('Concert date must be in the future');
    }

    try {
      const concert = await prisma.concert.create({
        data: {
          artistId: value.artistId,
          venue: value.venue,
          city: value.city,
          country: value.country,
          date: value.date,
          time: value.time || null,
          ticketLink: value.ticketLink || null,
          notes: value.notes || null
        }
      });

      return concert;
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new Error('Artist not found');
      }
      throw error;
    }
  }

  static async getConcertById(id: number, includeArtist = false): Promise<(Concert & { artist?: Artist }) | null> {
    try {
      const concert = await prisma.concert.findUnique({
        where: { id },
        include: {
          artist: includeArtist
        }
      });

      return concert;
    } catch (error) {
      throw new Error('Failed to fetch concert');
    }
  }

  static async getAllConcerts(
    page = 1, 
    limit = 10, 
    filters: ConcertFilters = {},
    includeArtist = false
  ): Promise<PaginatedConcerts> {
    try {
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};
      
      if (filters.artistId) {
        where.artistId = filters.artistId;
      }

      if (filters.dateFrom || filters.dateTo) {
        where.date = {};
        if (filters.dateFrom) {
          where.date.gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          where.date.lte = filters.dateTo;
        }
      }

      const [concerts, total] = await Promise.all([
        prisma.concert.findMany({
          where,
          include: {
            artist: includeArtist
          },
          orderBy: {
            date: 'asc'
          },
          skip,
          take: limit
        }),
        prisma.concert.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        concerts,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error('Failed to fetch concerts');
    }
  }

  static async getUpcomingConcerts(limit = 10): Promise<Concert[]> {
    try {
      const concerts = await prisma.concert.findMany({
        where: {
          date: {
            gte: new Date()
          }
        },
        orderBy: {
          date: 'asc'
        },
        take: limit
      });

      return concerts;
    } catch (error) {
      throw new Error('Failed to fetch upcoming concerts');
    }
  }

  static async updateConcert(id: number, data: UpdateConcertData): Promise<Concert> {
    // Validate input data
    const { error, value } = updateConcertSchema.validate(data);
    if (error) {
      throw new Error(error.details[0].message);
    }

    // Check if concert exists
    const existingConcert = await prisma.concert.findUnique({
      where: { id }
    });

    if (!existingConcert) {
      throw new Error('Concert not found');
    }

    // Validate date is in the future if being updated
    if (value.date && value.date <= new Date()) {
      throw new Error('Concert date must be in the future');
    }

    try {
      const concert = await prisma.concert.update({
        where: { id },
        data: {
          ...(value.venue && { venue: value.venue }),
          ...(value.city && { city: value.city }),
          ...(value.country && { country: value.country }),
          ...(value.date && { date: value.date }),
          ...(value.time !== undefined && { time: value.time }),
          ...(value.ticketLink !== undefined && { ticketLink: value.ticketLink }),
          ...(value.notes !== undefined && { notes: value.notes })
        }
      });

      return concert;
    } catch (error) {
      throw new Error('Failed to update concert');
    }
  }

  static async deleteConcert(id: number): Promise<void> {
    // Check if concert exists
    const existingConcert = await prisma.concert.findUnique({
      where: { id }
    });

    if (!existingConcert) {
      throw new Error('Concert not found');
    }

    try {
      await prisma.concert.delete({
        where: { id }
      });
    } catch (error) {
      throw new Error('Failed to delete concert');
    }
  }

  static async getConcertsByArtist(artistId: number): Promise<Concert[]> {
    try {
      const concerts = await prisma.concert.findMany({
        where: { artistId },
        orderBy: { date: 'asc' }
      });

      return concerts;
    } catch (error) {
      throw new Error('Failed to fetch concerts for artist');
    }
  }

  static async getConcertStats(): Promise<ConcertStats> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const [total, upcoming, thisMonth] = await Promise.all([
        prisma.concert.count(),
        prisma.concert.count({
          where: {
            date: { gte: now }
          }
        }),
        prisma.concert.count({
          where: {
            date: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          }
        })
      ]);

      return {
        total,
        upcoming,
        thisMonth
      };
    } catch (error) {
      throw new Error('Failed to fetch concert statistics');
    }
  }
}