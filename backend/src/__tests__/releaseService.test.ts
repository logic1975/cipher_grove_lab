import { ReleaseService } from '../services/releaseService'
import { ArtistService } from '../services/artistService'
import { cleanupTestDatabase, testDatabaseConnection } from '../config/database'
import { ReleaseType } from '@prisma/client'

describe('ReleaseService', () => {
  let testArtistId: number
  let secondArtistId: number

  beforeAll(async () => {
    await testDatabaseConnection()
  })

  beforeEach(async () => {
    await cleanupTestDatabase()
    
    // Create test artists
    const artist1 = await ArtistService.createArtist({
      name: 'Test Artist 1',
      bio: 'First test artist'
    })
    testArtistId = artist1.id

    const artist2 = await ArtistService.createArtist({
      name: 'Test Artist 2',
      bio: 'Second test artist'
    })
    secondArtistId = artist2.id
  })

  describe('createRelease', () => {
    it('should create a new release with valid data', async () => {
      const releaseData = {
        artistId: testArtistId,
        title: 'Test Album',
        type: 'album' as ReleaseType,
        releaseDate: new Date('2024-06-15'),
        coverArtUrl: '/uploads/releases/1_medium.jpg',
        coverArtAlt: 'Test album cover art',
        coverArtSizes: {
          small: '/uploads/releases/1_small.jpg',
          medium: '/uploads/releases/1_medium.jpg',
          large: '/uploads/releases/1_large.jpg'
        },
        streamingLinks: {
          spotify: 'https://open.spotify.com/album/testalbum',
          appleMusic: 'https://music.apple.com/album/testalbum'
        },
        description: 'A great test album'
      }

      const release = await ReleaseService.createRelease(releaseData)

      expect(release).toMatchObject({
        artistId: testArtistId,
        title: 'Test Album',
        type: 'album',
        description: 'A great test album'
      })
      expect(release.id).toBeDefined()
      expect(release.createdAt).toBeDefined()
      expect(release.artist).toBeDefined()
      expect(release.artist?.name).toBe('Test Artist 1')
    })

    it('should reject release for non-existent artist', async () => {
      await expect(
        ReleaseService.createRelease({
          artistId: 99999,
          title: 'Test Release',
          type: 'single',
          releaseDate: new Date()
        })
      ).rejects.toThrow('Artist not found')
    })

    it('should reject duplicate title for same artist', async () => {
      const releaseData = {
        artistId: testArtistId,
        title: 'Duplicate Title',
        type: 'album' as ReleaseType,
        releaseDate: new Date()
      }

      await ReleaseService.createRelease(releaseData)

      await expect(
        ReleaseService.createRelease({
          ...releaseData,
          type: 'single' as ReleaseType
        })
      ).rejects.toThrow('Release with this title already exists for this artist')
    })

    it('should allow same title for different artists', async () => {
      const releaseData = {
        title: 'Same Title',
        type: 'album' as ReleaseType,
        releaseDate: new Date()
      }

      const release1 = await ReleaseService.createRelease({
        ...releaseData,
        artistId: testArtistId
      })

      const release2 = await ReleaseService.createRelease({
        ...releaseData,
        artistId: secondArtistId
      })

      expect(release1.title).toBe(release2.title)
      expect(release1.artistId).not.toBe(release2.artistId)
    })

    it('should validate release types', async () => {
      await expect(
        ReleaseService.createRelease({
          artistId: testArtistId,
          title: 'Invalid Type Release',
          type: 'invalid' as ReleaseType,
          releaseDate: new Date()
        })
      ).rejects.toThrow('Validation failed')
    })

    it('should validate release date range', async () => {
      // Too far in the past
      await expect(
        ReleaseService.createRelease({
          artistId: testArtistId,
          title: 'Old Release',
          type: 'album',
          releaseDate: new Date('1800-01-01')
        })
      ).rejects.toThrow('Validation failed')

      // Too far in the future (more than 2 years)
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 3)
      
      await expect(
        ReleaseService.createRelease({
          artistId: testArtistId,
          title: 'Future Release',
          type: 'album',
          releaseDate: futureDate
        })
      ).rejects.toThrow('Validation failed')
    })

    it('should validate streaming platform URLs', async () => {
      await expect(
        ReleaseService.createRelease({
          artistId: testArtistId,
          title: 'Invalid Streaming Links',
          type: 'single',
          releaseDate: new Date(),
          streamingLinks: {
            spotify: 'not-a-valid-url'
          }
        })
      ).rejects.toThrow('Validation failed')
    })

    it('should validate cover art paths', async () => {
      await expect(
        ReleaseService.createRelease({
          artistId: testArtistId,
          title: 'Invalid Cover Art',
          type: 'single',
          releaseDate: new Date(),
          coverArtUrl: '/wrong/path/image.jpg'
        })
      ).rejects.toThrow('Validation failed')
    })

    it('should validate title length', async () => {
      await expect(
        ReleaseService.createRelease({
          artistId: testArtistId,
          title: '',
          type: 'single',
          releaseDate: new Date()
        })
      ).rejects.toThrow('Validation failed')

      await expect(
        ReleaseService.createRelease({
          artistId: testArtistId,
          title: 'a'.repeat(256),
          type: 'single',
          releaseDate: new Date()
        })
      ).rejects.toThrow('Validation failed')
    })

    it('should validate description length', async () => {
      await expect(
        ReleaseService.createRelease({
          artistId: testArtistId,
          title: 'Long Description Release',
          type: 'album',
          releaseDate: new Date(),
          description: 'a'.repeat(2001)
        })
      ).rejects.toThrow('Validation failed')
    })
  })

  describe('getReleases', () => {
    beforeEach(async () => {
      // Create test releases
      await ReleaseService.createRelease({
        artistId: testArtistId,
        title: 'Album 1',
        type: 'album',
        releaseDate: new Date('2024-01-15')
      })
      await ReleaseService.createRelease({
        artistId: testArtistId,
        title: 'Single 1',
        type: 'single',
        releaseDate: new Date('2024-03-10')
      })
      await ReleaseService.createRelease({
        artistId: secondArtistId,
        title: 'EP 1',
        type: 'ep',
        releaseDate: new Date('2024-02-20')
      })
    })

    it('should return paginated releases', async () => {
      const result = await ReleaseService.getReleases({ page: 1, limit: 2 })

      expect(result.releases).toHaveLength(2)
      expect(result.pagination).toMatchObject({
        page: 1,
        limit: 2,
        total: 3,
        totalPages: 2,
        hasNext: true,
        hasPrev: false
      })
    })

    it('should filter by artist ID', async () => {
      const result = await ReleaseService.getReleases({ artistId: testArtistId })

      expect(result.releases).toHaveLength(2)
      result.releases.forEach(release => {
        expect(release.artistId).toBe(testArtistId)
      })
    })

    it('should filter by release type', async () => {
      const albumResult = await ReleaseService.getReleases({ type: 'album' })
      const singleResult = await ReleaseService.getReleases({ type: 'single' })

      expect(albumResult.releases).toHaveLength(1)
      expect(singleResult.releases).toHaveLength(1)
      expect(albumResult.releases[0].type).toBe('album')
      expect(singleResult.releases[0].type).toBe('single')
    })

    it('should filter by release date', async () => {
      const result = await ReleaseService.getReleases({ releaseDate: '2024-01-15' })

      expect(result.releases).toHaveLength(1)
      expect(result.releases[0].title).toBe('Album 1')
    })

    it('should sort releases correctly', async () => {
      const newestResult = await ReleaseService.getReleases({ sort: 'newest' })
      const oldestResult = await ReleaseService.getReleases({ sort: 'oldest' })
      const titleResult = await ReleaseService.getReleases({ sort: 'title' })

      // Newest first
      expect(newestResult.releases[0].title).toBe('Single 1') // March 10
      expect(newestResult.releases[1].title).toBe('EP 1')     // February 20
      expect(newestResult.releases[2].title).toBe('Album 1')  // January 15

      // Oldest first
      expect(oldestResult.releases[0].title).toBe('Album 1')  // January 15
      expect(oldestResult.releases[1].title).toBe('EP 1')     // February 20
      expect(oldestResult.releases[2].title).toBe('Single 1') // March 10

      // Title alphabetical
      expect(titleResult.releases[0].title).toBe('Album 1')
      expect(titleResult.releases[1].title).toBe('EP 1')
      expect(titleResult.releases[2].title).toBe('Single 1')
    })

    it('should include artist information by default', async () => {
      const result = await ReleaseService.getReleases()

      expect((result.releases[0] as any).artist).toBeDefined()
      expect((result.releases[0] as any).artist?.name).toBeDefined()
    })

    it('should optionally exclude artist information', async () => {
      const result = await ReleaseService.getReleases({ includeArtist: false })

      expect((result.releases[0] as any).artist).toBeUndefined()
    })
  })

  describe('getReleaseById', () => {
    let testReleaseId: number

    beforeEach(async () => {
      const release = await ReleaseService.createRelease({
        artistId: testArtistId,
        title: 'Test Release',
        type: 'album',
        releaseDate: new Date()
      })
      testReleaseId = release.id
    })

    it('should return release by ID with artist', async () => {
      const release = await ReleaseService.getReleaseById(testReleaseId)

      expect(release).toMatchObject({
        id: testReleaseId,
        title: 'Test Release',
        type: 'album'
      })
      expect((release as any)?.artist).toBeDefined()
      expect((release as any)?.artist?.name).toBe('Test Artist 1')
    })

    it('should return null for non-existent release', async () => {
      const release = await ReleaseService.getReleaseById(99999)
      expect(release).toBeNull()
    })

    it('should optionally exclude artist information', async () => {
      const release = await ReleaseService.getReleaseById(testReleaseId, false)

      expect(release?.id).toBe(testReleaseId)
      expect((release as any)?.artist).toBeUndefined()
    })
  })

  describe('getReleasesByArtist', () => {
    beforeEach(async () => {
      await ReleaseService.createRelease({
        artistId: testArtistId,
        title: 'Artist 1 Album',
        type: 'album',
        releaseDate: new Date()
      })
      await ReleaseService.createRelease({
        artistId: testArtistId,
        title: 'Artist 1 Single',
        type: 'single',
        releaseDate: new Date()
      })
      await ReleaseService.createRelease({
        artistId: secondArtistId,
        title: 'Artist 2 Album',
        type: 'album',
        releaseDate: new Date()
      })
    })

    it('should return releases for specific artist', async () => {
      const result = await ReleaseService.getReleasesByArtist(testArtistId)

      expect(result.releases).toHaveLength(2)
      result.releases.forEach(release => {
        expect(release.artistId).toBe(testArtistId)
      })
    })

    it('should filter by type for artist releases', async () => {
      const result = await ReleaseService.getReleasesByArtist(testArtistId, { type: 'album' })

      expect(result.releases).toHaveLength(1)
      expect(result.releases[0].type).toBe('album')
    })
  })

  describe('updateRelease', () => {
    let testReleaseId: number

    beforeEach(async () => {
      const release = await ReleaseService.createRelease({
        artistId: testArtistId,
        title: 'Original Title',
        type: 'album',
        releaseDate: new Date('2024-01-01'),
        description: 'Original description'
      })
      testReleaseId = release.id
    })

    it('should update release with valid data', async () => {
      const updateData = {
        title: 'Updated Title',
        type: 'single' as ReleaseType,
        description: 'Updated description'
      }

      const updatedRelease = await ReleaseService.updateRelease(testReleaseId, updateData)

      expect(updatedRelease).toMatchObject(updateData)
      expect(updatedRelease.updatedAt.getTime()).toBeGreaterThan(updatedRelease.createdAt.getTime())
    })

    it('should throw error for non-existent release', async () => {
      await expect(
        ReleaseService.updateRelease(99999, { title: 'Updated Title' })
      ).rejects.toThrow('Release not found')
    })

    it('should prevent duplicate titles for same artist', async () => {
      await ReleaseService.createRelease({
        artistId: testArtistId,
        title: 'Existing Title',
        type: 'single',
        releaseDate: new Date()
      })

      await expect(
        ReleaseService.updateRelease(testReleaseId, { title: 'Existing Title' })
      ).rejects.toThrow('Release with this title already exists for this artist')
    })

    it('should allow changing artist', async () => {
      const updatedRelease = await ReleaseService.updateRelease(testReleaseId, {
        artistId: secondArtistId
      })

      expect(updatedRelease.artistId).toBe(secondArtistId)
      expect((updatedRelease as any).artist?.name).toBe('Test Artist 2')
    })

    it('should throw error when changing to non-existent artist', async () => {
      await expect(
        ReleaseService.updateRelease(testReleaseId, { artistId: 99999 })
      ).rejects.toThrow('New artist not found')
    })

    it('should validate updated data', async () => {
      await expect(
        ReleaseService.updateRelease(testReleaseId, { type: 'invalid' as ReleaseType })
      ).rejects.toThrow('Validation failed')
    })
  })

  describe('deleteRelease', () => {
    let testReleaseId: number

    beforeEach(async () => {
      const release = await ReleaseService.createRelease({
        artistId: testArtistId,
        title: 'Release to Delete',
        type: 'single',
        releaseDate: new Date()
      })
      testReleaseId = release.id
    })

    it('should delete existing release', async () => {
      const result = await ReleaseService.deleteRelease(testReleaseId)
      expect(result).toBe(true)

      const release = await ReleaseService.getReleaseById(testReleaseId)
      expect(release).toBeNull()
    })

    it('should throw error for non-existent release', async () => {
      await expect(
        ReleaseService.deleteRelease(99999)
      ).rejects.toThrow('Release not found')
    })
  })

  describe('getLatestReleases', () => {
    beforeEach(async () => {
      // Create releases with different dates
      await ReleaseService.createRelease({
        artistId: testArtistId,
        title: 'Oldest Release',
        type: 'album',
        releaseDate: new Date('2024-01-01')
      })
      await ReleaseService.createRelease({
        artistId: testArtistId,
        title: 'Middle Release',
        type: 'single',
        releaseDate: new Date('2024-02-01')
      })
      await ReleaseService.createRelease({
        artistId: secondArtistId,
        title: 'Latest Release',
        type: 'ep',
        releaseDate: new Date('2024-03-01')
      })
    })

    it('should return latest releases in descending order', async () => {
      const releases = await ReleaseService.getLatestReleases(2)

      expect(releases).toHaveLength(2)
      expect(releases[0].title).toBe('Latest Release')
      expect(releases[1].title).toBe('Middle Release')
    })

    it('should include artist information', async () => {
      const releases = await ReleaseService.getLatestReleases()

      releases.forEach(release => {
        expect(release.artist).toBeDefined()
        expect(release.artist?.name).toBeDefined()
      })
    })
  })

  describe('getReleasesByType', () => {
    beforeEach(async () => {
      await ReleaseService.createRelease({
        artistId: testArtistId,
        title: 'Test Album',
        type: 'album',
        releaseDate: new Date()
      })
      await ReleaseService.createRelease({
        artistId: testArtistId,
        title: 'Test Single',
        type: 'single',
        releaseDate: new Date()
      })
      await ReleaseService.createRelease({
        artistId: secondArtistId,
        title: 'Test EP',
        type: 'ep',
        releaseDate: new Date()
      })
    })

    it('should return releases of specified type', async () => {
      const albums = await ReleaseService.getReleasesByType('album')
      const singles = await ReleaseService.getReleasesByType('single')
      const eps = await ReleaseService.getReleasesByType('ep')

      expect(albums.releases).toHaveLength(1)
      expect(singles.releases).toHaveLength(1)
      expect(eps.releases).toHaveLength(1)

      expect(albums.releases[0].type).toBe('album')
      expect(singles.releases[0].type).toBe('single')
      expect(eps.releases[0].type).toBe('ep')
    })
  })

  describe('updateReleaseCoverArt', () => {
    let testReleaseId: number

    beforeEach(async () => {
      const release = await ReleaseService.createRelease({
        artistId: testArtistId,
        title: 'Cover Art Test Release',
        type: 'album',
        releaseDate: new Date()
      })
      testReleaseId = release.id
    })

    it('should update release cover art information', async () => {
      const coverArtData = {
        coverArtUrl: '/uploads/releases/1_medium.jpg',
        coverArtAlt: 'Updated cover art description',
        coverArtSizes: {
          small: '/uploads/releases/1_small.jpg',
          medium: '/uploads/releases/1_medium.jpg',
          large: '/uploads/releases/1_large.jpg'
        }
      }

      const updatedRelease = await ReleaseService.updateReleaseCoverArt(testReleaseId, coverArtData)

      expect(updatedRelease.coverArtUrl).toBe(coverArtData.coverArtUrl)
      expect(updatedRelease.coverArtAlt).toBe(coverArtData.coverArtAlt)
      expect(updatedRelease.coverArtSizes).toMatchObject(coverArtData.coverArtSizes)
    })

    it('should validate cover art URL format', async () => {
      await expect(
        ReleaseService.updateReleaseCoverArt(testReleaseId, {
          coverArtUrl: '/wrong/format/image.jpg'
        })
      ).rejects.toThrow('Cover art validation failed')
    })

    it('should throw error for non-existent release', async () => {
      await expect(
        ReleaseService.updateReleaseCoverArt(99999, {
          coverArtUrl: '/uploads/releases/1_medium.jpg'
        })
      ).rejects.toThrow('Release not found')
    })
  })

  describe('getReleaseStats', () => {
    beforeEach(async () => {
      const currentYear = new Date().getFullYear()
      
      // Create releases for current year
      await ReleaseService.createRelease({
        artistId: testArtistId,
        title: 'Current Year Album',
        type: 'album',
        releaseDate: new Date(`${currentYear}-06-01`)
      })
      await ReleaseService.createRelease({
        artistId: testArtistId,
        title: 'Current Year Single',
        type: 'single',
        releaseDate: new Date(`${currentYear}-07-01`)
      })
      
      // Create release for previous year
      await ReleaseService.createRelease({
        artistId: secondArtistId,
        title: 'Previous Year Album',
        type: 'album',
        releaseDate: new Date(`${currentYear - 1}-06-01`)
      })
    })

    it('should return release statistics', async () => {
      const stats = await ReleaseService.getReleaseStats()

      expect(stats.total).toBe(3)
      expect(stats.byType.album).toBe(2)
      expect(stats.byType.single).toBe(1)
      expect(stats.thisYear).toBe(2)
    })
  })
})