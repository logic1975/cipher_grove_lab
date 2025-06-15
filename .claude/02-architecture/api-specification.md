# API Specification

**Base URL**: `http://localhost:3000/api` (development)  
**Production URL**: `https://api.musiclabel.com/api`  
**API Version**: v1  
**Authentication**: None required for public endpoints  

## Response Format

```json
// Success: {success: true, data: {}, message, timestamp}
// Error: {success: false, error: {code, message, details}, timestamp}
// Pagination: {success: true, data: [], pagination: {page, limit, total, totalPages, hasNext, hasPrev}}
```

## Artists Endpoints

### GET /api/artists
**Query**: `page`, `limit`, `featured`, `search`  
**Response**: Array of artists with pagination  
```json
// Artist object: {id, name, bio, image_url, social_links{}, is_featured, created_at, updated_at}
```

### GET /api/artists/:id  
**Path**: Artist ID  
**Response**: Single artist object  
**Errors**: 404 if not found

### POST /api/artists
**Status**: Future feature (Phase 2+)

## Releases Endpoints

### GET /api/releases
**Query**: `page`, `limit`, `artist_id`, `type`, `release_date`, `sort`  
**Response**: Array of releases with pagination
```json
// Release object: {id, artist_id, title, type, release_date, cover_art_url, streaming_links{}, description, created_at, updated_at, artist{}}
```

### GET /api/releases/:id
**Response**: Single release object with artist info

### GET /api/artists/:id/releases  
**Query**: Same as `/api/releases` except `artist_id`

## News Endpoints

### GET /api/news
**Query**: `page`, `limit`, `published`  
**Response**: Array of news articles with pagination
```json
// News object: {id, title, content, author, slug, published_at, created_at, updated_at}
```

### GET /api/news/:id
**Response**: Single news article

### GET /api/news/slug/:slug  
**Response**: Single news article by slug

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

### Future Enhancements (Phase 2+)
- JWT authentication, admin CRUD endpoints, file uploads
- Advanced search, real-time notifications, API versioning, GraphQL