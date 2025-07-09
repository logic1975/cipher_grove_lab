# Database Schema Design

## Current Status
- **Implemented**: 5 tables (Artists, Releases, News*, Contact, Newsletter)
- **Planned**: Concerts table (Phase 4.3)

*Note: News table was fully implemented but is not exposed in the frontend per updated project scope

## Entity Relationship Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Artists     │    │    Releases     │    │   News (*)      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │◄──┐│ id (PK)         │    │ id (PK)         │
│ name            │   └│ artist_id (FK)  │    │ title           │
│ bio             │    │ title           │    │ content         │
│ image_url       │    │ type            │    │ author          │
│ image_alt       │    │ release_date    │    │ published_at    │
│ image_sizes     │    │ cover_art_url   │    │ created_at      │
│ social_links    │    │ cover_art_alt   │    │ updated_at      │
│ is_featured     │    │ cover_art_sizes │    └─────────────────┘
│ created_at      │    │ streaming_links │    (*) Not in active use
│ updated_at      │    │ created_at      │
└─────────────────┘    │ updated_at      │
        ▲              └─────────────────┘
        │
        │              ┌─────────────────┐
        │              │ Concerts (Plan) │
        │              ├─────────────────┤
        └──────────────│ id (PK)         │
                       │ artist_id (FK)  │
                       │ venue           │
                       │ date            │
                       │ ticket_link     │
                       │ created_at      │
                       │ updated_at      │
                       └─────────────────┘

┌─────────────────┐    ┌─────────────────┐
│     Contact     │    │   Newsletter    │
├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │
│ name            │    │ email           │
│ email           │    │ is_active       │
│ subject         │    │ subscribed_at   │
│ message         │    │ unsubscribed_at │
│ type            │    └─────────────────┘
│ processed       │
│ created_at      │
│ updated_at      │
└─────────────────┘
```

## Table Definitions

### Artists Table
```sql
CREATE TABLE artists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    bio TEXT,
    
    -- Enhanced image fields for local storage (Coolify/Docker deployment)
    image_url VARCHAR(500),              -- Main image URL: /uploads/artists/{id}_profile.webp
    image_alt VARCHAR(255),              -- Accessibility alt text
    image_sizes JSONB DEFAULT '{}',      -- {"thumbnail": "path", "profile": "path", "featured": "path"}
    
    -- Enhanced social platforms (all optional for indie Music Label flexibility)
    social_links JSONB DEFAULT '{}',     -- {spotify, appleMusic, youtube, instagram, facebook, bandcamp, soundcloud, tiktok}
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
    
    -- Enhanced cover art fields for local storage (1:1 square format)
    cover_art_url VARCHAR(500),         -- Main cover URL: /uploads/releases/{id}_medium.webp
    cover_art_alt VARCHAR(255),         -- Accessibility alt text
    cover_art_sizes JSONB DEFAULT '{}', -- {"small": "300x300", "medium": "600x600", "large": "1200x1200"}
    
    -- Enhanced streaming platforms (matches social_links structure)
    streaming_links JSONB DEFAULT '{}', -- {spotify, appleMusic, youtube, bandcamp, soundcloud}
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

### News Table (Not in Active Use)
> **Note**: This table was fully implemented but is not exposed in the frontend. It remains available for potential admin interfaces or future use.

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

### Contact Table
```sql
CREATE TABLE contact (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (type IN ('demo', 'business', 'general', 'press')),
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_contact_email ON contact(email);
CREATE INDEX idx_contact_processed ON contact(processed);
CREATE INDEX idx_contact_type ON contact(type);
CREATE INDEX idx_contact_created_at ON contact(created_at DESC);
```

### Newsletter Table
```sql
CREATE TABLE newsletter (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_newsletter_email ON newsletter(email);
CREATE INDEX idx_newsletter_is_active ON newsletter(is_active);
CREATE INDEX idx_newsletter_subscribed_at ON newsletter(subscribed_at DESC);
```

### Concerts Table (Planned - Phase 4.3)
```sql
CREATE TABLE concerts (
    id SERIAL PRIMARY KEY,
    artist_id INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    venue VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    time TIME,
    ticket_link VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_concerts_artist_id ON concerts(artist_id);
CREATE INDEX idx_concerts_date ON concerts(date);
CREATE INDEX idx_concerts_city ON concerts(city);
CREATE INDEX idx_concerts_created_at ON concerts(created_at DESC);

-- Constraints
ALTER TABLE concerts ADD CONSTRAINT chk_concert_date CHECK (date >= CURRENT_DATE);
```

## JSON Field Structures

### Artists.social_links (8 platforms, all optional)
```json
{
  "spotify": "https://open.spotify.com/artist/artist_id",
  "appleMusic": "https://music.apple.com/artist/artist_id",
  "youtube": "https://youtube.com/@artistname",
  "instagram": "https://instagram.com/artistname",
  "facebook": "https://facebook.com/artistname",
  "bandcamp": "https://artistname.bandcamp.com",
  "soundcloud": "https://soundcloud.com/artistname", 
  "tiktok": "https://tiktok.com/@artistname"
}
```

### Artists.image_sizes (local storage paths)
```json
{
  "thumbnail": "/uploads/artists/1_thumbnail.webp",  // 400x400
  "profile": "/uploads/artists/1_profile.webp",      // 800x800
  "featured": "/uploads/artists/1_featured.webp"     // 1200x1200
}
```

### Releases.streaming_links (5 platforms, all optional)
```json
{
  "spotify": "https://open.spotify.com/album/album_id",
  "appleMusic": "https://music.apple.com/album/album_id",
  "youtube": "https://youtube.com/playlist?list=playlist_id",
  "bandcamp": "https://artistname.bandcamp.com/album/album_name",
  "soundcloud": "https://soundcloud.com/artistname/sets/album_name"
}
```

### Releases.cover_art_sizes (local storage paths)
```json
{
  "small": "/uploads/releases/1_small.webp",    // 300x300
  "medium": "/uploads/releases/1_medium.webp",  // 600x600
  "large": "/uploads/releases/1_large.webp"     // 1200x1200
}
```

## Data Validation Rules

### Artists
- `name`: Required, 1-255 characters, unique
- `bio`: Optional, max 5000 characters
- `image_url`: Optional, local path format `/uploads/artists/{id}_profile.webp`
- `image_alt`: Optional, accessibility description, max 255 characters
- `image_sizes`: JSON object with thumbnail/profile/featured paths
- `social_links`: JSON object, all platforms optional (spotify, appleMusic, youtube, instagram, facebook, bandcamp, soundcloud, tiktok)
- `is_featured`: Boolean, max 6 featured artists at once

### Releases
- `title`: Required, 1-255 characters
- `type`: Required, must be 'album', 'single', or 'ep'
- `release_date`: Required, cannot be more than 100 years in past/future
- `artist_id`: Required, must reference existing artist
- `cover_art_url`: Optional, local path format `/uploads/releases/{id}_medium.webp`
- `cover_art_alt`: Optional, accessibility description, max 255 characters  
- `cover_art_sizes`: JSON object with small/medium/large paths (1:1 square format)
- `streaming_links`: JSON object, all platforms optional (spotify, appleMusic, youtube, bandcamp, soundcloud)

### News
- `title`: Required, 1-255 characters
- `content`: Required, min 10 characters
- `author`: Optional, default to 'Music Label'
- `slug`: Optional, URL-safe string, auto-generated from title
- `published_at`: Optional, if null then draft status

## Migration Strategy

### Initial Migration (001_create_tables.sql)
```sql
-- Create Artists table
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

### Sample Artists (with enhanced image and social structure)
```json
[
  {
    "name": "The Midnight Echo",
    "bio": "Alternative rock band from Portland known for their ethereal soundscapes",
    "image_url": "/uploads/artists/1_profile.webp",
    "image_alt": "The Midnight Echo band performing on stage with atmospheric lighting",
    "image_sizes": {
      "thumbnail": "/uploads/artists/1_thumbnail.webp",
      "profile": "/uploads/artists/1_profile.webp", 
      "featured": "/uploads/artists/1_featured.webp"
    },
    "social_links": {
      "spotify": "https://open.spotify.com/artist/midnightecho",
      "instagram": "https://instagram.com/midnightecho",
      "youtube": "https://youtube.com/@midnightecho",
      "bandcamp": "https://midnightecho.bandcamp.com"
    },
    "is_featured": true
  }
]
```

### Sample Releases (with enhanced cover art and streaming)
```json
[
  {
    "title": "Neon Dreams",
    "type": "album",
    "release_date": "2024-03-15",
    "cover_art_url": "/uploads/releases/1_medium.webp",
    "cover_art_alt": "Neon Dreams album cover featuring abstract neon cityscapes",
    "cover_art_sizes": {
      "small": "/uploads/releases/1_small.webp",
      "medium": "/uploads/releases/1_medium.webp",
      "large": "/uploads/releases/1_large.webp"
    },
    "streaming_links": {
      "spotify": "https://open.spotify.com/album/neondreams123",
      "appleMusic": "https://music.apple.com/album/neondreams123",
      "bandcamp": "https://midnightecho.bandcamp.com/album/neon-dreams"
    },
    "description": "A journey through midnight cityscapes and electric emotions"
  }
]
```