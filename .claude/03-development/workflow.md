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

### 4. Documentation Update (MANDATORY)
After each subtask completion, update relevant `.claude/` files:

**Always Update:**
- `development-plan.md` - Mark subtask [x] complete, update progress status
- `CLAUDE.md` - Update current status and test counts

**Update If Changed:**
- `api-specification.md` - If API endpoints/contracts changed
- `database-schema.md` - If schema or data structures changed  
- `security-model.md` - If security features/middleware added
- `testing-strategy.md` - If testing approaches evolved
- `troubleshooting.md` - If new issues/solutions discovered

**Documentation Principles:**
- Reflect actual implementation vs planned design
- Update test counts and status accurately
- Document any lessons learned or deviations
- Ensure documentation could guide a new developer

### 5. Full Regression Testing (MANDATORY)
```bash
# Run complete test suite to ensure no breaking changes
cd backend && npm test
cd frontend && npm test

# Fix any regressions before proceeding
# All tests must pass before commit
```

### 6. Git Operations (MANDATORY)
```bash
# Branch creation for features (if not already created)
git checkout -b feature/subtask-name

# Stage all changes including documentation updates
git add .

# Conventional commits with subtask reference
git commit -m "feat: complete Phase X.Y - [subtask description]

- Implementation details
- Tests: X passing
- Documentation: updated .claude/file.md
- Status: ready for next subtask"

# Push to remote for backup
git push origin feature/subtask-name

# Merge to main after validation (or continue on branch)
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

### Per Subtask (MANDATORY - ALL MUST BE COMPLETE)
- [ ] Tests written before implementation
- [ ] All subtask tests pass (100%)
- [ ] Coverage exceeds 90% for new code
- [ ] No TypeScript errors
- [ ] Code follows project standards
- [ ] **Documentation updated in relevant `.claude/` files**
- [ ] **Full regression test suite passes (backend + frontend)**
- [ ] **Changes committed to Git with descriptive message**
- [ ] Subtask marked [x] complete in development-plan.md

### Per Phase
- [ ] All subtasks completed with quality gates met
- [ ] Integration between components verified
- [ ] Performance targets met
- [ ] Security requirements satisfied
- [ ] **All documentation reflects actual implementation**
- [ ] **Complete test suite passes with no regressions**
- [ ] **Phase completion committed and tagged in Git**

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

# Frontend (in new terminal)
cd frontend && npm run dev      # React app (auto-opens browser)

# If port conflicts occur:
lsof -i :5173                  # Check what's using the port
kill -9 <PID>                  # Kill the process if needed
npm run dev                    # Start fresh
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