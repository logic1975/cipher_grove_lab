# Technical Requirements

## Performance Requirements
- **Page Load Time**: <2 seconds on 3G connection
- **Time to Interactive**: <3 seconds  
- **Lighthouse Score**: >90 performance
- **Test Coverage**: 90%+ for all code
- **Image Optimization**: WebP format with JPEG fallbacks, responsive sizes

## Security Requirements
- HTTPS enforcement in production
- Input validation and sanitization
- XSS and SQL injection prevention
- Rate limiting on forms (5 requests/15min contact, 3 requests/10min newsletter)
- File upload validation (JPEG, PNG, WebP only, max 5MB)
- WCAG 2.1 AA accessibility compliance

## Browser Support
- Chrome, Firefox, Safari, Edge (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement approach
- WebP image format support with fallbacks

## Data Requirements
- PostgreSQL database with ACID compliance
- Artists table with enhanced image fields (url, alt, sizes) and 8 optional social platforms
- Releases table with enhanced cover art fields and 5 optional streaming platforms
- News table with published/draft states
- Foreign key relationships: releases.artist_id → artists.id
- Local file storage in `/uploads/` directory structure

## Image Specifications
- **Artist Photos**: 1:1 square format (400x400, 800x800, 1200x1200 px)
- **Release Covers**: 1:1 square format (300x300, 600x600, 1200x1200 px)
- **File Types**: WebP (preferred), JPEG, PNG
- **Storage**: Local filesystem with Express.js static serving
- **Naming Convention**: `{type}_{id}_{size}.webp`

## Social Media & Streaming Platforms
- **Artist Social**: spotify, appleMusic, youtube, instagram, facebook, bandcamp, soundcloud, tiktok (all optional)
- **Release Streaming**: spotify, appleMusic, youtube, bandcamp, soundcloud (all optional)

## Deployment Requirements (Coolify + Docker + Hetzner)
- **Platform**: Ubuntu server on Hetzner
- **Orchestration**: Coolify for Docker container management
- **Storage**: Local persistent volumes for uploads
- **Reverse Proxy**: Traefik (managed by Coolify)
- **SSL**: Automatic HTTPS via Coolify
- **Backup**: Regular filesystem backups to Hetzner Storage Box

## Scalability Targets
- Support for 50+ artists, 500+ releases (small indie label focus)
- 1000+ concurrent users  
- Database indexing for search performance
- Image optimization for fast loading

## User Stories (Key Stakeholders)

### Music Fans
- Discover new artists and preview tracks
- Access streaming platforms directly
- Stay updated with label news

### Industry Professionals  
- Assess label roster and success metrics
- Access professional contact information
- Review artist materials and social presence

### Potential Artists
- Submit demos through professional forms
- Understand label mission and artist presentation
- Contact for partnership opportunities

## Acceptance Criteria Summary
- All pages mobile responsive with <2s load time
- Artist pages with functional music previews and streaming links
- Working contact forms with proper validation
- Image upload and processing functionality for artists and releases
- All 8 social platforms and 5 streaming platforms supported (optional)
- Local file storage with proper Express.js static serving
- Coolify deployment with persistent volumes working
- 90%+ Lighthouse performance score
- Zero console errors in production
- WCAG 2.1 AA accessibility compliance including image alt text