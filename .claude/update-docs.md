# Update Documentation
> Efficiently update all project documentation to reflect current implementation state

## 1. Quick Status Check

### Single Command to Get All Counts
```bash
# From any directory, find project root and get all counts at once
cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)" && echo "=== PROJECT STATUS ===" && \
echo "Backend Tests: $(cd backend 2>/dev/null && npm test --silent 2>&1 | grep -E 'Tests:|Test Suites:' | tail -1 || echo 'Backend not found')" && \
echo "Frontend Tests: $(cd frontend 2>/dev/null && npm test --silent 2>&1 | grep -E 'Tests:|Test Suites:' | tail -1 || echo 'Frontend not found')" && \
echo "API Endpoints: Artists($(grep -c 'router\.' backend/src/routes/artists.ts 2>/dev/null || echo 0)) Releases($(grep -c 'router\.' backend/src/routes/releases.ts 2>/dev/null || echo 0)) News($(grep -c 'router\.' backend/src/routes/news.ts 2>/dev/null || echo 0)) Contact($(grep -c 'router\.' backend/src/routes/contact.ts 2>/dev/null || echo 0)) Newsletter($(grep -c 'router\.' backend/src/routes/newsletter.ts 2>/dev/null || echo 0))" && \
echo "Database Tables: $(grep -c '^model ' backend/prisma/schema.prisma 2>/dev/null || echo 0)" && \
echo "=== END STATUS ==="
```

### Alternative: Step-by-step (if single command fails)
```bash
# Find project root
cd "$(git rev-parse --show-toplevel)" || cd "$(find . -name 'CLAUDE.md' -type f -exec dirname {} \; | head -1)" 

# Get test counts
echo "Backend: $(cd backend && npm test --passWithNoTests --silent 2>&1 | grep 'Tests:' | tail -1)"
echo "Frontend: $(cd frontend && npm test --passWithNoTests --silent 2>&1 | grep 'Tests:' | tail -1)"

# Get API endpoint counts (total only)
echo "Total API Endpoints: $(find backend/src/routes -name '*.ts' -exec grep -c 'router\.' {} \; 2>/dev/null | awk '{sum+=$1} END {print sum}')"

# Get table count
echo "Database Tables: $(grep -c '^model ' backend/prisma/schema.prisma)"
```

## 2. Key Files to Update

Based on current implementation, update these values in order:

### Update Priority (minimize redundant changes):
1. **CLAUDE.md** - Main project status (most visible)
2. **.claude/README.md** - Quick reference table  
3. **.claude/03-development/development-plan.md** - Progress tracking
4. **.claude/02-architecture/api-specification.md** - API counts only

### Values to Update:
- Backend test count: `X passed, Y skipped (Z total)`
- Frontend test count: `X tests`  
- Database table count: `6 tables` (was 5, now includes Concerts)
- API endpoint total: Count from routes files
- Current date in progress sections: Today's date

## 3. Efficient Update Strategy

Instead of updating every mention, focus on:

1. **Status lines only** (not detailed explanations)
2. **Quick reference tables** (most frequently viewed)
3. **Current phase indicators** (development-plan.md)
4. **Add Concerts table note** where database is mentioned

## 4. Verification

```bash
# Quick consistency check - should all show same values
grep -r "Backend.*test" CLAUDE.md .claude/README.md .claude/03-development/development-plan.md | head -5
```

## 5. Common Patterns to Find/Replace

- `5 tables` → `6 tables`
- `450 tests passing, 3 skipped` → `[actual current count]`
- `65 tests all passing` → `[actual current count]`
- `46 endpoints` → `[actual current count]`
- `(Phase 4.2` → Update to current phase
- Date patterns like `July 08, 2025` → Current date

## Notes:
- Focus on consistency across 3-4 key files rather than exhaustive updates
- Use actual test output format for accuracy
- Don't update implementation details, just status/counts
- Skip files that are purely instructional/static