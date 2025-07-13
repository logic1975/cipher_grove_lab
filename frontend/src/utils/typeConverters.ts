import type { 
  Artist, 
  ArtistDisplay, 
  Release, 
  ReleaseDisplay,
  News,
  NewsDisplay,
  SimpleArtist,
  ReleaseType
} from '../types';

// ============================================
// Artist Conversions
// ============================================

/**
 * Convert backend Artist to frontend ArtistDisplay
 * - Converts numeric ID to string for React keys
 * - Derives genre from releases if available
 */
export const toDisplayArtist = (artist: Artist): ArtistDisplay => {
  return {
    ...artist,
    id: artist.id.toString(),
    genre: deriveGenreFromArtist(artist)
  };
};

/**
 * Convert array of Artists to ArtistDisplay array
 */
export const toDisplayArtists = (artists: Artist[]): ArtistDisplay[] => {
  return artists.map(toDisplayArtist);
};

/**
 * Convert legacy SimpleArtist to ArtistDisplay (for migration)
 */
export const fromSimpleArtist = (simple: SimpleArtist): ArtistDisplay => {
  return {
    id: simple.id,
    name: simple.name,
    bio: null,
    imageUrl: simple.imageUrl,
    imageAlt: simple.name,
    imageSizes: {},
    socialLinks: {},
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    genre: simple.genre
  };
};

// ============================================
// Release Conversions
// ============================================

/**
 * Convert backend Release to frontend ReleaseDisplay
 */
export const toDisplayRelease = (release: Release): ReleaseDisplay => {
  return {
    ...release,
    id: release.id.toString(),
    artistId: release.artistId.toString()
  };
};

/**
 * Convert array of Releases to ReleaseDisplay array
 */
export const toDisplayReleases = (releases: Release[]): ReleaseDisplay[] => {
  return releases.map(toDisplayRelease);
};

// ============================================
// News Conversions
// ============================================

/**
 * Convert backend News to frontend NewsDisplay
 */
export const toDisplayNews = (news: News): NewsDisplay => {
  return {
    ...news,
    id: news.id.toString()
  };
};

/**
 * Convert array of News to NewsDisplay array
 */
export const toDisplayNewsItems = (newsItems: News[]): NewsDisplay[] => {
  return newsItems.map(toDisplayNews);
};

// ============================================
// Helper Functions
// ============================================

/**
 * Derive genre from artist's releases or return a default
 */
const deriveGenreFromArtist = (artist: Artist): string => {
  if (!artist.releases || artist.releases.length === 0) {
    return 'Independent Artist';
  }

  // Map release types to genres (simplified logic)
  const typeToGenre: Record<ReleaseType, string> = {
    album: 'Album Artist',
    single: 'Singles Artist',
    ep: 'EP Artist'
  };

  // Get the most common release type
  const typeCounts = artist.releases.reduce((acc, release) => {
    acc[release.type] = (acc[release.type] || 0) + 1;
    return acc;
  }, {} as Record<ReleaseType, number>);

  const mostCommonType = Object.entries(typeCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] as ReleaseType;

  return typeToGenre[mostCommonType] || 'Various';
};

/**
 * Get the best available image URL from image sizes
 */
export const getBestImageUrl = (
  imageSizes: Artist['imageSizes'] | Release['coverArtSizes'],
  imageUrl: string | null,
  preferredSize: 'thumbnail' | 'profile' | 'featured' | 'small' | 'medium' | 'large'
): string => {
  // Try preferred size first
  if (imageSizes[preferredSize]) {
    return imageSizes[preferredSize];
  }

  // Fall back to other sizes
  const sizes = ['thumbnail', 'small', 'profile', 'medium', 'featured', 'large'];
  for (const size of sizes) {
    if (imageSizes[size as keyof typeof imageSizes]) {
      return imageSizes[size as keyof typeof imageSizes]!;
    }
  }

  // Fall back to main URL
  return imageUrl || '/images/placeholder-artist.jpg';
};

/**
 * Format date for display
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Get social platform icon name
 */
export const getSocialPlatformIcon = (platform: string): string => {
  const iconMap: Record<string, string> = {
    spotify: 'Music',
    appleMusic: 'Music2',
    youtube: 'Youtube',
    instagram: 'Instagram',
    facebook: 'Facebook',
    bandcamp: 'Music3',
    soundcloud: 'Cloud',
    tiktok: 'Music4'
  };
  
  return iconMap[platform] || 'Globe';
};