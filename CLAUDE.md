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

### Current Status (Updated: June 25, 2025)
**Phase**: Phase 4.2 COMPLETE ✅, Phase 4.3 NEXT 🚧  
**Current Priority**: Enhanced Music Components with Howler.js audio player

| Phase | Status | Progress Details |
|-------|--------|------------------|
| **Phase 1: Foundation** | ✅ **COMPLETE** | Frontend: React+Vite+Vitest (11 tests), Backend: Express+Jest+Supertest |
| **Phase 2.1-2.3: Enhanced Database** | ✅ **COMPLETE** | Docker PostgreSQL + Prisma ORM + Enhanced Schema + Sample Data |
| **Phase 2.4-2.5: File Storage + Services** | ✅ **COMPLETE** | File serving + Enhanced services layer (102 tests) |
| **Phase 3.1: REST API Endpoints** | ✅ **COMPLETE** | Full CRUD API with 91 endpoint tests (ALL 258 tests passing ✅) |
| **Phase 3.2: Image Upload System** | ✅ **COMPLETE** | Multer + Sharp integration with 12 upload tests (ALL 270 tests passing ✅) |
| **Phase 3.3: API Middleware** | ✅ **COMPLETE** | Validation, Error Handling, Rate Limiting with 55 middleware tests (ALL 333 tests passing ✅) |
| **Phase 3.4: Contact/Newsletter API** | ✅ **COMPLETE** | Contact and Newsletter endpoints with rate limiting (ALL 399+ tests passing ✅) |
| **Phase 4.1: Layout Components** | ✅ **COMPLETE** | Header, Footer, MainNav with state management (32 tests) |
| **Phase 4.2: Artist Components** | ✅ **COMPLETE** | Enhanced ArtistCard, ArtistGrid, ArtistProfile with backward compatibility (49 tests) |
| **Phase 4.3: Music Components** | 🚧 **NEXT** | MusicPlayer with Howler.js, ReleaseCard with streaming platforms |

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

### 🧪 Test Coverage Status (Current: 542+ tests - ALL PASSING ✅)

| Component/Feature | Test Status | Test Count | Coverage Notes |
|-------------------|-------------|------------|----------------|
| **Frontend Components** | ✅ **COMPLETE** | 11 tests | React components with 100% coverage |
| **Frontend Layout Components** | ✅ **COMPLETE** | 32 tests | Phase 4.1 - Header, MainNav, Footer, Layout |
| **Frontend Zustand Stores** | ✅ **COMPLETE** | 27 tests | Navigation, Filter, Music Player stores |
| **Frontend Utils** | ✅ **COMPLETE** | 6 tests | Test utilities and configuration |
| **Backend API Foundation** | ✅ **COMPLETE** | 53 tests | Express setup complete, all tests passing |
| **Artist Service** | ✅ **COMPLETE** | 25 tests | CRUD + business rules + social platforms |
| **Release Service** | ✅ **COMPLETE** | 37 tests | CRUD + streaming platforms + relationships |
| **News Service** | ✅ **COMPLETE** | 40 tests | CRUD + publish workflow + slug generation |
| **Contact Service** | ✅ **COMPLETE** | 26 tests | Phase 3.4 - Email validation + spam protection |
| **Newsletter Service** | ✅ **COMPLETE** | 32 tests | Phase 3.4 - Subscription management + GDPR |
| **File Storage** | ✅ **COMPLETE** | 10 tests | Static serving + security headers |
| **Database Layer** | ✅ **COMPLETE** | Integrated | Prisma operations + migrations |
| **REST API Endpoints** | ✅ **COMPLETE** | 91 tests | Phase 3.1 - Full CRUD API with comprehensive testing |
| **Image Upload API** | ✅ **COMPLETE** | 12 tests | Phase 3.2 - Multer + Sharp image processing |
| **API Middleware** | ✅ **COMPLETE** | 55 tests | Phase 3.3 - Validation, Error Handling, Rate Limiting |
| **Contact API** | ✅ **COMPLETE** | 25 tests | Phase 3.4 - Contact form endpoints |
| **Newsletter API** | ✅ **COMPLETE** | 33 tests | Phase 3.4 - Newsletter subscription endpoints |
| **Image Processing Service** | ⚠️ **PARTIAL** | Sharp mocking | Unit tests blocked by Sharp mocking complexity |
| **Frontend Artist Components** | ✅ **COMPLETE** | 49 tests | Phase 4.2 - Enhanced ArtistCard, ArtistGrid, ArtistProfile |
| **Frontend Type System** | ✅ **COMPLETE** | 29 tests | Type conversions and utilities for backend compatibility |
| **Frontend Pages** | ❌ **NOT STARTED** | 0 tests | Phase 4 - Page components |
| **End-to-End Flows** | ❌ **NOT STARTED** | 0 tests | Phase 5 - User journeys |

### 📊 Test Quality Metrics
- **Total Tests**: 542+ (ALL PASSING ✅)
  - Backend: 399+ tests
  - Frontend: 143 tests (up from 65)
- **Test Breakdown**: 
  - Backend: API endpoints (161), Middleware (55), Services (134), Foundation (65), Image Processing (8)
  - Frontend: Artist Components (49), Layout Components (32), Type System (29), Stores (27), Utils (6)
- **Coverage Target**: 90%+ achieved across all tested components
- **Test Types**: Unit, Integration, API (full HTTP testing), Database, File Upload, Middleware, React Components
- **Test Speed**: ~3.8s backend, ~1.5s frontend (excellent for development)
- **Phase 3.4**: ✅ COMPLETE - Contact/Newsletter API with comprehensive testing
- **Phase 4.1**: ✅ COMPLETE - Layout components with state management
- **Phase 4.2**: ✅ COMPLETE - Enhanced artist components with progressive implementation
- **Known Issue**: ImageProcessingService unit tests have Sharp mocking issues (non-functional)

### Phase 4 Frontend Progress (Progressive Enhancement Approach) ✅
1. **✅ Phase 4.1**: Layout components with state management (32 tests)
2. **✅ Phase 4.2**: Enhanced artist components with backward compatibility:
   - Type system foundation matching backend Prisma schema (29 tests)
   - ArtistCard: Handles both simple and enhanced data types
   - ArtistGrid: Loading/error states, featured artist sorting
   - ArtistProfile: Full artist detail view with releases and social links
   - Total: 49 component tests + 29 type system tests = 78 new tests
3. **🚧 Phase 4.3 Next**: Music components with Howler.js audio player

### Technical Implementation Details
1. **Type System**: Created comprehensive types matching backend with conversion utilities
2. **Backward Compatibility**: Components accept both SimpleArtist and ArtistDisplay types
3. **Progressive Enhancement**: Optional features (social links, featured badges) only show for enhanced data
4. **CSS Styling**: Complete dark mode design with animations and responsive layout
5. **Test Coverage**: Maintained 90%+ coverage with 143 total frontend tests

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

### Complete Documentation Reference
- **System Overview**: @.claude/02-architecture/system-overview.md (tech stack & architecture)
- **Test Helpers**: @.claude/03-development/test-helpers.md (practical testing patterns)  
- **Coding Standards**: @.claude/03-development/coding-standards.md (development best practices)
- **Workflow Guidelines**: @.claude/03-development/workflow.md (development process)
- **Project Overview**: @.claude/01-project/overview.md (business goals & scope)
- **Documentation Index**: @.claude/README.md (navigation guide)

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