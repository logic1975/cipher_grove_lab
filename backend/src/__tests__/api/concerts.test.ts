import request from 'supertest';
import app from '../../app';
import { testDatabaseConnection, cleanupTestDatabase } from '../../config/database';
import { ArtistService } from '../../services/artistService';

describe('Concerts API', () => {
  beforeAll(async () => {
    await testDatabaseConnection();
  });

  beforeEach(async () => {
    await cleanupTestDatabase();
  });

  // Helper functions
  const createMockArtist = () => ({
    name: 'Test Artist',
    bio: 'A great test artist',
    socialLinks: { spotify: 'https://open.spotify.com/artist/test' },
    isFeatured: false
  });

  const createMockConcert = (overrides = {}) => ({
    venue: 'Crystal Ballroom',
    city: 'Portland',
    country: 'USA',
    date: '2025-08-15',
    time: '20:00:00',
    ticketLink: 'https://tickets.crystalballroom.com/test',
    notes: 'Test concert with special guests',
    ...overrides
  });

  describe('POST /api/concerts', () => {
    it('should create a concert with valid data', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      const concertData = createMockConcert({ artistId: artist.id });

      const response = await request(app)
        .post('/api/concerts')
        .send(concertData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.artistId).toBe(artist.id);
      expect(response.body.data.venue).toBe('Crystal Ballroom');
      expect(response.body.data.city).toBe('Portland');
      expect(response.body.data.country).toBe('USA');
      expect(response.body.data.ticketLink).toBe('https://tickets.crystalballroom.com/test');
      expect(response.body.data.notes).toBe('Test concert with special guests');
    });

    it('should create a concert without optional fields', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      const concertData = {
        artistId: artist.id,
        venue: 'Simple Venue',
        city: 'Test City',
        country: 'Test Country',
        date: '2025-09-01'
      };

      const response = await request(app)
        .post('/api/concerts')
        .send(concertData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.venue).toBe('Simple Venue');
      expect(response.body.data.time).toBeNull();
      expect(response.body.data.ticketLink).toBeNull();
      expect(response.body.data.notes).toBeNull();
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/concerts')
        .send({
          venue: '',
          city: 'Test City',
          country: 'Test Country',
          date: '2025-08-15'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('"artistId" is required');
    });

    it('should return 400 for non-existent artist', async () => {
      const concertData = createMockConcert({ artistId: 99999 });

      const response = await request(app)
        .post('/api/concerts')
        .send(concertData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Artist not found');
    });

    it('should return 400 for past date', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      const concertData = createMockConcert({ 
        artistId: artist.id,
        date: '2020-01-01'
      });

      const response = await request(app)
        .post('/api/concerts')
        .send(concertData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('"date" must be greater than or equal to "now"');
    });
  });

  describe('GET /api/concerts', () => {
    it('should return paginated concerts', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      
      // Create multiple concerts via API
      await Promise.all([
        request(app).post('/api/concerts').send(createMockConcert({ 
          artistId: artist.id, 
          venue: 'Venue 1',
          date: '2025-08-15'
        })),
        request(app).post('/api/concerts').send(createMockConcert({ 
          artistId: artist.id, 
          venue: 'Venue 2',
          date: '2025-08-20'
        })),
        request(app).post('/api/concerts').send(createMockConcert({ 
          artistId: artist.id, 
          venue: 'Venue 3',
          date: '2025-08-25'
        }))
      ]);

      const response = await request(app)
        .get('/api/concerts?page=1&limit=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.total).toBe(3);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.totalPages).toBe(2);
      expect(response.body.pagination.hasNext).toBe(true);
      expect(response.body.pagination.hasPrev).toBe(false);
    });

    it('should filter concerts by artist', async () => {
      const artist1 = await ArtistService.createArtist(createMockArtist());
      const artist2 = await ArtistService.createArtist({
        ...createMockArtist(),
        name: 'Another Artist'
      });
      
      await Promise.all([
        request(app).post('/api/concerts').send(createMockConcert({ 
          artistId: artist1.id, 
          venue: 'Artist 1 Concert'
        })),
        request(app).post('/api/concerts').send(createMockConcert({ 
          artistId: artist2.id, 
          venue: 'Artist 2 Concert'
        }))
      ]);

      const response = await request(app)
        .get(`/api/concerts?artistId=${artist1.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].venue).toBe('Artist 1 Concert');
      expect(response.body.data[0].artistId).toBe(artist1.id);
    });

    it('should filter concerts by date range', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      
      await Promise.all([
        request(app).post('/api/concerts').send(createMockConcert({ 
          artistId: artist.id, 
          venue: 'August Concert',
          date: '2025-08-15'
        })),
        request(app).post('/api/concerts').send(createMockConcert({ 
          artistId: artist.id, 
          venue: 'September Concert',
          date: '2025-09-15'
        })),
        request(app).post('/api/concerts').send(createMockConcert({ 
          artistId: artist.id, 
          venue: 'October Concert',
          date: '2025-10-15'
        }))
      ]);

      const response = await request(app)
        .get('/api/concerts?dateFrom=2025-09-01&dateTo=2025-09-30')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].venue).toBe('September Concert');
    });

    it('should include artist data when requested', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      await request(app).post('/api/concerts').send(createMockConcert({ artistId: artist.id }));

      const response = await request(app)
        .get('/api/concerts?includeArtist=true')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data[0].artist).toBeDefined();
      expect(response.body.data[0].artist.name).toBe('Test Artist');
    });
  });

  describe('GET /api/concerts/upcoming', () => {
    it('should return upcoming concerts', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      
      await request(app).post('/api/concerts').send(createMockConcert({ 
        artistId: artist.id, 
        venue: 'Future Concert',
        date: '2025-12-15'
      }));

      const response = await request(app)
        .get('/api/concerts/upcoming')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].venue).toBe('Future Concert');
    });

    it('should respect limit parameter', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      
      await Promise.all([
        request(app).post('/api/concerts').send(createMockConcert({ 
          artistId: artist.id, 
          venue: 'Concert 1',
          date: '2025-10-10'
        })),
        request(app).post('/api/concerts').send(createMockConcert({ 
          artistId: artist.id, 
          venue: 'Concert 2',
          date: '2025-10-20'
        })),
        request(app).post('/api/concerts').send(createMockConcert({ 
          artistId: artist.id, 
          venue: 'Concert 3',
          date: '2025-10-30'
        }))
      ]);

      const response = await request(app)
        .get('/api/concerts/upcoming?limit=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('GET /api/concerts/stats', () => {
    it('should return concert statistics', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      
      await Promise.all([
        request(app).post('/api/concerts').send(createMockConcert({ 
          artistId: artist.id,
          date: '2025-12-15'
        })),
        request(app).post('/api/concerts').send(createMockConcert({ 
          artistId: artist.id,
          date: '2025-11-20'
        }))
      ]);

      const response = await request(app)
        .get('/api/concerts/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBe(2);
      expect(response.body.data.upcoming).toBe(2);
      expect(response.body.data.thisMonth).toBeDefined();
    });
  });

  describe('GET /api/concerts/:id', () => {
    it('should return concert by id', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      const createResponse = await request(app)
        .post('/api/concerts')
        .send(createMockConcert({ artistId: artist.id }));

      const concertId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/concerts/${concertId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(concertId);
      expect(response.body.data.venue).toBe('Crystal Ballroom');
    });

    it('should return 404 for non-existent concert', async () => {
      const response = await request(app)
        .get('/api/concerts/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Concert not found');
    });

    it('should include artist data when requested', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      const createResponse = await request(app)
        .post('/api/concerts')
        .send(createMockConcert({ artistId: artist.id }));

      const concertId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/concerts/${concertId}?includeArtist=true`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.artist).toBeDefined();
      expect(response.body.data.artist.name).toBe('Test Artist');
    });
  });

  describe('PUT /api/concerts/:id', () => {
    it('should update concert', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      const createResponse = await request(app)
        .post('/api/concerts')
        .send(createMockConcert({ artistId: artist.id }));

      const concertId = createResponse.body.data.id;
      const updateData = {
        venue: 'Updated Venue',
        city: 'Updated City',
        notes: 'Updated notes'
      };

      const response = await request(app)
        .put(`/api/concerts/${concertId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.venue).toBe('Updated Venue');
      expect(response.body.data.city).toBe('Updated City');
      expect(response.body.data.notes).toBe('Updated notes');
      expect(response.body.data.country).toBe('USA'); // Should remain unchanged
    });

    it('should return 404 for non-existent concert', async () => {
      const response = await request(app)
        .put('/api/concerts/99999')
        .send({ venue: 'Test' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Concert not found');
    });

    it('should validate update data', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      const createResponse = await request(app)
        .post('/api/concerts')
        .send(createMockConcert({ artistId: artist.id }));

      const concertId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/concerts/${concertId}`)
        .send({ ticketLink: 'invalid-url' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('"ticketLink" must be a valid uri');
    });
  });

  describe('DELETE /api/concerts/:id', () => {
    it('should delete concert', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());
      const createResponse = await request(app)
        .post('/api/concerts')
        .send(createMockConcert({ artistId: artist.id }));

      const concertId = createResponse.body.data.id;

      await request(app)
        .delete(`/api/concerts/${concertId}`)
        .expect(204);

      // Verify concert is deleted
      await request(app)
        .get(`/api/concerts/${concertId}`)
        .expect(404);
    });

    it('should return 404 for non-existent concert', async () => {
      const response = await request(app)
        .delete('/api/concerts/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Concert not found');
    });
  });

  describe('GET /api/concerts/artist/:artistId', () => {
    it('should return concerts for specific artist', async () => {
      const artist1 = await ArtistService.createArtist(createMockArtist());
      const artist2 = await ArtistService.createArtist({
        ...createMockArtist(),
        name: 'Another Artist'
      });
      
      await Promise.all([
        request(app).post('/api/concerts').send(createMockConcert({ 
          artistId: artist1.id, 
          venue: 'Artist 1 Concert 1'
        })),
        request(app).post('/api/concerts').send(createMockConcert({ 
          artistId: artist1.id, 
          venue: 'Artist 1 Concert 2'
        })),
        request(app).post('/api/concerts').send(createMockConcert({ 
          artistId: artist2.id, 
          venue: 'Artist 2 Concert'
        }))
      ]);

      const response = await request(app)
        .get(`/api/concerts/artist/${artist1.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      const venues = response.body.data.map((c: any) => c.venue);
      expect(venues).toContain('Artist 1 Concert 1');
      expect(venues).toContain('Artist 1 Concert 2');
      expect(response.body.data.every((c: any) => c.artistId === artist1.id)).toBe(true);
    });

    it('should return empty array for artist with no concerts', async () => {
      const artist = await ArtistService.createArtist(createMockArtist());

      const response = await request(app)
        .get(`/api/concerts/artist/${artist.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });
  });
});