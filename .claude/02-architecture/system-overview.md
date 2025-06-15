# System Architecture Overview

## High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   React/TS      │◄──►│   Node.js       │◄──►│   PostgreSQL    │
│   Tailwind CSS  │    │   Express.js    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                        │                        │
        │                        │                        │
        ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/Static    │    │   External APIs │    │   File Storage  │
│   Assets        │    │   Streaming     │    │   Images/Media  │
│                 │    │   Services      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite (fast development and optimized builds)
- **Styling**: Tailwind CSS (utility-first, responsive design)
- **Routing**: React Router v6 (client-side routing)
- **State Management**: React Context + useReducer (simple state needs)
- **HTTP Client**: Fetch API with custom hooks
- **Icons**: Lucide React (consistent, lightweight icons)

### Backend
- **Runtime**: Node.js (LTS version)
- **Framework**: Express.js (minimal, flexible web framework)
- **Language**: TypeScript (type safety and developer experience)
- **Authentication**: JWT (if needed for admin features)
- **Validation**: Joi or Zod (request validation)
- **Logging**: Winston (structured logging)

### Database
- **Primary Database**: PostgreSQL (ACID compliance, JSON support)
- **Connection Pool**: node-postgres (pg) with connection pooling
- **Migrations**: Custom migration system or Knex.js
- **Backup Strategy**: Automated daily backups

### Development & Testing
- **Frontend Testing**: Vitest + React Testing Library
- **Backend Testing**: Jest + Supertest
- **E2E Testing**: Playwright (cross-browser testing)
- **Code Quality**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode

## Data Flow

### 1. User Request Flow
```
User Request → React Router → Component → Custom Hook → API Call → Express Route → Controller → Database → Response
```

### 2. Static Assets Flow
```
Image Request → CDN/Static Server → Optimized Image → Browser Cache
```

### 3. Music Preview Flow
```
Play Request → Component → External API (Spotify/SoundCloud) → Embedded Player → Audio Stream
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