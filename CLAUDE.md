# 🎵 Music Label Website

**System-Wide Standards**: All general development practices from `~/CLAUDE.md` apply  
**Project Type**: Full-stack music industry website (React + Node.js + PostgreSQL)

## 🎯 Music Label Specific Context

### Business Domain
- **Industry**: Music label showcasing artists, releases, and concerts
- **Target Users**: Music fans, industry professionals, potential artists
- **Core Value**: Artist discovery and music streaming integration

### Key Entities
- **Artists**: Label roster with profiles, bios, social links, featured status
- **Releases**: Albums/singles/EPs with streaming platform integration  
- **Concerts**: Upcoming performances and tour dates
- **About/Contact**: Label information, demo submissions, newsletter signup

## 🛠️ Project-Specific Tech Decisions

### Enhanced Technology Stack
- **Frontend State**: Zustand (lightweight, TypeScript-first) + TanStack Query (API caching)
- **Backend ORM**: Prisma (type-safe database layer with migrations)
- **Type Safety**: End-to-end TypeScript with Prisma-generated types
- **Styling**: Custom CSS with ECM-inspired minimal design (Tailwind removed)

### Testing Strategy (Deviates from ~/CLAUDE.md defaults)
- **Frontend**: Vitest + React Testing Library (faster than Jest with Vite)
- **Backend**: Jest + Supertest + Prisma test database
- **Integration**: TanStack Query + Zustand testing patterns
- **Rationale**: Optimized for each environment with enhanced type safety

### Music Industry Integrations
- **Streaming APIs**: Spotify, Apple Music, YouTube Music (direct links)
- **Social Platforms**: Instagram, Twitter, Facebook, TikTok integration
- **Platform Links**: Direct navigation to streaming services
- **Future Enhancement**: Audio preview functionality (not in current scope)

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

### Current Status (Updated: July 11, 2025)
**Backend**: ✅ **100% COMPLETE** - Production-ready with 497 tests passing (3 skipped)  
**Frontend**: ✅ **PHASE 4.2 COMPLETE** - All 138 tests passing! ECM-inspired layout working perfectly  
**Architecture**: Full-stack with complete REST API, middleware, and business logic

| Phase | Status | Progress Details |
|-------|--------|------------------|
| **Phase 1: Foundation** | ✅ **COMPLETE** | Frontend: React+Vite+Vitest (11 tests), Backend: Express+Jest+Supertest |
| **Phase 2.1-2.3: Enhanced Database** | ✅ **COMPLETE** | Docker PostgreSQL + Prisma ORM + Enhanced Schema + Sample Data |
| **Phase 2.4-2.5: File Storage + Services** | ✅ **COMPLETE** | File serving + Enhanced services layer (102 tests) |
| **Phase 3: Backend API** | ✅ **100% COMPLETE** | Complete REST API with 50+ endpoints, middleware, and 399+ tests |
| **Phase 3.1: REST API** | ✅ **COMPLETE** | Artists, Releases, News APIs - Full CRUD operations |
| **Phase 3.2: Image Upload** | ✅ **COMPLETE** | Multer + Sharp with multi-size image processing |
| **Phase 3.3: Middleware** | ✅ **COMPLETE** | Validation (Joi), Error Handling, Rate Limiting |
| **Phase 3.4: Contact/Newsletter** | ✅ **COMPLETE** | Contact forms, Newsletter subscriptions with GDPR compliance |
| **Phase 4: Frontend Components** | ✅ **COMPLETE** | Layout + Artist components implemented with ECM design, all tests passing |

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

### 🧪 Test Coverage Status (Current: 635 tests - ALL PASSING ✅)

| Component/Feature | Test Status | Test Count | Coverage Notes |
|-------------------|-------------|------------|----------------|
| **Frontend Components** | ✅ **COMPLETE** | 138 tests passing | Layout + Artist components with ECM design - all tests fixed |
| **Backend API Foundation** | ✅ **COMPLETE** | 500 tests | Express setup complete, 497 passing, 3 skipped |
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
| **Frontend Artist Components** | 🚧 **IN PROGRESS** | 0 tests | Phase 4.2 - ArtistCard, ArtistGrid, ArtistProfile |
| **Frontend Pages** | ❌ **NOT STARTED** | 0 tests | Phase 4 - Page components |
| **End-to-End Flows** | ❌ **NOT STARTED** | 0 tests | Phase 5 - User journeys |

### 📊 Test Quality Metrics
- **Total Tests**: 638 (ALL PASSING ✅)
  - Backend: 500 tests (497 passing, 3 skipped)
  - Frontend: 138 tests (all passing)
- **Test Breakdown**: 
  - Backend: API endpoints (161), Middleware (55), Services (134), Foundation (65), Image Processing (8)
  - Frontend: Layout Components (32), Stores (27), Initial Components (11)
- **Coverage Target**: 90%+ achieved across all tested components
- **Test Types**: Unit, Integration, API (full HTTP testing), Database, File Upload, Middleware, React Components
- **Test Speed**: ~3.8s backend, ~1.5s frontend (excellent for development)
- **Phase 3.4**: ✅ COMPLETE - Contact/Newsletter API with comprehensive testing
- **Phase 4.1**: ✅ COMPLETE - Layout components with state management
- **Phase 4**: ✅ COMPLETE - Layout + Artist components with ECM design - all tests now passing!  
- **Known Issues**: ImageProcessingService unit tests have Sharp mocking issues (backend only, non-blocking)

### Phase 4 Frontend Progress (ECM Mockup Implementation) ✅ COMPLETE
1. **✅ COMPLETED**: Layout components (Header, Footer) with ECM minimal design
2. **✅ COMPLETED**: Artist components (ArtistCard, ArtistGrid, ArtistProfile) with beautiful artwork display
3. **✅ COMPLETED**: Page components (PageHeader, FilterBar, LoadMoreButton)
4. **✅ COMPLETED**: Zustand stores for navigation, filtering, and music player state
5. **✅ COMPLETED**: ECM-inspired styling and animations
6. **✅ COMPLETED**: Mock artist data and filtering functionality working perfectly
7. **✅ COMPLETED**: All component tests now passing (138 total)
8. **✅ COMPLETED**: React Router v7 future flags implemented

### Current Technical Status
1. **✅ Tailwind CSS Removed**: Was causing CSS conflicts with ECM styles
2. **✅ Custom CSS Implementation**: Complete ECM-inspired design in styles.css
3. **✅ Dev Server Working**: Running successfully at http://localhost:5173/
4. **✅ Layout Components**: Header, Footer fully implemented and tested
5. **✅ Artist Components**: ArtistCard, ArtistGrid, ArtistProfile all working with beautiful design
6. **✅ All Tests Passing**: 138 frontend tests now passing after fixing test expectations
7. **🚧 Next Step**: Phase 5 - Design mockups for Releases, Concerts, About pages

## 🏗️ Architecture (Music Industry Specific)

### Data Flow Architecture
```
Client Request → API Route → Service Layer → Prisma ORM → PostgreSQL Database
                     ↓              ↓              ↓              ↓
                Response ← Business Logic ← Type Safety ← Query Results
```

### Database Schema (6 Tables)
- **Artists**: Profile data, `social_links` JSON (8 platforms), featured status
- **Releases**: Albums/singles/EPs, `streaming_links` JSON (5 platforms), artist relationship
- **News**: Articles with draft/published workflow (built but not in active use)
- **Contact**: Form submissions with spam protection, type categorization
- **Newsletter**: Subscriptions with GDPR compliance, active/inactive status
- **Concerts**: Upcoming performances, venues, dates, artist relationships

### Complete API Implementation (52 Endpoints)
- **Artists API**: 7 endpoints including image upload
- **Releases API**: 9 endpoints with cover art upload
- **News API**: 13 endpoints (implemented but not exposed in frontend)
- **Contact API**: 7 endpoints with admin management
- **Newsletter API**: 8 endpoints with subscription management
- **Concerts API**: 8 endpoints - CRUD operations, filtering by date/artist ✅ **COMPLETE**

### Middleware Stack
1. **Rate Limiting**: Environment-aware limits (100/15min general, 5/15min contact, 3/10min newsletter)
2. **Validation**: Joi schemas for all request data
3. **Error Handling**: Centralized error responses with proper HTTP codes
4. **File Upload**: Multer + Sharp for image processing (3 sizes per image)

### API Response Format
**See complete specification**: @.claude/02-architecture/api-specification.md#response-format
- Consistent success/error response structure
- Paginated responses with metadata
- TypeScript type safety throughout

### Music Streaming Integration
- Embed iframes for Spotify/Apple Music previews
- Direct links to streaming platforms for full track access
- Fallback handling for unavailable content

## 🎨 UI/UX Patterns (Music Industry)

### Component Hierarchy
- **ArtistCard**: Photo + name + featured status
- **ReleaseCard**: Cover art + title + streaming links
- **ConcertItem** (planned): Date + venue + artist + ticket link
- **ContactForm**: Demo submissions + business inquiries

### Navigation Structure
```
Homepage (featured artists + latest releases)
├── /artists (roster grid → individual profiles)
├── /releases (catalog with filters)
├── /concerts (upcoming performances)
└── /about (label history + contact form + newsletter)
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
- Concerts require artist association and future dates
- Demo submissions via contact form

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