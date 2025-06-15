# Project-Specific Troubleshooting

## Critical Issues Specific to This Stack

### Vitest vs Jest Confusion
**Problem**: Wrong test runner being used
**Solution**: Frontend uses Vitest, Backend uses Jest - ensure correct config files

### Database Schema Conflicts
**Problem**: Artists/Releases foreign key violations
**Solution**: Ensure artists exist before creating releases, check migration order

### Music Streaming API Integration
**Problem**: Spotify/Apple Music embed issues
**Solution**: Verify CORS settings allow streaming domains in CSP

### Dark Mode Color Variables
**Problem**: CSS variables not loading correctly
**Solution**: Check Tailwind config and CSS variable definitions in design system

### PostgreSQL Connection in Tests
**Problem**: Test database conflicts
**Solution**: Use separate test database, ensure proper cleanup in afterEach hooks

### Rate Limiting Conflicts
**Problem**: Development requests being rate limited
**Solution**: Disable rate limiting in development environment

## Quick Fixes

### Port Conflicts
```bash
# Kill processes on common ports
kill -9 $(lsof -ti:5173)  # Frontend
kill -9 $(lsof -ti:3000)  # Backend
kill -9 $(lsof -ti:5432)  # PostgreSQL
```

### Clear Caches
```bash
rm -rf node_modules && npm install  # Dependencies
npx vitest --run --reporter=verbose  # Vitest cache
```

### Database Reset
```bash
npm run db:rollback  # Reset migrations
npm run db:migrate   # Apply migrations
npm run db:seed      # Seed test data
```