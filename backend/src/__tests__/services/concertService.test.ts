import { ConcertService } from '../../services/concertService';
import { testDatabaseConnection, cleanupTestDatabase } from '../../config/database';
import { ArtistService } from '../../services/artistService';

describe('ConcertService', () => {
  beforeAll(async () => {
    await testDatabaseConnection();
  });

  beforeEach(async () => {
    await cleanupTestDatabase();
  });

  // Helper function to create test data
  const createMockConcert = (overrides = {}) => ({
    venue: 'Crystal Ballroom',
    city: 'Portland',
    country: 'USA',
    date: new Date('2025-08-15'),
    time: new Date('1970-01-01T20:00:00'),
    ticketLink: 'https://tickets.crystalballroom.com/test',
    notes: 'Test concert with special guests',
    ...overrides
  });

  const createMockArtist = () => ({
    name: 'Test Artist',
    bio: 'A great test artist from the underground scene',
    socialLinks: { spotify: 'https://open.spotify.com/artist/test' },
    isFeatured: false
  });

  describe('createConcert', () => {
    it('should create a concert with valid data', async () => {
      // Setup: Create an artist first
      const artist = await ArtistService.createArtist(createMockArtist());
      const concertData = createMockConcert({ artistId: artist.id });

      // Action
      const concert = await ConcertService.createConcert(concertData);

      // Assertions
      expect(concert).toBeDefined();
      expect(concert.id).toBeDefined();
      expect(concert.artistId).toBe(artist.id);
      expect(concert.venue).toBe('Crystal Ballroom');
      expect(concert.city).toBe('Portland');
      expect(concert.country).toBe('USA');
      expect(concert.date).toEqual(new Date('2025-08-15'));
      expect(concert.ticketLink).toBe('https://tickets.crystalballroom.com/test');
      expect(concert.notes).toBe('Test concert with special guests');
      expect(concert.createdAt).toBeDefined();
      expect(concert.updatedAt).toBeDefined();
    });

    it('should create a concert without optional fields', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      const concertData = {
        artistId: artist.id,
        venue: 'Simple Venue',
        city: 'Test City',
        country: 'Test Country',
        date: new Date('2025-09-01')
        // No time, ticketLink, or notes
      };

      const concert = await ConcertService.createConcert(concertData);

      expect(concert.venue).toBe('Simple Venue');
      expect(concert.time).toBeNull();
      expect(concert.ticketLink).toBeNull();
      expect(concert.notes).toBeNull();
    });

    it('should throw error for non-existent artist', async () => {
      const concertData = createMockConcert({ artistId: 99999 });

      await expect(ConcertService.createConcert(concertData))
        .rejects.toThrow('Artist not found');
    });

    it('should throw error for past date', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      const concertData = createMockConcert({ 
        artistId: artist.id,
        date: new Date('2020-01-01') // Past date
      });

      await expect(ConcertService.createConcert(concertData))
        .rejects.toThrow('"date" must be greater than or equal to "now"');
    });

    it('should validate required fields', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());

      // Test missing venue
      await expect(ConcertService.createConcert({
        artistId: artist.id,
        venue: '',
        city: 'Test City',
        country: 'Test Country',
        date: new Date('2025-08-15')
      })).rejects.toThrow('"venue" is not allowed to be empty');

      // Test missing city
      await expect(ConcertService.createConcert({
        artistId: artist.id,
        venue: 'Test Venue',
        city: '',
        country: 'Test Country',
        date: new Date('2025-08-15')
      })).rejects.toThrow('"city" is not allowed to be empty');

      // Test missing country
      await expect(ConcertService.createConcert({
        artistId: artist.id,
        venue: 'Test Venue',
        city: 'Test City',
        country: '',
        date: new Date('2025-08-15')
      })).rejects.toThrow('"country" is not allowed to be empty');
    });

    it('should validate ticket link URL format', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      const concertData = createMockConcert({ 
        artistId: artist.id,
        ticketLink: 'invalid-url'
      });

      await expect(ConcertService.createConcert(concertData))
        .rejects.toThrow('"ticketLink" must be a valid uri');
    });
  });

  describe('getConcertById', () => {
    it('should return concert by id', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      const createdConcert = await ConcertService.createConcert(createMockConcert({ artistId: artist.id }));

      const concert = await ConcertService.getConcertById(createdConcert.id);

      expect(concert).toBeDefined();
      expect(concert?.id).toBe(createdConcert.id);
      expect(concert?.venue).toBe('Crystal Ballroom');
    });

    it('should return null for non-existent concert', async () => {
      const concert = await ConcertService.getConcertById(99999);
      expect(concert).toBeNull();
    });

    it('should include artist data when requested', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      const createdConcert = await ConcertService.createConcert(createMockConcert({ artistId: artist.id }));

      const concert = await ConcertService.getConcertById(createdConcert.id, true);

      expect(concert).toBeDefined();
      expect(concert?.artist).toBeDefined();
      expect(concert?.artist?.name).toBe('Test Artist');
    });
  });

  describe('getAllConcerts', () => {
    it('should return paginated concerts', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      
      // Create multiple concerts
      await Promise.all([
        ConcertService.createConcert(createMockConcert({ 
          artistId: artist.id, 
          venue: 'Venue 1',
          date: new Date('2025-08-15')
        })),
        ConcertService.createConcert(createMockConcert({ 
          artistId: artist.id, 
          venue: 'Venue 2',
          date: new Date('2025-08-20')
        })),
        ConcertService.createConcert(createMockConcert({ 
          artistId: artist.id, 
          venue: 'Venue 3',
          date: new Date('2025-08-25')
        }))
      ]);

      const result = await ConcertService.getAllConcerts(1, 2);

      expect(result.concerts).toHaveLength(2);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(2);
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(false);
    });

    it('should return concerts sorted by date ascending by default', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      
      await Promise.all([
        ConcertService.createConcert(createMockConcert({ 
          artistId: artist.id, 
          venue: 'Later Concert',
          date: new Date('2025-09-01')
        })),
        ConcertService.createConcert(createMockConcert({ 
          artistId: artist.id, 
          venue: 'Earlier Concert',
          date: new Date('2025-08-01')
        }))
      ]);

      const result = await ConcertService.getAllConcerts();

      expect(result.concerts[0].venue).toBe('Earlier Concert');
      expect(result.concerts[1].venue).toBe('Later Concert');
    });

    it('should filter by artist id', async () => {
      const artist1 = await ArtistService.createArtist(createMockArtist());
      const artist2 = await ArtistService.createArtist({
        ...createMockArtist(),
        name: 'Another Test Artist'
      });
      
      await Promise.all([
        ConcertService.createConcert(createMockConcert({ 
          artistId: artist1.id, 
          venue: 'Artist 1 Concert'
        })),
        ConcertService.createConcert(createMockConcert({ 
          artistId: artist2.id, 
          venue: 'Artist 2 Concert'
        }))
      ]);

      const result = await ConcertService.getAllConcerts(1, 10, { artistId: artist1.id });

      expect(result.concerts).toHaveLength(1);
      expect(result.concerts[0].venue).toBe('Artist 1 Concert');
      expect(result.concerts[0].artistId).toBe(artist1.id);
    });

    it('should filter by date range', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      
      await Promise.all([
        ConcertService.createConcert(createMockConcert({ 
          artistId: artist.id, 
          venue: 'August Concert',
          date: new Date('2025-08-15')
        })),
        ConcertService.createConcert(createMockConcert({ 
          artistId: artist.id, 
          venue: 'September Concert',
          date: new Date('2025-09-15')
        })),
        ConcertService.createConcert(createMockConcert({ 
          artistId: artist.id, 
          venue: 'October Concert',
          date: new Date('2025-10-15')
        }))
      ]);

      const result = await ConcertService.getAllConcerts(1, 10, {
        dateFrom: new Date('2025-09-01'),
        dateTo: new Date('2025-09-30')
      });

      expect(result.concerts).toHaveLength(1);
      expect(result.concerts[0].venue).toBe('September Concert');
    });

    it('should include artist data when requested', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      await ConcertService.createConcert(createMockConcert({ artistId: artist.id }));

      const result = await ConcertService.getAllConcerts(1, 10, {}, true);

      expect(result.concerts[0].artist).toBeDefined();
      expect(result.concerts[0].artist?.name).toBe('Test Artist');
    });
  });

  describe('getUpcomingConcerts', () => {
    it('should return only future concerts', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      
      await Promise.all([
        ConcertService.createConcert(createMockConcert({ 
          artistId: artist.id, 
          venue: 'Future Concert',
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        }))
      ]);

      const result = await ConcertService.getUpcomingConcerts(10);

      expect(result).toHaveLength(1);
      expect(result[0].venue).toBe('Future Concert');
    });

    it('should respect limit parameter', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      
      await Promise.all([
        ConcertService.createConcert(createMockConcert({ 
          artistId: artist.id, 
          venue: 'Concert 1',
          date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
        })),
        ConcertService.createConcert(createMockConcert({ 
          artistId: artist.id, 
          venue: 'Concert 2',
          date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
        })),
        ConcertService.createConcert(createMockConcert({ 
          artistId: artist.id, 
          venue: 'Concert 3',
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }))
      ]);

      const result = await ConcertService.getUpcomingConcerts(2);

      expect(result).toHaveLength(2);
    });
  });

  describe('updateConcert', () => {
    it('should update concert fields', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      const createdConcert = await ConcertService.createConcert(createMockConcert({ artistId: artist.id }));

      const updateData = {
        venue: 'Updated Venue',
        city: 'Updated City',
        notes: 'Updated notes'
      };

      const updatedConcert = await ConcertService.updateConcert(createdConcert.id, updateData);

      expect(updatedConcert.venue).toBe('Updated Venue');
      expect(updatedConcert.city).toBe('Updated City');
      expect(updatedConcert.notes).toBe('Updated notes');
      expect(updatedConcert.country).toBe('USA'); // Should remain unchanged
    });

    it('should throw error for non-existent concert', async () => {
      await expect(ConcertService.updateConcert(99999, { venue: 'Test' }))
        .rejects.toThrow('Concert not found');
    });

    it('should validate updated data', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      const createdConcert = await ConcertService.createConcert(createMockConcert({ artistId: artist.id }));

      await expect(ConcertService.updateConcert(createdConcert.id, {
        ticketLink: 'invalid-url'
      })).rejects.toThrow('"ticketLink" must be a valid uri');
    });
  });

  describe('deleteConcert', () => {
    it('should delete concert', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      const createdConcert = await ConcertService.createConcert(createMockConcert({ artistId: artist.id }));

      await ConcertService.deleteConcert(createdConcert.id);

      const deletedConcert = await ConcertService.getConcertById(createdConcert.id);
      expect(deletedConcert).toBeNull();
    });

    it('should throw error for non-existent concert', async () => {
      await expect(ConcertService.deleteConcert(99999))
        .rejects.toThrow('Concert not found');
    });
  });

  describe('getConcertsByArtist', () => {
    it('should return concerts for specific artist', async () => {
      const artist1 = await ArtistService.createArtist(createMockArtist());
      const artist2 = await ArtistService.createArtist({
        ...createMockArtist(),
        name: 'Another Artist'
      });
      
      await Promise.all([
        ConcertService.createConcert(createMockConcert({ 
          artistId: artist1.id, 
          venue: 'Artist 1 Concert 1'
        })),
        ConcertService.createConcert(createMockConcert({ 
          artistId: artist1.id, 
          venue: 'Artist 1 Concert 2'
        })),
        ConcertService.createConcert(createMockConcert({ 
          artistId: artist2.id, 
          venue: 'Artist 2 Concert'
        }))
      ]);

      const concerts = await ConcertService.getConcertsByArtist(artist1.id);

      expect(concerts).toHaveLength(2);
      expect(concerts[0].venue).toBe('Artist 1 Concert 1');
      expect(concerts[1].venue).toBe('Artist 1 Concert 2');
      expect(concerts.every(c => c.artistId === artist1.id)).toBe(true);
    });

    it('should return empty array for artist with no concerts', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      const concerts = await ConcertService.getConcertsByArtist(artist.id);

      expect(concerts).toHaveLength(0);
    });
  });

  describe('getConcertStats', () => {
    it('should return concert statistics', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      
      await Promise.all([
        ConcertService.createConcert(createMockConcert({ 
          artistId: artist.id,
          date: new Date('2025-12-15') // Far future (December)
        })),
        ConcertService.createConcert(createMockConcert({ 
          artistId: artist.id,
          date: new Date('2025-11-20') // Far future (November)
        }))
      ]);

      const stats = await ConcertService.getConcertStats();

      expect(stats.total).toBe(2);
      expect(stats.upcoming).toBe(2);
      expect(stats.thisMonth).toBe(0); // Concerts are in future months
    });
  });
});