# 🎵 Music Label Website

**System-Wide Standards**: All general development practices from `~/CLAUDE.md` apply  
**Project Type**: Full-stack music industry website (React + Node.js + PostgreSQL)

## 🎯 Music Label Specific Context

### Business Domain
- **Industry**: Music label showcasing artists, releases, and news
- **Target Users**: Music fans, industry professionals, potential artists
- **Core Value**: Artist discovery and music streaming integration

### Key Entities
- **Artists**: Label roster with profiles, bios, social links, featured status
- **Releases**: Albums/singles/EPs with streaming platform integration  
- **News**: Label updates and announcements with publication workflow

## 🛠️ Project-Specific Tech Decisions

### Enhanced Technology Stack
- **Frontend State**: Zustand (lightweight, TypeScript-first) + TanStack Query (API caching)
- **Backend ORM**: Prisma (type-safe database layer with migrations)
- **Audio Handling**: Howler.js for enhanced music player functionality
- **Type Safety**: End-to-end TypeScript with Prisma-generated types

### Testing Strategy (Deviates from ~/CLAUDE.md defaults)
- **Frontend**: Vitest + React Testing Library (faster than Jest with Vite)
- **Backend**: Jest + Supertest + Prisma test database
- **Integration**: TanStack Query + Zustand testing patterns
- **Rationale**: Optimized for each environment with enhanced type safety

### Music Industry Integrations
- **Streaming APIs**: Spotify Web API (preview URLs), Apple Music, YouTube Music
- **Social Platforms**: Instagram, Twitter, Facebook, TikTok integration
- **Audio Engine**: Howler.js player with waveforms, cross-browser compatibility
- **Music Previews**: Advanced audio controls with background playback

### Design System (Dark Mode Focus)
- **Theme**: Dark mode with vibrant orange accent (#ff6b35)
- **Typography**: Monument Extended (headings) + Inter (body)
- **Icons**: Lucide React exclusively for consistency
- **Layout**: Mobile-first with music industry visual hierarchy

### Security & Performance
- **Rate Limiting**: Contact forms (5/15min), Newsletter (3/10min)
- **CSP**: Allow streaming domains (open.spotify.com, music.apple.com)
- **Performance**: <2s load time optimized for music discovery workflow

## 📋 Development Progress Tracking

### Current Status (Updated: June 17, 2025)
**Phase**: Phase 2.5 COMPLETE ✅, Phase 3.1 NOT STARTED  
**Current Priority**: Fix failing tests, then begin Phase 3.1 API implementation

| Phase | Status | Progress Details |
|-------|--------|------------------|
| **Phase 1: Foundation** | ✅ **COMPLETE** | Frontend: React+Vite+Vitest (11 tests), Backend: Express+Jest+Supertest |
| **Phase 2.1-2.3: Enhanced Database** | ✅ **COMPLETE** | Docker PostgreSQL + Prisma ORM + Enhanced Schema + Sample Data |
| **Phase 2.4-2.5: File Storage + Services** | ✅ **COMPLETE** | File serving + Enhanced services layer (165 tests, 36 need fixes) |
| **Phase 3.1: REST API Endpoints** | ❌ **NOT STARTED** | API routes implementation pending |

### Phase 1 + Enhanced Database + Services Achievements ✅
- **Frontend**: React TypeScript + Vite build system operational
- **Testing**: Vitest + React Testing Library with 100% component coverage
- **Backend**: Node.js Express server with TypeScript compilation
- **API Testing**: Jest + Supertest with comprehensive HTTP method validation (53 tests)
- **Database**: Docker PostgreSQL + Prisma ORM with enhanced schema
- **Enhanced Schema**: Image fields, 8 social platforms, 5 streaming platforms
- **Sample Data**: 3 artists, 4 releases, 3 news articles seeded
- **Environment**: Docker containerization + test isolation configured
- **File Storage**: Express static serving with caching/security headers (10 tests)
- **Services Layer**: Artist (25 tests), Release (37 tests), News (40 tests) - 112+ total tests
- **Business Logic**: Featured artist limits, platform validation, slug generation

### 🧪 Test Coverage Status (Current: 165 tests - 129 passing, 36 failing)

| Component/Feature | Test Status | Test Count | Coverage Notes |
|-------------------|-------------|------------|----------------|
| **Frontend Components** | ✅ **COMPLETE** | 11 tests | React components with 100% coverage |
| **Backend API Foundation** | ⚠️ **ISSUES** | 53 tests | Express setup complete, some tests failing |
| **Artist Service** | ✅ **COMPLETE** | 25 tests | CRUD + business rules + social platforms |
| **Release Service** | ✅ **COMPLETE** | 37 tests | CRUD + streaming platforms + relationships |
| **News Service** | ✅ **COMPLETE** | 40 tests | CRUD + publish workflow + slug generation |
| **File Storage** | ✅ **COMPLETE** | 10 tests | Static serving + security headers |
| **Database Layer** | ✅ **COMPLETE** | Integrated | Prisma operations + migrations |
| **REST API Endpoints** | ❌ **NOT STARTED** | 0 tests | Phase 3.1 - API endpoints pending |
| **Image Upload** | ❌ **NOT STARTED** | 0 tests | Phase 3.2 - Multer + Sharp |
| **Frontend Pages** | ❌ **NOT STARTED** | 0 tests | Phase 4 - Page components |
| **End-to-End Flows** | ❌ **NOT STARTED** | 0 tests | Phase 5 - User journeys |

### 📊 Test Quality Metrics
- **Total Tests**: 165 (129 passing ✅, 36 failing ⚠️)
- **Completion Status**: Services layer tests passing, foundation tests need fixes
- **Coverage Target**: 90%+ (achieving on service layer, fixing foundation issues)
- **Test Types**: Unit (majority), Integration (services), HTTP (foundation - needs fixes)
- **Test Speed**: ~3s backend, ~2s frontend (excellent for development)
- **Action Required**: Fix 36 failing foundation tests before Phase 3.1

### Immediate Action Items (Current Session)
1. **Fix Failing Tests**: Resolve 36 failing foundation tests to achieve TDD standards
2. **Begin Phase 3.1**: Create REST API endpoints using the completed services layer
3. **API Foundation**: Implement basic CRUD endpoints for artists, releases, news

### Next Session Tasks (After Test Fixes)
1. **Phase 3.2**: Image upload endpoints with multer + sharp processing  
2. **Phase 3.3**: API validation and error handling middleware
3. **API Testing**: Comprehensive testing for new endpoints

## 🏗️ Architecture (Music Industry Specific)

### Database Schema
- **Artists Table**: `social_links` JSON field for platform flexibility
- **Releases Table**: `streaming_links` JSON field, `type` enum (album/single/ep)
- **News Table**: `published_at` for draft/published workflow
- **Relationships**: releases.artist_id → artists.id (CASCADE delete)

### API Response Format
**See complete specification**: @.claude/02-architecture/api-specification.md#response-format
- Success/error responses with TypeScript types
- Paginated response format for list endpoints
- Consistent error handling across all endpoints

### Music Streaming Integration
- Embed iframes for Spotify/Apple Music previews
- Direct links to streaming platforms for full track access
- Fallback handling for unavailable content

## 🎨 UI/UX Patterns (Music Industry)

### Component Hierarchy
- **ArtistCard**: Photo + name + featured status
- **ReleaseCard**: Cover art + title + streaming links + play button
- **MusicPlayer**: Simple preview with play/pause/progress
- **NewsCard**: Title + excerpt + publication date

### Navigation Structure
```
Homepage (featured artists + latest releases)
├── /artists (roster grid → individual profiles)
├── /releases (catalog with filters)
├── /news (blog-style articles)
├── /about (label history)
└── /contact (demo submissions + business inquiries)
```

## 📚 Key Project Documents

### Architecture & Technical Specs
- **Database Schema**: @.claude/02-architecture/database-schema.md
- **API Specification**: @.claude/02-architecture/api-specification.md  
- **Security Model**: @.claude/02-architecture/security-model.md

### Development Resources
- **Development Plan**: @.claude/03-development/development-plan.md (task tracking)
- **Testing Strategy**: @.claude/03-development/testing-strategy.md
- **Project Troubleshooting**: @.claude/03-development/troubleshooting.md

### Design & Business Context  
- **Design System**: @.claude/04-design/design-system.md (dark mode specs)
- **Business Rules**: @.claude/06-domain/business-rules.md (music industry rules)
- **Technical Requirements**: @.claude/01-project/requirements.md

## 🎵 Music Industry Business Rules

### Content Management
- Max 6 featured artists at any time
- All releases require artist association (foreign key constraint)
- News articles support draft/published workflow
- Demo submissions via contact form with file upload support

### Data Validation
- Artist names must be unique across label
- Release dates cannot be >2 years in future
- Social/streaming links must be valid URLs
- Contact forms have aggressive rate limiting (anti-spam)

### Performance Optimization
- Lazy load artist/release images for faster discovery
- Cache streaming platform embeds to reduce API calls
- Optimize for mobile music consumption patterns

---

*This project follows all standards from `~/CLAUDE.md` with music industry specific adaptations above*