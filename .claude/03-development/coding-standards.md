# Project-Specific Coding Standards

## Key Project Decisions
- **Frontend Testing**: Vitest + React Testing Library (not Jest)
- **Backend Testing**: Jest + Supertest 
- **Styling**: Tailwind CSS with dark mode design system
- **Icons**: Lucide React library exclusively
- **Error Handling**: Return null for missing data, throw for system errors

## Project-Specific Types
- See database-schema.md for complete data structure definitions
- Use `ReleaseType = 'album' | 'single' | 'ep'` for type safety

## Component Patterns
- Functional components with TypeScript interfaces
- Custom hooks for reusable logic (useArtists, useReleases)
- Error boundaries for graceful error handling

## API Response Format
```typescript
// Consistent API response structure (matches api-specification.md)
interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
}
```

## Database Patterns
- Parameterized queries exclusively (no string concatenation)
- Transaction handling for multi-table operations
- Connection pooling and proper cleanup

## Tailwind Class Organization
```tsx
// Logical grouping: layout → spacing → colors → borders → effects
<div className="flex flex-col items-center p-6 m-4 bg-gray-900 text-white rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors">
```

## Git Conventions
- **Commits**: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`
- **Branches**: `feature/`, `fix/`, `hotfix/`, `docs/`