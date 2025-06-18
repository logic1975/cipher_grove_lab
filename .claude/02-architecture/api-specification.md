# API Specification

**Base URL**: `http://localhost:3000/api` (development)  
**Production URL**: `https://api.musiclabel.com/api`  
**API Version**: v1  
**Authentication**: None required for public endpoints  

## Response Format

```typescript
// Success Response Type
interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

// Error Response Type
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// Paginated Response Type
interface PaginatedResponse<T> {
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
```

## Type Definitions

```typescript
// Enhanced Prisma-generated types with image and platform support
interface Artist {
  id: number;
  name: string;
  bio: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  imageSizes: ImageSizes; // JSON object with thumbnail, profile, featured
  socialLinks: SocialPlatformLinks; // JSON object with 8 platform support
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  releases?: Release[]; // Include relation when needed
}

interface Release {
  id: number;
  artistId: number;
  title: string;
  type: 'album' | 'single' | 'ep';
  releaseDate: Date;
  coverArtUrl: string | null;
  coverArtAlt: string | null;
  coverArtSizes: ImageSizes; // JSON object with small, medium, large
  streamingLinks: StreamingPlatformLinks; // JSON object with 5 platform support
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  artist?: Artist; // Include relation when needed
}

interface News {
  id: number;
  title: string;
  content: string;
  author: string;
  slug: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Supporting types for enhanced image and platform support
// See complete JSON field structures: @database-schema.md#json-field-structures
interface ImageSizes {
  // Artist: thumbnail, profile, featured paths
  // Release: small, medium, large paths (1:1 square format)
}

interface SocialPlatformLinks {
  // 8 platforms: spotify, appleMusic, youtube, instagram, facebook, bandcamp, soundcloud, tiktok
  // See database-schema.md for URL format examples
}

interface StreamingPlatformLinks {
  // 5 platforms: spotify, appleMusic, youtube, bandcamp, soundcloud  
  // See database-schema.md for URL format examples
}
```

## Artists Endpoints

### GET /api/artists
**Query**: `page?, limit?, featured?, search?`  
**Response**: `PaginatedResponse<Artist>`  
**Type Safety**: Prisma-generated Artist type

### GET /api/artists/:id  
**Path**: Artist ID  
**Response**: `ApiResponse<Artist & { releases: Release[] }>`  
**Errors**: 404 if not found

### POST /api/artists
**Status**: ✅ IMPLEMENTED  
**Body**: Joi validation with Prisma types
**Response**: `ApiResponse<Artist>`

### POST /api/artists/:id/image
**Status**: ✅ IMPLEMENTED (Phase 3.2)  
**Content-Type**: `multipart/form-data`  
**Body**: `image` file field (JPEG, PNG, WebP, max 5MB), `altText` optional field  
**Processing**: Auto-generates thumbnail (400x400), profile (800x800), featured (1200x1200) sizes  
**Response**: `ApiResponse<Artist>` with updated image fields  
**Validation**: File type, size, artist existence  
**Error Codes**: 400 (validation), 404 (artist not found)

## Releases Endpoints

### GET /api/releases
**Query**: `page?, limit?, artist_id?, type?, release_date?, sort?`  
**Response**: `PaginatedResponse<Release & { artist: Artist }>`  
**Type Safety**: Prisma relation with include

### GET /api/releases/:id
**Response**: `ApiResponse<Release & { artist: Artist }>`  
**Type Safety**: Full type inference

### GET /api/artists/:id/releases  
**Query**: Same as `/api/releases` except `artist_id`  
**Response**: `PaginatedResponse<Release>`

### POST /api/releases/:id/cover-art
**Status**: ✅ IMPLEMENTED (Phase 3.2)  
**Content-Type**: `multipart/form-data`  
**Body**: `image` file field (JPEG, PNG, WebP, max 5MB), `altText` optional field  
**Processing**: Auto-generates small (300x300), medium (600x600), large (1200x1200) sizes (1:1 square format)  
**Response**: `ApiResponse<Release>` with updated cover art fields  
**Validation**: File type, size, release existence  
**Error Codes**: 400 (validation), 404 (release not found)

## News Endpoints

### GET /api/news
**Query**: `page?, limit?, published?`  
**Response**: `PaginatedResponse<News>`  
**Filtering**: Only published articles when `published=true`

### GET /api/news/:id
**Response**: `ApiResponse<News>`  
**Type Safety**: Prisma-generated News type

### GET /api/news/slug/:slug  
**Response**: `ApiResponse<News>`  
**Validation**: Slug format validation

## Contact Endpoints

### POST /api/contact
**Rate Limit**: 5/15min per IP  
**Body**: `{name, email, subject, message, type}`  
**Validation**: name(2-100), email(valid), subject(5-200), message(10-2000), type(demo/business/general)  
**Response**: Success message + contact ID  
**Errors**: 400 validation, 429 rate limit

## Newsletter Endpoints

### POST /api/newsletter
**Rate Limit**: 3/10min per IP  
**Body**: `{email}`  
**Response**: Success message  
**Errors**: 400 invalid/duplicate email, 429 rate limit

## File Management Endpoints

### GET /uploads/artists/:filename
**Static Files**: Artist images served by Express.js  
**Path**: `/uploads/artists/{id}_{size}.webp`  
**Sizes**: thumbnail (400x400), profile (800x800), featured (1200x1200)  
**Headers**: Cache-Control, Content-Type

### GET /uploads/releases/:filename  
**Static Files**: Release cover art served by Express.js  
**Path**: `/uploads/releases/{id}_{size}.webp`  
**Sizes**: small (300x300), medium (600x600), large (1200x1200)  
**Headers**: Cache-Control, Content-Type

## Health Check Endpoints

### GET /api/health
**Response**: `{status: "healthy", timestamp, version, uptime, database: "connected", storage: "accessible"}`

## Error Codes & Rate Limiting

### HTTP Status Codes
- **4xx**: 400 (bad request), 404 (not found), 422 (validation), 429 (rate limit)
- **5xx**: 500 (server error), 502 (DB error), 503 (unavailable)

### Rate Limits
- **General**: 100/min per IP, **Search**: 30/min per IP
- **Contact**: 5/15min per IP, **Newsletter**: 3/10min per IP  
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### CORS  
- **Origins**: `localhost:5173` (dev), `musiclabel.com` (prod)
- **Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Headers**: Content-Type, Authorization, X-Requested-With

## Implementation Status (June 18, 2025)

### ✅ COMPLETED: Phase 3.1-3.2 - Full REST API + Image Upload Implementation (270 tests passing)
```typescript
// ArtistService - 25 comprehensive tests
class ArtistService {
  static async getArtists(options: { page?, limit?, featured?, search?, includeReleases? })
  static async createArtist(data: { name, bio?, imageUrl?, socialLinks?, isFeatured? })
  static async updateArtist(id: number, data: Partial<ArtistData>)
  static async getFeaturedArtists(): Promise<Artist[]> // Max 6 enforcement
  static async updateArtistImage(id: number, imageData: ImageData)
}

// ReleaseService - 37 comprehensive tests  
class ReleaseService {
  static async getReleases(options: { page?, limit?, artistId?, type?, sort? })
  static async createRelease(data: { artistId, title, type, releaseDate, streamingLinks? })
  static async getReleasesByArtist(artistId: number, options?)
  static async updateReleaseCoverArt(id: number, coverArtData: CoverArtData)
  static async getReleaseStats(): Promise<{ total, byType, thisYear }>
}

// NewsService - 40 comprehensive tests
class NewsService {
  static async getNews(options: { page?, limit?, published?, search? })
  static async createNews(data: { title, content, author?, publishedAt? })
  static async publishNews(id: number): Promise<News>
  static async getNewsBySlug(slug: string): Promise<News | null>
  static async searchNews(query: string, options?)
}
```

### ✅ COMPLETED: File Storage System
```typescript
// Express static serving with security headers
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    res.set({
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    });
  }
}));

// Directory structure
/uploads/
  /artists/     # Profile images (400x400, 800x800, 1200x1200)
  /releases/    # Cover art (300x300, 600x600, 1200x1200)
```

### ✅ COMPLETED: Enhanced Validation
```typescript
// Social platform validation (8 platforms)
socialLinks: {
  spotify, appleMusic, youtube, instagram, 
  facebook, bandcamp, soundcloud, tiktok
}

// Streaming platform validation (5 platforms)  
streamingLinks: {
  spotify, appleMusic, youtube, bandcamp, soundcloud
}

// Business rules enforcement
- Max 6 featured artists
- Unique artist names per label
- Release dates within 2 years
- Auto slug generation for news
- Publish/draft workflow
```

### ✅ COMPLETED: REST API Endpoints (Phase 3.1-3.2) - All 270 tests passing

#### Artists API (22 tests ✅)
- `GET /api/artists` - Paginated list with filtering and search
- `GET /api/artists/featured` - Featured artists only (max 6)
- `GET /api/artists/:id` - Single artist with optional releases
- `POST /api/artists` - Create with validation and business rules
- `PUT /api/artists/:id` - Update with duplicate name prevention
- `DELETE /api/artists/:id` - Delete with relationship handling
- `POST /api/artists/:id/image` - ✅ NEW: Image upload with Sharp processing

#### Releases API (25 tests ✅)
- `GET /api/releases` - Paginated list with artist relations
- `GET /api/releases/latest` - Latest releases with custom limits
- `GET /api/releases/stats` - Statistics by type and totals
- `GET /api/releases/type/:type` - Filter by album/single/ep
- `GET /api/releases/:id` - Single release with artist data
- `POST /api/releases` - Create with artist validation
- `PUT /api/releases/:id` - Update with type validation
- `DELETE /api/releases/:id` - Delete with verification
- `POST /api/releases/:id/cover-art` - ✅ NEW: Cover art upload with Sharp processing

#### News API (44 tests ✅)
- `GET /api/news` - Paginated with published/draft filtering
- `GET /api/news/published` - Published articles only
- `GET /api/news/drafts` - Draft articles only
- `GET /api/news/latest` - Latest published with limits
- `GET /api/news/stats` - Statistics with monthly data
- `GET /api/news/search` - Search with published filter
- `GET /api/news/slug/:slug` - Get by URL slug
- `GET /api/news/:id` - Get by ID
- `POST /api/news` - Create with auto-slug generation
- `PUT /api/news/:id` - Update with slug handling
- `PUT /api/news/:id/publish` - Publish workflow
- `PUT /api/news/:id/unpublish` - Unpublish workflow
- `DELETE /api/news/:id` - Delete with verification

#### Image Upload API (12 tests ✅) - ✅ NEW: Phase 3.2 Complete
- `POST /api/artists/:id/image` - Artist image upload (7 comprehensive tests)
- `POST /api/releases/:id/cover-art` - Release cover art upload (5 comprehensive tests)
- **Features**: File validation, multi-size generation, WebP conversion, error handling
- **Processing**: Sharp integration, automatic alt text, secure file handling

### ✅ COMPLETED: ImageProcessingService (Phase 3.2)
```typescript
// ImageProcessingService with Sharp integration
class ImageProcessingService {
  static validateImageFile(file: Express.Multer.File): void
  static async processArtistImage(file, artistId, altText): Promise<ProcessedImageResult>
  static async processReleaseCoverArt(file, releaseId, altText): Promise<ProcessedCoverArtResult>
  static getImageSizes(type: 'artist' | 'release'): ImageSize[]
  static async deleteImageFiles(type, entityId): Promise<void>
}

// Multer configuration with security
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => { /* JPEG, PNG, WebP only */ },
  limits: { fileSize: 5 * 1024 * 1024, files: 1 }
})
```

### 🔄 NEXT: Phase 3.3-3.4 - API Middleware & Contact Forms
- API validation and error handling middleware
- Contact/Newsletter API endpoints with rate limiting