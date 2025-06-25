# Frontend Integration Strategy

## Overview
This document outlines the strategy for integrating the React frontend with the Express/Prisma backend while maintaining type safety and avoiding breaking changes.

## Core Challenges

### 1. Type Mismatches
- **Backend**: Prisma generates types with `id: number`, complex JSON fields
- **Frontend**: React components expect `id: string`, simplified structures
- **Solution**: Type adapters and progressive enhancement

### 2. Data Structure Differences
| Field | Backend | Current Frontend | Target Frontend |
|-------|---------|------------------|-----------------|
| id | number | string | string (converted) |
| bio | string \| null | (missing) | string \| null |
| genre | (missing) | string | (derive from releases) |
| socialLinks | JSON object | (missing) | typed object |
| imageSizes | JSON object | (missing) | typed object |
| isFeatured | boolean | (missing) | boolean |

### 3. API Integration Gaps
- No API client exists yet
- Components use hardcoded mock data
- No error handling or loading states

## Integration Strategy

### Phase 1: Type System Foundation
```typescript
// 1. Create comprehensive types matching backend
interface Artist {
  id: number;
  name: string;
  bio: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  imageSizes: ImageSizes;
  socialLinks: SocialPlatformLinks;
  isFeatured: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  releases?: Release[];
}

// 2. Create display types for components
interface ArtistDisplay extends Omit<Artist, 'id'> {
  id: string; // Converted for React keys
  genre?: string; // Derived from releases
}

// 3. Type conversion utilities
const toDisplayArtist = (artist: Artist): ArtistDisplay => ({
  ...artist,
  id: artist.id.toString(),
  genre: deriveGenreFromReleases(artist.releases)
});
```

### Phase 2: Progressive Component Enhancement
```typescript
// Stage 1: Accept both data shapes
interface ArtistCardProps {
  artist: SimpleArtist | ArtistDisplay;
  index?: number;
}

// Stage 2: Add optional features
const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  const isEnhanced = 'socialLinks' in artist;
  
  return (
    <div>
      {/* Base features always shown */}
      <img src={artist.imageUrl} />
      <h3>{artist.name}</h3>
      
      {/* Enhanced features conditionally shown */}
      {isEnhanced && artist.isFeatured && <FeaturedBadge />}
      {isEnhanced && <SocialLinks links={artist.socialLinks} />}
    </div>
  );
};
```

### Phase 3: API Client Architecture
```typescript
// services/api/client.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
});

// services/api/artists.ts
export const artistsApi = {
  async getAll(params?: ArtistQueryParams): Promise<PaginatedResponse<Artist>> {
    const response = await apiClient.get('/artists', { params });
    return response.data;
  },
  
  async getById(id: number): Promise<Artist> {
    const response = await apiClient.get(`/artists/${id}`);
    return response.data.data;
  }
};

// hooks/useArtists.ts
export const useArtists = (params?: ArtistQueryParams) => {
  return useQuery({
    queryKey: ['artists', params],
    queryFn: () => artistsApi.getAll(params),
    select: (data) => ({
      ...data,
      data: data.data.map(toDisplayArtist)
    })
  });
};
```

### Phase 4: Migration Path

#### Step 1: Add New Types (Non-Breaking)
- Create type definitions
- Add type conversion utilities
- No component changes yet

#### Step 2: Enhance Components (Backward Compatible)
- Update components to accept both data shapes
- Add feature detection
- Maintain existing functionality

#### Step 3: Add API Integration (With Fallback)
```typescript
const ArtistsPage = () => {
  const { data, isLoading, error } = useArtists();
  const artists = data?.data || mockArtists; // Fallback to mock data
  
  return <ArtistGrid artists={artists} />;
};
```

#### Step 4: Remove Mock Data (Final Step)
- Only after API is fully tested
- Update all pages to use real data
- Remove mock data files

## Testing Strategy

### Type Safety Tests
```typescript
// Ensure type conversions work correctly
test('converts backend artist to display format', () => {
  const backendArtist: Artist = {
    id: 1,
    name: 'Test Artist',
    // ... other fields
  };
  
  const displayArtist = toDisplayArtist(backendArtist);
  expect(displayArtist.id).toBe('1');
  expect(typeof displayArtist.id).toBe('string');
});
```

### Component Compatibility Tests
```typescript
// Test both data shapes work
test('ArtistCard handles simple data', () => {
  const simpleArtist = { id: '1', name: 'Test', imageUrl: '/test.jpg' };
  render(<ArtistCard artist={simpleArtist} />);
  expect(screen.getByText('Test')).toBeInTheDocument();
});

test('ArtistCard handles enhanced data', () => {
  const enhancedArtist = createMockArtist({ isFeatured: true });
  render(<ArtistCard artist={enhancedArtist} />);
  expect(screen.getByTestId('featured-badge')).toBeInTheDocument();
});
```

## Success Metrics
- Zero breaking changes during migration
- All existing tests continue to pass
- New features have 90%+ test coverage
- TypeScript compilation without errors
- Smooth transition from mock to real data

## Timeline
1. **Week 1**: Type system and utilities
2. **Week 2**: Component enhancements
3. **Week 3**: API integration with fallbacks
4. **Week 4**: Full migration and cleanup