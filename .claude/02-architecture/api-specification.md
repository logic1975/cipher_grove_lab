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
// Prisma-generated types
interface Artist {
  id: number;
  name: string;
  bio: string | null;
  imageUrl: string | null;
  socialLinks: Record<string, string>; // JSON object
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Release {
  id: number;
  artistId: number;
  title: string;
  type: 'album' | 'single' | 'ep';
  releaseDate: Date;
  coverArtUrl: string | null;
  streamingLinks: Record<string, string>; // JSON object
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
**Status**: Future feature (Phase 2+)  
**Body**: Joi validation with Prisma types

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

## Health Check Endpoints

### GET /api/health
**Response**: `{status: "healthy", timestamp, version, uptime, database: "connected"}`

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

## Testing & Future Features

### API Testing
```bash
# curl examples: GET /api/artists, GET /api/artists/1, POST /api/contact
# JavaScript: fetch('/api/artists') with error handling
```

### Type Safety Benefits
```typescript
// Frontend hook with full type inference
const { data: artists } = useQuery<PaginatedResponse<Artist>>({
  queryKey: ['artists', { featured: true }],
  queryFn: () => fetchArtists({ featured: true })
});

// Prisma query with type safety
const artist = await prisma.artist.findUnique({
  where: { id: 1 },
  include: { releases: true }
}); // TypeScript knows exact return type

// Joi validation with Prisma types
const createArtistSchema = Joi.object<Partial<Artist>>({
  name: Joi.string().min(1).max(255).required(),
  bio: Joi.string().max(5000),
  socialLinks: Joi.object().pattern(Joi.string(), Joi.string().uri())
});
```

### Future Enhancements (Phase 2+)
- JWT authentication with Prisma user sessions
- Admin CRUD endpoints with role-based types
- File uploads with type-safe metadata
- GraphQL with generated schemas from Prisma