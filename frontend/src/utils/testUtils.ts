import type { 
  Artist, 
  ArtistDisplay, 
  Release, 
  ReleaseDisplay,
  SimpleArtist,
  SocialPlatformLinks,
  StreamingPlatformLinks
} from '../types';

// ============================================
// Mock Data Generators
// ============================================

/**
 * Create a mock Artist matching backend structure
 */
export const createMockArtist = (overrides: Partial<Artist> = {}): Artist => {
  const id = overrides.id ?? 1;
  return {
    id,
    name: 'Test Artist',
    bio: 'A talented artist from the underground music scene.',
    imageUrl: '/images/artists/artist1.png',
    imageAlt: 'Test Artist performing live',
    imageSizes: {
      thumbnail: `/uploads/artists/${id}_thumbnail.webp`,
      profile: `/uploads/artists/${id}_profile.webp`,
      featured: `/uploads/artists/${id}_featured.webp`
    },
    socialLinks: {
      spotify: 'https://open.spotify.com/artist/test',
      instagram: 'https://instagram.com/testartist'
    },
    isFeatured: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides
  };
};

/**
 * Create a mock ArtistDisplay for component testing
 */
export const createMockArtistDisplay = (overrides: Partial<ArtistDisplay> = {}): ArtistDisplay => {
  const id = overrides.id ?? '1';
  return {
    id,
    name: 'Test Artist',
    bio: 'A talented artist from the underground music scene.',
    imageUrl: '/images/artists/artist1.png',
    imageAlt: 'Test Artist performing live',
    imageSizes: {
      thumbnail: `/uploads/artists/${id}_thumbnail.webp`,
      profile: `/uploads/artists/${id}_profile.webp`,
      featured: `/uploads/artists/${id}_featured.webp`
    },
    socialLinks: {
      spotify: 'https://open.spotify.com/artist/test',
      instagram: 'https://instagram.com/testartist'
    },
    isFeatured: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    genre: 'Alternative Rock',
    ...overrides
  };
};

/**
 * Create a simple artist for backward compatibility testing
 */
export const createMockSimpleArtist = (overrides: Partial<SimpleArtist> = {}): SimpleArtist => {
  return {
    id: '1',
    name: 'Test Artist',
    genre: 'Alternative Rock',
    imageUrl: '/images/artists/artist1.png',
    ...overrides
  };
};

/**
 * Create a mock Release
 */
export const createMockRelease = (overrides: Partial<Release> = {}): Release => {
  const id = overrides.id ?? 1;
  return {
    id,
    artistId: 1,
    title: 'Test Album',
    type: 'album',
    releaseDate: '2024-03-15',
    coverArtUrl: '/images/releases/release1.jpg',
    coverArtAlt: 'Test Album cover art',
    coverArtSizes: {
      small: `/uploads/releases/${id}_small.webp`,
      medium: `/uploads/releases/${id}_medium.webp`,
      large: `/uploads/releases/${id}_large.webp`
    },
    streamingLinks: {
      spotify: 'https://open.spotify.com/album/test',
      appleMusic: 'https://music.apple.com/album/test'
    },
    description: 'A groundbreaking album that pushes musical boundaries.',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides
  };
};

/**
 * Create complete social links for testing
 */
export const createMockSocialLinks = (): SocialPlatformLinks => {
  return {
    spotify: 'https://open.spotify.com/artist/test',
    appleMusic: 'https://music.apple.com/artist/test',
    youtube: 'https://youtube.com/@testartist',
    instagram: 'https://instagram.com/testartist',
    facebook: 'https://facebook.com/testartist',
    bandcamp: 'https://testartist.bandcamp.com',
    soundcloud: 'https://soundcloud.com/testartist',
    tiktok: 'https://tiktok.com/@testartist'
  };
};

/**
 * Create complete streaming links for testing
 */
export const createMockStreamingLinks = (): StreamingPlatformLinks => {
  return {
    spotify: 'https://open.spotify.com/album/test',
    appleMusic: 'https://music.apple.com/album/test',
    youtube: 'https://youtube.com/playlist?list=test',
    bandcamp: 'https://testartist.bandcamp.com/album/test',
    soundcloud: 'https://soundcloud.com/testartist/sets/test'
  };
};

// ============================================
// Test Data Arrays
// ============================================

/**
 * Create an array of mock artists with varied data
 */
export const createMockArtists = (count: number = 5): Artist[] => {
  return Array.from({ length: count }, (_, i) => createMockArtist({
    id: i + 1,
    name: `Artist ${i + 1}`,
    isFeatured: i < 2, // First two are featured
    bio: i % 2 === 0 ? `Bio for Artist ${i + 1}` : null,
    socialLinks: i % 3 === 0 ? {} : createMockSocialLinks()
  }));
};

/**
 * Create mock artists with releases
 */
export const createMockArtistWithReleases = (): Artist => {
  const artist = createMockArtist();
  const releases = [
    createMockRelease({ id: 1, artistId: artist.id, type: 'album' }),
    createMockRelease({ id: 2, artistId: artist.id, type: 'single' }),
    createMockRelease({ id: 3, artistId: artist.id, type: 'ep' })
  ];
  
  return {
    ...artist,
    releases
  };
};