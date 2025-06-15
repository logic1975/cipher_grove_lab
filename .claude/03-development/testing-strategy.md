# Testing Strategy

## Testing Philosophy

**Goal**: Achieve 90%+ test coverage with comprehensive edge case testing  
**Approach**: Test-Driven Development (TDD) with testing pyramid principles  
**Focus**: Reliability, maintainability, and user experience validation

## Testing Pyramid

```
       ┌─────────────────┐
       │   E2E Tests     │  ← Few, expensive, full user journeys
       │   (Playwright)  │
       ├─────────────────┤
       │ Integration     │  ← API + Database integration
       │ Tests (Jest)    │
       ├─────────────────┤
       │   Unit Tests    │  ← Many, fast, individual functions
       │ (Jest + RTL)    │
       └─────────────────┘
```

## Frontend Testing (React + TypeScript + Enhanced Stack)

### Unit Testing - Vitest + React Testing Library + TanStack Query + Zustand
**Coverage Target**: 90%+ for components, utilities, stores, and hooks
**Why Vitest**: Faster than Jest, better Vite integration, modern tooling
**New Focus**: State management testing, API caching validation, audio player testing

#### Component Testing
```javascript
// ArtistCard.test.tsx - Key patterns
describe('ArtistCard', () => {
  it('renders artist info', () => {
    render(<ArtistCard artist={{name: 'Test', bio: 'Bio'}} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
  it('handles missing image', () => {/* fallback image test */});
  it('triggers navigation', async () => {/* click navigation test */});
});
```

#### TanStack Query Testing
```javascript
// useArtists.test.ts - Enhanced patterns
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

describe('useArtists', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  
  it('fetches successfully with caching', async () => {
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    
    const { result } = renderHook(() => useArtists(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toMatchObject({ success: true });
  });
  
  it('handles network errors', async () => {
    // Mock network failure, verify error state and retry logic
  });
});
```

#### Zustand Store Testing
```javascript
// musicPlayerStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useMusicPlayerStore } from '../stores/musicPlayerStore';

describe('Music Player Store', () => {
  beforeEach(() => {
    useMusicPlayerStore.setState({ isPlaying: false, currentTrack: null });
  });

  it('plays and pauses tracks', () => {
    const { result } = renderHook(() => useMusicPlayerStore());
    
    act(() => {
      result.current.play({ id: 1, title: 'Test Track', url: 'test.mp3' });
    });
    
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.currentTrack?.title).toBe('Test Track');
  });
});
```

#### Howler.js Audio Testing
```javascript
// MusicPlayer.test.tsx
import { vi } from 'vitest';

// Mock Howler
vi.mock('howler', () => ({
  Howl: vi.fn().mockImplementation(() => ({
    play: vi.fn(),
    pause: vi.fn(),
    stop: vi.fn(),
    on: vi.fn()
  }))
}));

describe('MusicPlayer Component', () => {
  it('initializes audio player correctly', () => {
    render(<MusicPlayer track={{ url: 'test.mp3', title: 'Test' }} />);
    // Test audio controls, progress, error handling
  });
});
```

#### Edge Cases to Test
- Empty states (no artists, no releases)
- Loading states and skeleton components
- Error states and error boundaries
- Long text truncation
- Image loading failures
- Network request failures
- Invalid data formats
- Accessibility features (keyboard navigation, screen readers)

### Integration Testing
**Scope**: Component interactions and API integration

```javascript
// Example: ArtistPage.integration.test.tsx
describe('Artist Page Integration', () => {
  it('loads artist with releases', async () => {
    const mockArtist = { id: 1, name: 'Test Artist' };
    const mockReleases = [{ id: 1, title: 'Test Album', artist_id: 1 }];
    
    // Mock API responses
    server.use(
      rest.get('/api/artists/1', (req, res, ctx) => {
        return res(ctx.json(mockArtist));
      }),
      rest.get('/api/releases', (req, res, ctx) => {
        return res(ctx.json(mockReleases));
      })
    );

    render(<ArtistPage />, { wrapper: RouterWrapper });
    
    await waitFor(() => {
      expect(screen.getByText('Test Artist')).toBeInTheDocument();
      expect(screen.getByText('Test Album')).toBeInTheDocument();
    });
  });
});
```

## Backend Testing (Node.js + Express + Prisma)

### Unit Testing - Jest + Supertest + Prisma Test Database
**Coverage Target**: 95%+ for business logic, API routes, and database operations
**Why Jest**: Mature, excellent Node.js support, comprehensive mocking
**Enhanced Focus**: Prisma query testing, type safety validation, database transactions

#### API Route Testing
```javascript
// artists.test.js - Key patterns  
describe('GET /api/artists', () => {
  it('returns artists', async () => {/* mock service, expect 200 + data */});
  it('handles DB errors', async () => {/* mock error, expect 500 */});
  it('validates pagination', async () => {/* invalid params, expect 400 */});
});
```

#### Prisma Database Layer Testing
```javascript
// artistService.test.js - Enhanced patterns
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

const prisma = mockDeep<PrismaClient>();

describe('ArtistService with Prisma', () => {
  beforeEach(() => {
    mockReset(prisma);
  });

  it('creates artist with type safety', async () => {
    const artistData = {
      name: 'Test Artist',
      bio: 'Test bio',
      socialLinks: { instagram: 'https://instagram.com/test' },
      isFeatured: false
    };

    prisma.artist.create.mockResolvedValue({
      id: 1,
      ...artistData,
      imageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const result = await createArtist(artistData);
    expect(result).toMatchObject(artistData);
    expect(prisma.artist.create).toHaveBeenCalledWith({
      data: artistData
    });
  });

  it('handles Prisma unique constraint errors', async () => {
    prisma.artist.create.mockRejectedValue({
      code: 'P2002',
      meta: { target: ['name'] }
    });

    await expect(createArtist({ name: 'Duplicate' }))
      .rejects.toThrow('Artist name already exists');
  });

  it('validates JSON fields', async () => {
    const invalidData = {
      name: 'Test',
      socialLinks: { instagram: 'invalid-url' }
    };

    // Test Joi validation before Prisma call
    await expect(createArtist(invalidData))
      .rejects.toThrow('Invalid social media URL');
  });
});
```

#### Type Safety Testing
```javascript
// typeValidation.test.ts
import { Artist, Release } from '@prisma/client';

describe('Prisma Type Validation', () => {
  it('enforces Artist type structure', () => {
    const artist: Artist = {
      id: 1,
      name: 'Test',
      bio: null,
      imageUrl: null,
      socialLinks: {},
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // TypeScript compilation validates this structure
    expect(artist.name).toBe('Test');
  });

  it('validates Release relationships', () => {
    const releaseWithArtist: Release & { artist: Artist } = {
      // Full type checking for relations
    };
  });
});
```

#### Edge Cases to Test
- Invalid input validation
- SQL injection attempts
- Database connection failures
- Rate limiting enforcement
- Large payload handling
- Concurrent request handling
- Authentication edge cases
- File upload validation

### Integration Testing
```javascript
describe('Artists API Integration', () => {
  it('creates and lists artist', async () => {
    // Create → List → Verify → Cleanup pattern
  });
});
```

## End-to-End Testing (Playwright)

### User Journey Testing
```javascript
// artist-discovery.e2e.test.ts
test('User discovers artists', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-testid="featured-artists"]')).toBeVisible();
  await page.click('[data-testid="artist-card"]:first-child');
  await expect(page).toHaveURL(/\/artists\/\d+/);
  // Test navigation, artist details, music player
});

test('Contact form works', async ({ page }) => {
  await page.goto('/contact');
  // Fill form, submit, verify success message
});
```

### Cross-Browser Testing
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Chrome
- Mobile Safari

### Performance Testing
```javascript
test('Homepage performance', async ({ page }) => {
  // Response time + Lighthouse thresholds: performance 90%, accessibility 95%
});
```

## Security Testing
```javascript
describe('Security Tests', () => {
  it('prevents XSS', async () => {/* malicious script → expect 400 error */});
  it('prevents SQL injection', async () => {/* SQL injection → expect safe response */});
  it('enforces rate limiting', async () => {/* 101 requests → expect 429s */});
});
```

## Performance Testing

### Load Testing
```yaml
# artillery-config.yml - 60s, 10 requests/sec → homepage, artists, releases APIs
```

### Bundle Size Testing  
```javascript
describe('Bundle Size', () => {
  it('under 500KB limit', () => {/* check main bundle size */});
});
```

## Test Data Management

### Test Database Setup
```sql
-- Sample test data: artists + releases for testing
```

### Mock Data Factories  
```javascript
// testUtils/factories.js - createMockArtist() with faker.js
```

## Test Execution Strategy

### Pre-commit Hooks
```json
// husky: pre-commit → unit tests, pre-push → integration tests
```

### CI/CD Pipeline
```yaml
# .github/workflows/test.yml - Node 18, unit/integration/e2e tests, coverage upload
```

## Continuous Testing Metrics

### Coverage Targets
- **Unit**: 90%+ line coverage
- **Integration**: 80%+ API coverage  
- **E2E**: 100% critical journeys

### Quality Gates
- Tests pass, coverage met, performance budgets, security scans, accessibility

### Monitoring
- Test failures, coverage regression, performance degradation, security alerts