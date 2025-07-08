# System Architecture Overview

## High-Level Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Frontend      │         │  Backend API    │         │   Database      │
│   React/TS      │◄────────│  Node.js/Express│────────►│   PostgreSQL    │
│   Custom CSS    │  REST   │  TypeScript     │ Prisma  │   5 Tables      │
└─────────────────┘         └─────────────────┘         └─────────────────┘
        │                           │                            │
        │                           ▼                            │
        │                   ┌─────────────────┐                 │
        │                   │ Services Layer  │                 │
        │                   │ Business Logic  │                 │
        │                   │ Validation      │                 │
        │                   └─────────────────┘                 │
        │                           │                            │
        ▼                           ▼                            ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   File Storage  │    │  Middleware     │    │   Indexes &     │
│   /uploads/     │    │  Stack          │    │   Relations     │
│   Images        │    │  Rate Limiting  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite (fast development and optimized builds)
- **Styling**: Custom CSS with ECM-inspired minimal design (Tailwind removed)
- **Routing**: React Router v6 (client-side routing)
- **State Management**: Zustand (lightweight, TypeScript-first) + TanStack Query (API caching)
- **HTTP Client**: TanStack Query with custom hooks
- **Icons**: Lucide React (consistent, lightweight icons)
- **Audio Handling**: Howler.js for enhanced music player functionality
- **Testing**: Vitest + React Testing Library (65 tests all passing)

### Backend (✅ 100% COMPLETE - 453 tests)
- **Runtime**: Node.js (LTS version)
- **Framework**: Express.js v5 (minimal, flexible web framework)
- **Language**: TypeScript (type safety and developer experience)
- **ORM**: Prisma (type-safe database layer with migrations)
- **APIs**: 46 REST endpoints across 5 modules
- **Validation**: Joi (comprehensive request validation)
- **Rate Limiting**: express-rate-limit v7 (multi-tier protection)
- **File Processing**: Multer + Sharp (image upload and optimization)
- **Error Handling**: Centralized with consistent error codes
- **Business Logic**: Complete services layer with validation

### Database (5 Tables)
- **Primary Database**: PostgreSQL (ACID compliance, JSON support)
- **Tables**: Artists, Releases, News, Contact, Newsletter
- **ORM**: Prisma with type-safe queries and migrations
- **Connection Pool**: Prisma connection pooling
- **Containerization**: Docker PostgreSQL with automatic setup
- **Features**: JSON fields for social/streaming links, relationships, indexes

### Development & Testing
- **Frontend Testing**: Vitest + React Testing Library
- **Backend Testing**: Jest + Supertest
- **E2E Testing**: Playwright (cross-browser testing)
- **Code Quality**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode

## Data Flow

### 1. Complete API Request Flow
```
Client Request → Express Route → Middleware Stack → Service Layer → Prisma ORM → PostgreSQL
       ↓               ↓                ↓                ↓              ↓            ↓
   Response ← JSON Transform ← Business Logic ← Validation ← Type Safety ← Query Result
```

### 2. Middleware Processing
```
Request → Rate Limiting → Validation (Joi) → Error Handler → Route Handler → Service
```

### 3. File Upload Flow
```
Image Upload → Multer → Sharp Processing → Multi-size Generation → Disk Storage → Database Update
```

### 4. Static Assets Flow
```
Image Request → Express Static → Cache Headers → Optimized Image → Browser Cache
```

## Security Architecture

### Frontend Security
- Content Security Policy (CSP)
- XSS protection via React's built-in escaping
- HTTPS enforcement
- Secure cookie handling

### Backend Security
- Helmet.js for security headers
- Rate limiting (express-rate-limit)
- Input validation and sanitization
- CORS configuration
- Environment variable protection

### Database Security
- Connection string encryption
- SQL injection prevention (parameterized queries)
- Database user with minimal privileges
- Regular security updates

## Performance Strategy

### Frontend Performance
- Code splitting by route
- Lazy loading for images and components
- Service worker for caching (if needed)
- Bundle optimization with Vite

### Backend Performance
- Response caching for static data
- Database query optimization
- Connection pooling
- Compression middleware

### Database Performance
- Proper indexing strategy
- Query optimization
- Connection pooling
- Regular performance monitoring

## Scalability Considerations

### Horizontal Scaling
- Stateless backend design
- Database connection pooling
- Load balancer ready architecture

### Vertical Scaling
- Efficient database queries
- Memory management
- CPU-optimized operations

### Future Enhancements
- Redis for session storage and caching
- CDN for global asset delivery
- Database read replicas
- Microservices architecture (if needed)

## Deployment Architecture

### Development Environment
- Local PostgreSQL instance
- Vite dev server (frontend)
- Nodemon for backend development

### Production Environment
- Docker containers (optional)
- Reverse proxy (Nginx)
- Process manager (PM2)
- Database hosting (managed PostgreSQL)
- Static asset CDN