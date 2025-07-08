# Update Documentation
> Follow these instructions to update all project documentation to reflect the current state of the cipher_grove_lab music label website.

## 1. Analyze Current Project State

### Check Backend Test Status
```bash
cd backend && npm test 2>&1 | tail -20
```
> Note the total number of tests passing and any failures

### Count Test Files
```bash
# Count backend test files
find backend/src -name "*.test.ts" -o -name "*.test.js" | wc -l

# Count frontend test files  
find frontend/src -name "*.test.tsx" -o -name "*.test.ts" | wc -l
```

### Count API Endpoints
> Analyze the route files to count endpoints:
```bash
# Count endpoints per module
grep -E "router\.(get|post|put|delete|patch)" backend/src/routes/artists.ts | wc -l
grep -E "router\.(get|post|put|delete|patch)" backend/src/routes/releases.ts | wc -l
grep -E "router\.(get|post|put|delete|patch)" backend/src/routes/news.ts | wc -l
grep -E "router\.(get|post|put|delete|patch)" backend/src/routes/contact.ts | wc -l
grep -E "router\.(get|post|put|delete|patch)" backend/src/routes/newsletter.ts | wc -l
```

## 2. Update Documentation Files

### Update CLAUDE.md
- Update the "Current Status" section with actual test counts
- Update "Backend Implementation Summary" with correct endpoint counts
- Update any progress indicators or phase completions
- Ensure architecture section reflects actual implementation

### Update .claude/README.md
- Update the status line at the top
- Update "Quick Reference" table with actual counts
- Update "Backend Implementation Summary" section
- Ensure API module list reflects actual endpoints per module

### Update .claude/03-development/development-plan.md
- Update "Current Progress Summary" date
- Update test coverage status with actual numbers
- Update any completed phases or tasks
- Ensure "Backend Implementation Summary" matches reality

### Update .claude/02-architecture/api-specification.md
- Update endpoint counts in headers (e.g., "Artists API (X endpoints)")
- Update the implementation status at the top
- Ensure all documented endpoints match actual implementation
- Update "Implementation Summary" section

### Update .claude/02-architecture/system-overview.md
- Ensure technology stack reflects actual dependencies
- Update any architecture diagrams if needed
- Verify data flow descriptions match implementation

## 3. Verification Steps

### Check for Consistency
- Ensure all files report the same test counts
- Ensure all files report the same endpoint counts
- Verify phase/status descriptions are consistent
- Check that dates are current where applicable

### Common Values to Update
- Backend test count (check actual number)
- Frontend test count (check actual number)
- Total API endpoints (sum of all modules)
- Individual module endpoint counts
- Current date in progress sections
- Phase completion status

## 4. Report Changes

After updating, create a summary of what was changed:
```
Documentation Update Summary:
- Updated test counts: Backend (X → Y), Frontend (A → B)
- Updated API endpoint counts: Total (X → Y)
- Updated progress status in development-plan.md
- Corrected [any other specific changes]
- All documentation now reflects current implementation state
```

## Important Notes
- DO NOT automatically commit changes
- Report what was updated so the user can review
- If unsure about a value, check the actual implementation
- Maintain consistency across all documentation files