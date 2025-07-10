# 🎵 Cipher Grove Lab - Music Label Website

> **Plot twist**: This is my very first attempt at creating software! 🎭  
> **Co-pilot**: Claude AI (who's surprisingly patient with my "how do I computer?" questions)  
> **Status**: Learning to speak fluent JavaScript while building something actually cool

## What's This All About?

Welcome to my musical coding adventure! I'm building a modern music label website from scratch, and documenting every stumble, breakthrough, and "oh THAT'S what a function does" moment along the way.

### The Dream 🌟
A sleek, dark-themed website showcasing artists, releases, and concerts for an indie music label. Think ECM Records meets modern web design.

### The Reality 😅
Me asking Claude things like:
- "What's the difference between frontend and backend again?"
- "Why is my code angry? It's showing red squiggly lines everywhere"
- "Is 'npm' some kind of magic spell?"

## Tech Stack (aka "Things I'm Learning to Love")

- **Frontend**: React + TypeScript + Vite (because apparently TypeScript prevents me from breaking things)
- **Backend**: Node.js + Express + Prisma ORM (the server that serves... servers?)
- **Database**: PostgreSQL + Docker (it stores data in containers and doesn't judge my queries)
- **Testing**: Jest + Vitest + Supertest (because Claude insists good code needs tests - and wow, 518 tests!)
- **File Storage**: Express static serving with security headers (images now have a home!)
- **Validation**: Joi schemas (because users can't be trusted with form inputs)
- **Business Logic**: Enhanced services layer (I actually understand what this means now!)
- **Styling**: Custom CSS with ECM-inspired design (Tailwind was removed - too many conflicts!)
- **Dev Environment**: Docker containers (because apparently everything lives in boxes now)

## Features (Planned vs. Reality)

### ✅ What's Working (Backend Complete + Frontend in Progress!)
- [x] Project setup that doesn't immediately explode
- [x] **Comprehensive test infrastructure (643 total tests - 500 backend + 143 frontend)**
- [x] Docker PostgreSQL database with real data
- [x] **Enhanced database schema with image fields and platform support:**
  - [x] Artists table with 8 social platforms (Instagram, Spotify, YouTube, etc.)
  - [x] Releases table with 5 streaming platforms (Spotify, Apple Music, etc.)
  - [x] News table (built but not exposed in frontend)
  - [x] Contact & Newsletter tables with GDPR compliance
- [x] Prisma ORM for type-safe database operations
- [x] **Complete Backend REST API (52 endpoints across 6 modules):**
  - [x] **Artists API** - CRUD + image upload + featured management
  - [x] **Releases API** - CRUD + cover art + filtering/sorting
  - [x] **News API** - Built but not in active use (available for admin)
  - [x] **Contact API** - Form submissions with rate limiting
  - [x] **Newsletter API** - Subscriptions with GDPR compliance
  - [x] **Concerts API** - CRUD + filtering/sorting ✅ **COMPLETE**
- [x] **Image processing with Sharp** - Multi-size generation for uploads
- [x] **Comprehensive middleware stack** - Rate limiting, validation, error handling
- [x] **Frontend layout components** - Header, Footer, MainNav with ECM design
- [x] **State management** - Zustand stores for navigation and filtering
- [x] Security headers and CORS configuration
- [x] Error handling that doesn't just crash everything
- [x] Documentation that actually helps future-me

### 🚀 Current Priority (Phase 4 - Frontend Foundation)
- [ ] **Navigation updates** - Remove News/Shop, add Concerts
- [x] **Concerts database table** - Schema and migrations ✅ **COMPLETE**
- [x] **Concerts API** - CRUD endpoints with date/artist filtering ✅ **COMPLETE**
- [ ] **Enhanced artist components** - ArtistCard, ArtistGrid, ArtistProfile
- [ ] **Page components** - PageHeader, FilterBar, LoadMore

### 🌈 Next Up (Phase 5 - Design Mockups)
- [ ] **Artist page mockups** - 3 variations with ECM aesthetic
- [ ] **Releases page mockups** - Grid layout with filters
- [ ] **Concerts page mockups** - Chronological listing
- [ ] **About page mockups** - Label story + contact form

### 🎯 The Vision (Phase 6-7)
- [ ] **Page implementation** - Artist detail, Releases catalog, Concerts, About
- [ ] **Data integration** - TanStack Query for API calls
- [ ] **Performance optimization** - Image lazy loading, code splitting
- [ ] **Accessibility** - WCAG 2.1 AA compliance
- [ ] **Deployment** - Production-ready build

## My Learning Journey 📚

**Week 1**: "What's a repository?"  
**Week 2**: "I made a button and only cried twice!"  
**Week 3**: "My code compiled on the first try... this feels suspicious"  
**Week 4**: "I understand what 'props' means now (it's not just theater)"  
**Week 5**: "I wrote a service class and it actually works!"  
**Week 6**: "165 tests? I'm basically a developer now!"  
**Week 7**: "Understanding business logic validation feels like unlocking a superpower"  
**Week 8**: "File storage, enhanced schemas, platform validation - I built the foundation!"  
**Week 9**: "Honest assessment: 36 tests failing, but the services layer is solid!"  
**Week 10**: "Documentation accuracy matters - fixed all the progress tracking!"  
**Week 11**: "BREAKTHROUGH: Fixed all test issues! 165 tests passing - full TDD compliance!"  
**Week 12**: "PHASE 3 COMPLETE! Built a full REST API with 453 backend tests!"  
**Week 13**: "Frontend underway - layout components done, 65 tests passing!"  
**Week 14**: "Documentation alignment - News descoped, Concerts added to roadmap!"  

## Development Philosophy

1. **Test-Driven Development**: Write tests first, then make them pass (Claude's idea, surprisingly effective)
2. **Documentation Everything**: Future-me will thank present-me for explaining what this code does
3. **Small Steps**: Better to make tiny progress than giant mistakes
4. **Ask Questions**: Claude never judges my "why doesn't this work?" questions
5. **Celebrate Small Wins**: Successfully installing packages deserves a happy dance

## 📚 Learning Resources (NEW!)

This project now includes comprehensive documentation for different learning levels:

### **For Beginners** 
- **README.md** (this file): Friendly project overview with honest progress tracking
- **CLAUDE.md**: Project-specific development standards and achievement tracking

### **For Developers**
- **`.claude/README.md`**: Enterprise documentation navigation index
- **`.claude/03-development/`**: Professional development processes, testing strategies, troubleshooting

### **For Computer Science Students**
- **`explain_the_codebase.md`**: 3-level learning guide (849 lines!)
  - **Level 1**: The Big Picture (beginner-friendly)  
  - **Level 2**: Advanced Architecture (professional patterns)
  - **Level 3**: Computer Science Deep Dive (theoretical foundations)

### **For Enterprise Learning**
- **`.claude/02-architecture/`**: Database schema, API specs, security models
- **`.claude/06-domain/`**: Business rules and domain-driven design
- Complete enterprise-grade project documentation

## Getting Started (For Fellow Beginners)

```bash
# Clone this learning experiment
git clone https://github.com/logic1975/cipher_grove_lab.git

# Enter the musical coding zone
cd cipher_grove_lab

# Start the database (Docker magic)
cd backend
npm run db:start

# Install backend dependencies and setup database
npm install
npm run setup

# Install frontend dependencies (and pray)
cd ../frontend
npm install

# Run tests to make sure nothing's broken
cd ../backend
npm test

# Start the backend development server
npm run dev

# In a new terminal, start the frontend
cd ../frontend
npm run dev
```

## Development Server

### Frontend Development
To start the frontend development server:
```bash
cd frontend
npm run dev
```
The server will:
- Start on http://localhost:5173
- Open your browser automatically
- Provide hot module replacement (HMR)

If you encounter port conflicts:
```bash
# Check what's using port 5173
lsof -i :5173

# Kill the process if needed
kill -9 <PID>

# Start fresh
npm run dev
```

## Project Structure (aka "Where I Put Things")

```
cipher_grove_lab/
├── frontend/          # The pretty stuff users see
├── backend/           # The smart stuff that makes it work
│   ├── prisma/        # Database schema and migrations
│   ├── src/
│   │   ├── services/  # Business logic layer (NEW!)
│   │   ├── __tests__/ # Comprehensive test suite (NEW!)
│   │   └── config/    # Database and app configuration
│   └── uploads/       # File storage for images (NEW!)
├── database/          # Docker database initialization
├── .claude/           # Enterprise-grade documentation
│   ├── README.md      # Documentation navigation index  
│   ├── 02-architecture/ # Target specs (database, API, security)
│   ├── 03-development/  # Process, testing, troubleshooting
│   └── ...            # Business rules, design system
├── docker-compose.yml # Database container setup
├── CLAUDE.md          # My project bible and progress tracker
├── explain_the_codebase.md # 3-level learning guide (beginner → advanced)
└── README.md          # You are here! 👋
```

## Contributing (If You're Brave Enough)

This is a learning project, so:
- **Bug reports**: "Your code doesn't work" is valid feedback
- **Suggestions**: "Maybe try not breaking everything" is appreciated
- **Pull requests**: Welcome, but remember I'm still figuring out what a merge conflict is
- **Patience**: Required when reading my commit messages

## Acknowledgments

- **Claude AI**: For not giving up on me when I asked "how do I make the computer do the thing?"
- **Stack Overflow**: For existing and having answers to questions I didn't know I had
- **Coffee**: For obvious reasons
- **My Rubber Duck**: Silent but effective debugging partner

## License

MIT License - Feel free to use this code, laugh at my comments, or learn from my mistakes!

---

*"The best way to learn is to build something real, even if you have no idea what you're doing."* - Probably someone wise, definitely how I feel right now.

**Current Status**: 🎯 Backend 100% Complete | Frontend Phase 4.4 In Progress | 643 Total Tests! 🎯

**Latest Achievement**: Concerts API fully implemented! Database table, service layer, 8 REST endpoints with filtering, and comprehensive testing all complete. Backend now has 52 total endpoints across 6 modules! 🚀

**What's Actually Working**: Complete backend API (52 endpoints), image processing, file uploads, rate limiting, validation middleware, frontend layout components with ECM design, state management with Zustand, and a rock-solid test suite (500 backend + 143 frontend tests)! 🎵