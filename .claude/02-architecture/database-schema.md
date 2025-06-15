# Database Schema Design

## Entity Relationship Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Artists     │    │    Releases     │    │      News       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │◄──┐│ id (PK)         │    │ id (PK)         │
│ name            │   └│ artist_id (FK)  │    │ title           │
│ bio             │    │ title           │    │ content         │
│ image_url       │    │ type            │    │ author          │
│ social_links    │    │ release_date    │    │ published_at    │
│ is_featured     │    │ cover_art_url   │    │ created_at      │
│ created_at      │    │ streaming_links │    │ updated_at      │
│ updated_at      │    │ created_at      │    └─────────────────┘
└─────────────────┘    │ updated_at      │
                       └─────────────────┘
```

## Table Definitions

### Artists Table
```sql
CREATE TABLE artists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    bio TEXT,
    image_url VARCHAR(500),
    social_links JSONB DEFAULT '{}',
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_artists_name ON artists(name);
CREATE INDEX idx_artists_featured ON artists(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_artists_created_at ON artists(created_at DESC);
```

### Releases Table
```sql
CREATE TABLE releases (
    id SERIAL PRIMARY KEY,
    artist_id INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('album', 'single', 'ep')),
    release_date DATE NOT NULL,
    cover_art_url VARCHAR(500),
    streaming_links JSONB DEFAULT '{}',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_releases_artist_id ON releases(artist_id);
CREATE INDEX idx_releases_release_date ON releases(release_date DESC);
CREATE INDEX idx_releases_type ON releases(type);
CREATE INDEX idx_releases_created_at ON releases(created_at DESC);
```

### News Table
```sql
CREATE TABLE news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100) DEFAULT 'Music Label',
    slug VARCHAR(255) UNIQUE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_news_published_at ON news(published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX idx_news_slug ON news(slug) WHERE slug IS NOT NULL;
CREATE INDEX idx_news_created_at ON news(created_at DESC);
```

## JSON Field Structures

### Artists.social_links
```json
{
  "instagram": "https://instagram.com/artist",
  "twitter": "https://twitter.com/artist",
  "facebook": "https://facebook.com/artist",
  "youtube": "https://youtube.com/artist",
  "website": "https://artist-website.com"
}
```

### Releases.streaming_links
```json
{
  "spotify": "https://open.spotify.com/album/...",
  "apple_music": "https://music.apple.com/album/...",
  "youtube_music": "https://music.youtube.com/playlist/...",
  "bandcamp": "https://artist.bandcamp.com/album/...",
  "soundcloud": "https://soundcloud.com/artist/sets/..."
}
```

## Data Validation Rules

### Artists
- `name`: Required, 1-255 characters, unique
- `bio`: Optional, max 5000 characters
- `image_url`: Optional, valid URL format
- `social_links`: Valid JSON object with URL validation
- `is_featured`: Boolean, max 6 featured artists at once

### Releases
- `title`: Required, 1-255 characters
- `type`: Required, must be 'album', 'single', or 'ep'
- `release_date`: Required, cannot be more than 100 years in past/future
- `artist_id`: Required, must reference existing artist
- `streaming_links`: Valid JSON object with URL validation

### News
- `title`: Required, 1-255 characters
- `content`: Required, min 10 characters
- `author`: Optional, default to 'Music Label'
- `slug`: Optional, URL-safe string, auto-generated from title
- `published_at`: Optional, if null then draft status

## Migration Strategy

### Initial Migration (001_create_tables.sql)
```sql
-- Create artists table
-- Create releases table with foreign key
-- Create news table
-- Add indexes
-- Insert sample data for development
```

### Future Migrations
- `002_add_genres.sql`: Add genres table and many-to-many relationship
- `003_add_tracks.sql`: Add tracks table for individual songs
- `004_add_media.sql`: Add media table for photos/videos

## Backup and Recovery

### Backup Strategy
- Daily automated backups at 2 AM UTC
- Weekly full backups retained for 1 month
- Monthly backups retained for 1 year
- Point-in-time recovery capability

### Recovery Testing
- Monthly recovery drills
- Backup integrity verification
- Recovery time objective: 1 hour
- Recovery point objective: 24 hours

## Performance Considerations

### Query Optimization
- Use indexes for frequent queries
- Implement query result caching
- Monitor slow query log
- Regular ANALYZE and VACUUM

### Connection Management
- Connection pooling (10-20 connections)
- Connection timeout: 30 seconds
- Query timeout: 10 seconds
- Idle connection cleanup

### Data Archival
- Archive old news articles (>2 years)
- Compress old release data
- Regular database maintenance

## Development Data

### Sample Artists
```json
[
  {
    "name": "The Midnight Echo",
    "bio": "Alternative rock band from Portland",
    "is_featured": true,
    "social_links": {
      "instagram": "https://instagram.com/midnightecho",
      "spotify": "https://open.spotify.com/artist/..."
    }
  }
]
```

### Sample Releases
```json
[
  {
    "title": "Neon Dreams",
    "type": "album",
    "release_date": "2024-03-15",
    "streaming_links": {
      "spotify": "https://open.spotify.com/album/...",
      "apple_music": "https://music.apple.com/album/..."
    }
  }
]
```