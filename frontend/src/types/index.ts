// Core type definitions matching backend Prisma schema
// This file serves as the bridge between backend and frontend types

// ============================================
// Base Types (matching backend exactly)
// ============================================

export interface Artist {
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

export interface Release {
  id: number;
  artistId: number;
  title: string;
  type: ReleaseType;
  releaseDate: Date | string;
  coverArtUrl: string | null;
  coverArtAlt: string | null;
  coverArtSizes: ImageSizes;
  streamingLinks: StreamingPlatformLinks;
  description: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  artist?: Artist;
}

export interface News {
  id: number;
  title: string;
  content: string;
  author: string;
  slug: string | null;
  publishedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ============================================
// Supporting Types
// ============================================

export type ReleaseType = 'album' | 'single' | 'ep';

export interface ImageSizes {
  thumbnail?: string;
  profile?: string;
  featured?: string;
  small?: string;
  medium?: string;
  large?: string;
}

export interface SocialPlatformLinks {
  spotify?: string;
  appleMusic?: string;
  youtube?: string;
  instagram?: string;
  facebook?: string;
  bandcamp?: string;
  soundcloud?: string;
  tiktok?: string;
}

export interface StreamingPlatformLinks {
  spotify?: string;
  appleMusic?: string;
  youtube?: string;
  bandcamp?: string;
  soundcloud?: string;
}

// ============================================
// Display Types (for React components)
// ============================================

// Artists with string IDs for React keys
export interface ArtistDisplay extends Omit<Artist, 'id'> {
  id: string;
  genre?: string; // Derived from releases or a default
}

export interface ReleaseDisplay extends Omit<Release, 'id' | 'artistId'> {
  id: string;
  artistId: string;
}

export interface NewsDisplay extends Omit<News, 'id'> {
  id: string;
}

// ============================================
// Legacy Types (for backward compatibility)
// ============================================

export interface SimpleArtist {
  id: string;
  name: string;
  genre: string;
  imageUrl: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
}

// ============================================
// Query Parameters
// ============================================

export interface ArtistQueryParams {
  page?: number;
  limit?: number;
  featured?: boolean;
  search?: string;
}

export interface ReleaseQueryParams {
  page?: number;
  limit?: number;
  artistId?: number;
  type?: ReleaseType;
  sort?: 'date' | 'title';
}

export interface NewsQueryParams {
  page?: number;
  limit?: number;
  published?: boolean;
}

// ============================================
// Type Guards
// ============================================

export const isEnhancedArtist = (artist: SimpleArtist | ArtistDisplay): artist is ArtistDisplay => {
  return 'socialLinks' in artist;
};

export const isArtist = (data: any): data is Artist => {
  return data && typeof data.id === 'number' && typeof data.name === 'string';
};

export const isArtistDisplay = (data: any): data is ArtistDisplay => {
  return data && typeof data.id === 'string' && typeof data.name === 'string';
};