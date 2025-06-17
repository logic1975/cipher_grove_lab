# Simple Test Helpers & Patterns

**Purpose**: Lightweight, reusable patterns for easier test creation and maintenance  
**Philosophy**: Keep it simple - just document what we're already using effectively

## 🧪 Test Data Patterns (Working Implementation)

**See working examples in**: `backend/src/__tests__/*.test.ts`

### Core Mock Data Functions
```typescript
// Artist test data (25+ tests using this pattern)
const createMockArtist = (overrides = {}) => ({
  name: 'Test Artist',
  bio: 'A great artist from the underground scene',
  socialLinks: { spotify: 'https://open.spotify.com/artist/test' },
  isFeatured: false,
  ...overrides // Easy customization
})

// Release test data (37+ tests using this pattern)  
const createMockRelease = (overrides = {}) => ({
  title: 'Test Album',
  type: 'album' as const,
  releaseDate: new Date('2024-03-15'),
  streamingLinks: { spotify: 'https://open.spotify.com/album/test' },
  ...overrides
})

// News test data (40+ tests using this pattern)
const createMockNews = (overrides = {}) => ({
  title: 'Test News Article',
  content: 'Test content meeting validation requirements.',
  publishedAt: new Date(),
  ...overrides
})
```

**Usage**: `const featuredArtist = createMockArtist({ isFeatured: true })`

## 🔧 Database Test Utilities (Already Working)

### Test Database Setup
```typescript
// From our working test-setup.ts pattern
beforeAll(async () => {
  await testDatabaseConnection() // Ensure DB is available
})

beforeEach(async () => {
  await cleanupTestDatabase() // Fresh state for each test
})
```

### Creating Test Data with Relationships
```typescript
// Pattern for testing releases with artists
const setupArtistWithReleases = async () => {
  const artist = await ArtistService.createArtist(createMockArtist())
  
  const releases = await Promise.all([
    ReleaseService.createRelease(createMockRelease({ 
      artistId: artist.id, 
      title: 'First Album' 
    })),
    ReleaseService.createRelease(createMockRelease({ 
      artistId: artist.id, 
      title: 'Second Album',
      type: 'ep'
    }))
  ])
  
  return { artist, releases }
}

// Usage in tests:
it('should get releases for artist', async () => {
  const { artist, releases } = await setupArtistWithReleases()
  
  const foundReleases = await ReleaseService.getReleasesByArtist(artist.id)
  expect(foundReleases).toHaveLength(2)
})
```

## 🎯 Validation Test Patterns

### Testing Business Rules
```typescript
// Pattern for testing featured artist limits (max 6)
const createMaxFeaturedArtists = async () => {
  const promises = Array.from({ length: 6 }, (_, i) => 
    ArtistService.createArtist(createMockArtist({
      name: `Featured Artist ${i + 1}`,
      isFeatured: true
    }))
  )
  return Promise.all(promises)
}

// Usage:
it('should enforce featured artist limit', async () => {
  await createMaxFeaturedArtists() // Create 6 featured artists
  
  await expect(
    ArtistService.createArtist(createMockArtist({ 
      name: 'Artist 7', 
      isFeatured: true 
    }))
  ).rejects.toThrow('Maximum of 6 featured artists allowed')
})
```

### Testing Validation Errors
```typescript
// Simple patterns for common validation tests
const expectValidationError = async (serviceCall: Promise<any>, expectedMessage: string) => {
  await expect(serviceCall).rejects.toThrow(expectedMessage)
}

// Usage:
it('should validate required fields', async () => {
  await expectValidationError(
    ArtistService.createArtist({ name: '' }),
    '"name" is not allowed to be empty'
  )
})
```

## ⚡ Quick Test Utilities

### API Testing Helper
```typescript
// Simple pattern for API testing (when we build the API)
const makeRequest = (app: any) => ({
  get: (path: string) => request(app).get(path),
  post: (path: string, data: any) => request(app).post(path).send(data),
  expectSuccess: (response: any) => {
    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    return response.body.data
  },
  expectError: (response: any, status: number) => {
    expect(response.status).toBe(status)
    expect(response.body.success).toBe(false)
  }
})
```

### Date Testing Helper
```typescript
// Simple date utilities for testing
const testDates = {
  today: () => new Date(),
  yesterday: () => new Date(Date.now() - 24 * 60 * 60 * 1000),
  nextWeek: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  farFuture: () => new Date('2025-12-31'), // For testing date validation
  farPast: () => new Date('2020-01-01')
}
```

## 🎵 Music Industry Specific Helpers

### Platform URL Patterns
```typescript
const validPlatformUrls = {
  spotify: {
    artist: 'https://open.spotify.com/artist/1234567890',
    album: 'https://open.spotify.com/album/1234567890'
  },
  instagram: 'https://instagram.com/artistname',
  youtube: 'https://youtube.com/@artistname',
  bandcamp: 'https://artistname.bandcamp.com'
}

const invalidUrls = [
  'not-a-url',
  'http://invalid-domain.fake',
  'https://wrong-platform.com/artist/123'
]
```

## 📝 Documentation Pattern

### Test Documentation Template
```typescript
describe('FeatureName', () => {
  // Setup helpers at top
  const createTestData = () => { /* ... */ }
  
  // Happy path tests first
  describe('successful operations', () => {
    it('should do expected behavior', async () => {
      // Given: setup
      // When: action
      // Then: assertions
    })
  })
  
  // Error cases second
  describe('error handling', () => {
    it('should handle invalid input', async () => {
      // Test error scenarios
    })
  })
  
  // Edge cases last
  describe('edge cases', () => {
    it('should handle boundary conditions', async () => {
      // Test limits, empty states, etc.
    })
  })
})
```

## 🎯 Usage Guidelines

### When to Use These Patterns
- ✅ **Use mock data functions** when creating similar test objects
- ✅ **Use setup helpers** when testing relationships between entities
- ✅ **Use validation helpers** when testing business rules repeatedly
- ❌ **Don't over-engineer** - if you only need it once, just inline it

### Maintenance Tips
- Update mock data when you change the real data structure
- Keep helpers simple - they should make tests easier, not more complex
- If a helper gets complicated, consider if you really need it

## 📊 Current Status
- **Artist helpers**: Working in 25+ tests
- **Release helpers**: Working in 37+ tests  
- **News helpers**: Working in 40+ tests
- **Database utilities**: Working across all service tests

This is exactly what we need - simple, reusable patterns that make writing tests faster without adding unnecessary complexity.