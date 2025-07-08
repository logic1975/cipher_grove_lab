# API Specification

**Base URL**: `http://localhost:3000/api` (development)  
**Production URL**: `https://api.musiclabel.com/api`  
**API Version**: v1  
**Status**: ✅ **100% COMPLETE** - All APIs implemented and tested  
**Total Endpoints**: 46 across 5 main modules  
**Authentication**: None required for public endpoints (Admin endpoints marked)  
**Middleware Stack**: 
- ✅ Rate Limiting (express-rate-limit v7)
- ✅ Validation (Joi schemas)
- ✅ Error Handling (centralized)
- ✅ File Upload (Multer + Sharp)  

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

// Contact and Newsletter types (Phase 3.4)
interface Contact {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  type: 'demo' | 'business' | 'general' | 'press';
  processed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Newsletter {
  id: number;
  email: string;
  isActive: boolean;
  subscribedAt: Date;
  unsubscribedAt: Date | null;
}
```

## Artists Endpoints (7 endpoints)

### GET /api/artists
**Query**: `page?, limit?, featured?, search?, includeReleases?`  
**Rate Limit**: 100/15min  
**Response**: `PaginatedResponse<Artist>`  
**Features**: Pagination, search by name/bio, filter by featured status

### GET /api/artists/featured
**Rate Limit**: 100/15min  
**Response**: `ApiResponse<Artist[]>`  
**Business Rule**: Returns max 6 featured artists

### GET /api/artists/:id  
**Path**: Artist ID  
**Query**: `includeReleases?`  
**Response**: `ApiResponse<Artist & { releases?: Release[] }>`  
**Errors**: 404 if not found

### POST /api/artists
**Body**: `{name, bio?, socialLinks?, isFeatured?}`  
**Validation**: Unique name, valid social URLs  
**Business Rule**: Max 6 featured artists  
**Response**: `ApiResponse<Artist>`  
**Errors**: 409 duplicate name, 422 featured limit

### PUT /api/artists/:id
**Body**: Any artist fields to update  
**Response**: `ApiResponse<Artist>`  
**Errors**: 404 not found, 409 duplicate name

### DELETE /api/artists/:id
**Response**: 204 No Content  
**Cascade**: Deletes all associated releases

### POST /api/artists/:id/image
**Rate Limit**: 10/hour  
**Content-Type**: `multipart/form-data`  
**Body**: `image` file field (JPEG, PNG, WebP, max 5MB), `altText` optional field  
**Processing**: Auto-generates thumbnail (400x400), profile (800x800), featured (1200x1200) sizes  
**Response**: `ApiResponse<Artist>` with updated image fields  
**Errors**: 400 validation, 404 artist not found

## Releases Endpoints (9 endpoints)

### GET /api/releases
**Query**: `page?, limit?, artistId?, type?, releaseDate?, sort?, includeArtist?`  
**Sort Options**: newest, oldest, title  
**Response**: `PaginatedResponse<Release & { artist?: Artist }>`  
**Features**: Filter by artist, type, date; sort options

### GET /api/releases/latest
**Query**: `limit?` (default: 5)  
**Response**: `ApiResponse<Release[]>`  
**Features**: Most recent releases

### GET /api/releases/stats
**Response**: `ApiResponse<{total, byType, thisYear}>`  
**Features**: Release statistics

### GET /api/releases/type/:type
**Path**: type (album/single/ep)  
**Query**: `page?, limit?`  
**Response**: `PaginatedResponse<Release>`

### GET /api/releases/:id
**Query**: `includeArtist?`  
**Response**: `ApiResponse<Release & { artist?: Artist }>`  
**Errors**: 404 not found

### POST /api/releases
**Body**: `{artistId, title, type, releaseDate, streamingLinks?, description?}`  
**Validation**: Artist exists, valid streaming URLs  
**Response**: `ApiResponse<Release>`  
**Errors**: 400 artist not found

### PUT /api/releases/:id
**Body**: Any release fields to update  
**Response**: `ApiResponse<Release>`  
**Errors**: 404 not found

### DELETE /api/releases/:id
**Response**: 204 No Content

### POST /api/releases/:id/cover-art
**Rate Limit**: 10/hour  
**Content-Type**: `multipart/form-data`  
**Body**: `image` file field (JPEG, PNG, WebP, max 5MB), `altText` optional field  
**Processing**: Auto-generates small (300x300), medium (600x600), large (1200x1200) sizes  
**Response**: `ApiResponse<Release>` with updated cover art fields  
**Errors**: 400 validation, 404 release not found

## News Endpoints (13 endpoints)

### GET /api/news
**Query**: `page?, limit?, published?, search?, sort?`  
**Response**: `PaginatedResponse<News>`  
**Features**: Draft/published filtering, content search

### GET /api/news/published
**Query**: `page?, limit?`  
**Response**: `PaginatedResponse<News>`  
**Features**: Published articles only

### GET /api/news/drafts
**Query**: `page?, limit?`  
**Response**: `PaginatedResponse<News>`  
**Features**: Draft articles only

### GET /api/news/latest
**Query**: `limit?` (default: 5)  
**Response**: `ApiResponse<News[]>`  
**Features**: Latest published news

### GET /api/news/stats
**Response**: `ApiResponse<{total, published, drafts, thisMonth}>`  
**Features**: News statistics

### GET /api/news/search
**Query**: `q` (required), `publishedOnly?, page?, limit?`  
**Response**: `PaginatedResponse<News>`  
**Features**: Search in title, content, author

### GET /api/news/slug/:slug
**Path**: URL-friendly slug  
**Response**: `ApiResponse<News>`  
**Errors**: 404 not found

### GET /api/news/:id
**Response**: `ApiResponse<News>`  
**Errors**: 404 not found

### POST /api/news
**Body**: `{title, content, author?, publishedAt?}`  
**Features**: Auto-generates slug from title  
**Response**: `ApiResponse<News>`

### PUT /api/news/:id
**Body**: Any news fields to update  
**Response**: `ApiResponse<News>`  
**Errors**: 404 not found, 409 duplicate slug

### PUT /api/news/:id/publish
**Response**: `ApiResponse<News>`  
**Features**: Changes status from draft to published  
**Errors**: 404 not found, 422 already published

### PUT /api/news/:id/unpublish
**Response**: `ApiResponse<News>`  
**Features**: Reverts to draft status  
**Errors**: 404 not found, 422 not published

### DELETE /api/news/:id
**Response**: 204 No Content

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

## Contact Endpoints (Phase 3.4)

### POST /api/contact
**Status**: ✅ IMPLEMENTED  
**Rate Limit**: 5/15min per IP  
**Body**: `{name, email, subject, message, type}`  
**Validation**: name(2-100), email(valid), subject(5-200), message(10-2000), type(demo/business/general/press)  
**Response**: Success message + contact ID  
**Business Rules**: Max 3 submissions per email per 24h, spam detection  
**Errors**: 400 validation, 429 rate limit/spam protection

### GET /api/contact
**Status**: ✅ IMPLEMENTED (Admin)  
**Query**: `page?, limit?, type?, processed?, search?`  
**Response**: `PaginatedResponse<Contact>`  
**Features**: Filtering by type/status, search across all fields

### GET /api/contact/stats
**Status**: ✅ IMPLEMENTED (Admin)  
**Response**: `{total, processed, unprocessed, byType, thisWeek, thisMonth}`

### GET /api/contact/unprocessed
**Status**: ✅ IMPLEMENTED (Admin)  
**Query**: `limit?` (max 50)  
**Response**: Recent unprocessed contacts for dashboard

### GET /api/contact/:id
**Status**: ✅ IMPLEMENTED (Admin)  
**Response**: `ApiResponse<Contact>`  
**Errors**: 404 if not found

### PUT /api/contact/:id
**Status**: ✅ IMPLEMENTED (Admin)  
**Body**: `{processed: boolean}`  
**Response**: Updated contact with processing status

### DELETE /api/contact/:id
**Status**: ✅ IMPLEMENTED (Admin)  
**Response**: Success confirmation  
**Errors**: 404 if not found

## Newsletter Endpoints (Phase 3.4)

### POST /api/newsletter/subscribe
**Status**: ✅ IMPLEMENTED  
**Rate Limit**: 3/10min per IP  
**Body**: `{email}`  
**Features**: Email normalization, reactivation of unsubscribed emails  
**Business Rules**: Blocked domain detection, duplicate prevention  
**Response**: Subscription confirmation with subscriber data  
**Errors**: 400 invalid email, 409 already subscribed, 429 rate limit

### POST /api/newsletter/unsubscribe
**Status**: ✅ IMPLEMENTED  
**Body**: `{email}`  
**Response**: Unsubscription confirmation  
**Errors**: 404 if not subscribed

### GET /api/newsletter/subscribers
**Status**: ✅ IMPLEMENTED (Admin)  
**Query**: `page?, limit?, isActive?, search?`  
**Response**: `PaginatedResponse<Newsletter>`  
**Features**: Filter by active status, email search

### GET /api/newsletter/stats
**Status**: ✅ IMPLEMENTED (Admin)  
**Response**: `{totalSubscribers, activeSubscribers, unsubscribedCount, subscriptionsThisWeek, subscriptionsThisMonth, unsubscriptionsThisWeek, unsubscriptionsThisMonth, growthRate}`

### GET /api/newsletter/active
**Status**: ✅ IMPLEMENTED (Admin)  
**Response**: All active subscribers for email campaigns  
**Use Case**: Export for email marketing platforms

### GET /api/newsletter/subscriber/:email
**Status**: ✅ IMPLEMENTED (Admin)  
**Response**: `ApiResponse<Newsletter>`  
**Errors**: 404 if not found

### DELETE /api/newsletter/subscriber/:email
**Status**: ✅ IMPLEMENTED (Admin - GDPR)  
**Response**: Permanent deletion confirmation  
**Use Case**: GDPR compliance, right to be forgotten

### GET /api/newsletter/check/:email
**Status**: ✅ IMPLEMENTED (Public)  
**Response**: `{email, eligible, reason?}`  
**Features**: Pre-subscription validation, eligibility checking

## Additional Endpoints

### GET /api/health
**Response**: `{success: true, status: "healthy", timestamp}`  
**Use Case**: Health checks for monitoring

### GET /
**Response**: `{success: true, message: "Cipher Grove Lab API", timestamp, environment}`  
**Use Case**: API root information

## Middleware Stack Details

### 1. Rate Limiting (express-rate-limit v7)
- **General API**: 100 requests/15min per IP
- **Contact Form**: 5 requests/15min per IP  
- **Newsletter**: 3 requests/10min per IP
- **File Upload**: 10 uploads/hour per IP
- **Search**: 30 requests/min per IP
- **Headers**: Uses standard `ratelimit-*` headers (v7 format)
- **Environment Aware**: Lenient in test/dev, strict in production

### 2. Validation (Joi)
- **Request Body**: Type conversion, required fields, format validation
- **Query Params**: Page/limit validation, type conversion
- **Path Params**: ID validation, format checking
- **Error Format**: Detailed validation messages

### 3. Error Handling
- **Async Handler**: Catches all async errors
- **Error Format**: Consistent `{success: false, error: {code, message}}`
- **Status Codes**: Proper HTTP status for each error type

### 4. File Upload (Multer + Sharp)
- **File Types**: JPEG, PNG, WebP only
- **Max Size**: 5MB per file
- **Processing**: Auto-resize to multiple sizes
- **Storage**: Memory storage → Sharp processing → Disk save

## Error Codes Reference

### Common Error Codes
- `INVALID_ID`: Invalid ID format
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Input validation failed
- `DUPLICATE_ENTRY`: Unique constraint violation
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

### Business Logic Error Codes
- `FEATURED_LIMIT_EXCEEDED`: Max 6 featured artists
- `ARTIST_NOT_FOUND`: Referenced artist doesn't exist
- `ALREADY_PUBLISHED`: News already published
- `NOT_PUBLISHED`: News not in published state
- `DUPLICATE_ARTIST`: Artist name already exists
- `DUPLICATE_SLUG`: News slug already exists
- `TOO_MANY_SUBMISSIONS`: Contact spam protection
- `ALREADY_SUBSCRIBED`: Newsletter duplicate
- `EMAIL_NOT_SUBSCRIBED`: Email not in newsletter
- `NO_FILE_UPLOADED`: Missing file in upload
- `IMAGE_PROCESSING_ERROR`: Sharp processing failed

## Implementation Summary

### Backend Status: ✅ 100% COMPLETE
- **46 REST endpoints** across 5 modules
- **453 tests** (450 passing, 3 skipped)
- **Complete middleware stack** with enterprise features
- **Production-ready** with comprehensive error handling
### Key Features
- **Services Layer**: Complete business logic implementation with validation
- **File Storage**: Secure static file serving with proper headers
- **Image Processing**: Multi-size generation with Sharp
- **Validation**: Comprehensive Joi schemas for all endpoints
- **Business Rules**: Featured artist limits, unique constraints, spam protection
- **GDPR Compliance**: Newsletter management with right to deletion
- **Rate Limiting**: Multi-tier protection for different endpoint types
- **Error Handling**: Centralized with consistent error codes
- **Type Safety**: End-to-end TypeScript with Prisma