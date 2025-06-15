# AI Development Workflow

## Development Process Overview
This workflow is designed for AI-assisted development where Claude implements features systematically following TDD principles.

## Task Execution Cycle

### 1. Task Selection
- Reference `development-plan.md` for current phase tasks
- Select next pending [ ] substep
- Mark as in-progress before beginning

### 2. TDD Implementation (MANDATORY)
```bash
# For each substep:
# 1. Write comprehensive tests first
# 2. Implement minimum code to pass tests
# 3. Verify 90%+ coverage + all tests pass
# 4. Mark substep [x] complete in development-plan.md
```

### 3. Code Quality Validation
- TypeScript strict mode compliance
- ESLint standards adherence
- Consistent API response formats
- Proper error handling patterns

### 4. Git Operations
```bash
# Branch creation for features
git checkout -b feature/component-name

# Conventional commits
git commit -m "feat: implement artist profile with tests"

# Merge to main after validation
```

## Project Structure Management

### File Organization
- Frontend: `frontend/src/` with components, pages, hooks, types
- Backend: `backend/src/` with routes, models, controllers, middleware
- Tests: Co-located with source files (`*.test.tsx`, `*.test.js`)

### Configuration Files
- `vitest.config.ts` for frontend testing
- `jest.config.js` for backend testing  
- `tailwind.config.js` for styling
- `.env` files for environment variables

## Quality Gates

### Per Substep
- [ ] Tests written before implementation
- [ ] All tests pass (100%)
- [ ] Coverage exceeds 90%
- [ ] No TypeScript errors
- [ ] Code follows project standards

### Per Phase
- [ ] All substeps completed and tested
- [ ] Integration between components verified
- [ ] Performance targets met
- [ ] Security requirements satisfied

## Database Operations
```bash
# Migration workflow
npm run db:migrate        # Apply schema changes
npm run db:rollback       # Revert if needed
npm run db:seed          # Load test data
```

## Environment Setup
```bash
# Service startup
brew services start postgresql  # Database
cd backend && npm run dev       # API server
cd frontend && npm run dev      # React app
```

## Documentation Maintenance
- Update `development-plan.md` progress after each substep
- Keep API documentation current with implementation
- Document any deviations from original plan
- Maintain troubleshooting guide with project-specific issues

## Error Recovery
- Systematic rollback to last working state
- Issue documentation for future reference
- Pattern identification for prevention