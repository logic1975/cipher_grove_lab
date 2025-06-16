import { ArtistService } from '../services/artistService'
import { cleanupTestDatabase, testDatabaseConnection } from '../config/database'

describe('ArtistService', () => {
  beforeAll(async () => {
    await testDatabaseConnection()
  })

  beforeEach(async () => {
    await cleanupTestDatabase()
  })

  describe('createArtist', () => {
    it('should create a new artist with valid data', async () => {
      const artistData = {
        name: 'Test Artist',
        bio: 'A great artist from the underground scene',
        imageUrl: '/uploads/artists/1_profile.jpg',
        imageAlt: 'Test artist performing on stage',
        imageSizes: {
          thumbnail: '/uploads/artists/1_thumbnail.jpg',
          profile: '/uploads/artists/1_profile.jpg',
          featured: '/uploads/artists/1_featured.jpg'
        },
        socialLinks: {
          spotify: 'https://open.spotify.com/artist/testartist',
          instagram: 'https://instagram.com/testartist'
        },
        isFeatured: false
      }

      const artist = await ArtistService.createArtist(artistData)

      expect(artist).toMatchObject({
        name: artistData.name,
        bio: artistData.bio,
        imageUrl: artistData.imageUrl,
        imageAlt: artistData.imageAlt,
        isFeatured: false
      })
      expect(artist.id).toBeDefined()
      expect(artist.createdAt).toBeDefined()
      expect(artist.updatedAt).toBeDefined()
    })

    it('should reject duplicate artist names', async () => {
      const artistData = {
        name: 'Duplicate Artist',
        bio: 'First artist'
      }

      await ArtistService.createArtist(artistData)

      await expect(
        ArtistService.createArtist({ name: 'Duplicate Artist', bio: 'Second artist' })
      ).rejects.toThrow('Artist with this name already exists')
    })

    it('should validate social media URLs', async () => {
      const invalidData = {
        name: 'Invalid Social Artist',
        socialLinks: {
          spotify: 'not-a-valid-url'
        }
      }

      await expect(
        ArtistService.createArtist(invalidData)
      ).rejects.toThrow('Validation failed')
    })

    it('should validate image paths', async () => {
      const invalidData = {
        name: 'Invalid Image Artist',
        imageUrl: '/wrong/path/image.jpg'
      }

      await expect(
        ArtistService.createArtist(invalidData)
      ).rejects.toThrow('Validation failed')
    })

    it('should enforce featured artist limit (max 6)', async () => {
      // Create 6 featured artists
      for (let i = 1; i <= 6; i++) {
        await ArtistService.createArtist({
          name: `Featured Artist ${i}`,
          isFeatured: true
        })
      }

      // 7th featured artist should fail
      await expect(
        ArtistService.createArtist({
          name: 'Featured Artist 7',
          isFeatured: true
        })
      ).rejects.toThrow('Maximum of 6 featured artists allowed')
    })

    it('should allow non-featured artist when 6 featured exist', async () => {
      // Create 6 featured artists
      for (let i = 1; i <= 6; i++) {
        await ArtistService.createArtist({
          name: `Featured Artist ${i}`,
          isFeatured: true
        })
      }

      // Non-featured artist should succeed
      const artist = await ArtistService.createArtist({
        name: 'Regular Artist',
        isFeatured: false
      })

      expect(artist.isFeatured).toBe(false)
    })

    it('should validate artist name length', async () => {
      await expect(
        ArtistService.createArtist({ name: '' })
      ).rejects.toThrow('Validation failed')

      await expect(
        ArtistService.createArtist({ name: 'a'.repeat(256) })
      ).rejects.toThrow('Validation failed')
    })

    it('should validate bio length', async () => {
      await expect(
        ArtistService.createArtist({
          name: 'Long Bio Artist',
          bio: 'a'.repeat(5001)
        })
      ).rejects.toThrow('Validation failed')
    })
  })

  describe('getArtists', () => {
    beforeEach(async () => {
      // Create test artists
      await ArtistService.createArtist({
        name: 'Featured Artist 1',
        bio: 'Featured artist bio',
        isFeatured: true
      })
      await ArtistService.createArtist({
        name: 'Regular Artist 1',
        bio: 'Regular artist bio',
        isFeatured: false
      })
      await ArtistService.createArtist({
        name: 'Featured Artist 2',
        bio: 'Another featured artist',
        isFeatured: true
      })
    })

    it('should return paginated artists', async () => {
      const result = await ArtistService.getArtists({ page: 1, limit: 2 })

      expect(result.artists).toHaveLength(2)
      expect(result.pagination).toMatchObject({
        page: 1,
        limit: 2,
        total: 3,
        totalPages: 2,
        hasNext: true,
        hasPrev: false
      })
    })

    it('should filter by featured status', async () => {
      const featuredResult = await ArtistService.getArtists({ featured: true })
      const regularResult = await ArtistService.getArtists({ featured: false })

      expect(featuredResult.artists).toHaveLength(2)
      expect(regularResult.artists).toHaveLength(1)
      
      featuredResult.artists.forEach(artist => {
        expect(artist.isFeatured).toBe(true)
      })
    })

    it('should search by name and bio', async () => {
      const result = await ArtistService.getArtists({ search: 'featured' })

      expect(result.artists.length).toBeGreaterThan(0)
      result.artists.forEach(artist => {
        expect(
          artist.name.toLowerCase().includes('featured') ||
          (artist.bio && artist.bio.toLowerCase().includes('featured'))
        ).toBe(true)
      })
    })

    it('should order featured artists first', async () => {
      const result = await ArtistService.getArtists()

      const featuredCount = result.artists.filter(a => a.isFeatured).length
      const regularCount = result.artists.filter(a => !a.isFeatured).length

      // Featured artists should come first
      for (let i = 0; i < featuredCount; i++) {
        expect(result.artists[i].isFeatured).toBe(true)
      }
    })
  })

  describe('getArtistById', () => {
    let testArtistId: number

    beforeEach(async () => {
      const artist = await ArtistService.createArtist({
        name: 'Test Artist',
        bio: 'Test bio'
      })
      testArtistId = artist.id
    })

    it('should return artist by ID', async () => {
      const artist = await ArtistService.getArtistById(testArtistId)

      expect(artist).toMatchObject({
        id: testArtistId,
        name: 'Test Artist',
        bio: 'Test bio'
      })
    })

    it('should return null for non-existent artist', async () => {
      const artist = await ArtistService.getArtistById(99999)
      expect(artist).toBeNull()
    })
  })

  describe('updateArtist', () => {
    let testArtistId: number

    beforeEach(async () => {
      const artist = await ArtistService.createArtist({
        name: 'Original Artist',
        bio: 'Original bio',
        isFeatured: false
      })
      testArtistId = artist.id
    })

    it('should update artist with valid data', async () => {
      const updateData = {
        name: 'Updated Artist',
        bio: 'Updated bio',
        isFeatured: true
      }

      const updatedArtist = await ArtistService.updateArtist(testArtistId, updateData)

      expect(updatedArtist).toMatchObject(updateData)
      expect(updatedArtist.updatedAt.getTime()).toBeGreaterThan(updatedArtist.createdAt.getTime())
    })

    it('should throw error for non-existent artist', async () => {
      await expect(
        ArtistService.updateArtist(99999, { name: 'Updated Name' })
      ).rejects.toThrow('Artist not found')
    })

    it('should prevent duplicate names on update', async () => {
      await ArtistService.createArtist({ name: 'Existing Artist' })

      await expect(
        ArtistService.updateArtist(testArtistId, { name: 'Existing Artist' })
      ).rejects.toThrow('Artist with this name already exists')
    })

    it('should enforce featured limit on update', async () => {
      // Create 6 featured artists
      for (let i = 1; i <= 6; i++) {
        await ArtistService.createArtist({
          name: `Featured ${i}`,
          isFeatured: true
        })
      }

      await expect(
        ArtistService.updateArtist(testArtistId, { isFeatured: true })
      ).rejects.toThrow('Maximum of 6 featured artists allowed')
    })
  })

  describe('deleteArtist', () => {
    let testArtistId: number

    beforeEach(async () => {
      const artist = await ArtistService.createArtist({
        name: 'Artist to Delete',
        bio: 'Will be deleted'
      })
      testArtistId = artist.id
    })

    it('should delete existing artist', async () => {
      const result = await ArtistService.deleteArtist(testArtistId)
      expect(result).toBe(true)

      const artist = await ArtistService.getArtistById(testArtistId)
      expect(artist).toBeNull()
    })

    it('should throw error for non-existent artist', async () => {
      await expect(
        ArtistService.deleteArtist(99999)
      ).rejects.toThrow('Artist not found')
    })
  })

  describe('getFeaturedArtists', () => {
    beforeEach(async () => {
      // Create mix of featured and regular artists
      for (let i = 1; i <= 3; i++) {
        await ArtistService.createArtist({
          name: `Featured Artist ${i}`,
          isFeatured: true
        })
      }
      for (let i = 1; i <= 2; i++) {
        await ArtistService.createArtist({
          name: `Regular Artist ${i}`,
          isFeatured: false
        })
      }
    })

    it('should return only featured artists', async () => {
      const featuredArtists = await ArtistService.getFeaturedArtists()

      expect(featuredArtists).toHaveLength(3)
      featuredArtists.forEach(artist => {
        expect(artist.isFeatured).toBe(true)
      })
    })

    it('should limit to 6 featured artists', async () => {
      // Add 3 more featured artists (we already have 3 from beforeEach)
      for (let i = 4; i <= 6; i++) {
        await ArtistService.createArtist({
          name: `Featured Artist ${i}`,
          isFeatured: true
        })
      }

      const featuredArtists = await ArtistService.getFeaturedArtists()
      expect(featuredArtists).toHaveLength(6)
      
      // Verify that trying to add a 7th featured artist fails
      await expect(
        ArtistService.createArtist({
          name: 'Featured Artist 7',
          isFeatured: true
        })
      ).rejects.toThrow('Maximum of 6 featured artists allowed')
    })
  })

  describe('updateArtistImage', () => {
    let testArtistId: number

    beforeEach(async () => {
      const artist = await ArtistService.createArtist({
        name: 'Image Test Artist'
      })
      testArtistId = artist.id
    })

    it('should update artist image information', async () => {
      const imageData = {
        imageUrl: '/uploads/artists/1_profile.jpg',
        imageAlt: 'Updated image description',
        imageSizes: {
          thumbnail: '/uploads/artists/1_thumbnail.jpg',
          profile: '/uploads/artists/1_profile.jpg'
        }
      }

      const updatedArtist = await ArtistService.updateArtistImage(testArtistId, imageData)

      expect(updatedArtist.imageUrl).toBe(imageData.imageUrl)
      expect(updatedArtist.imageAlt).toBe(imageData.imageAlt)
      expect(updatedArtist.imageSizes).toMatchObject(imageData.imageSizes)
    })

    it('should validate image URL format', async () => {
      await expect(
        ArtistService.updateArtistImage(testArtistId, {
          imageUrl: '/wrong/format/image.jpg'
        })
      ).rejects.toThrow('Image validation failed')
    })

    it('should throw error for non-existent artist', async () => {
      await expect(
        ArtistService.updateArtistImage(99999, {
          imageUrl: '/uploads/artists/1_profile.jpg'
        })
      ).rejects.toThrow('Artist not found')
    })
  })
})