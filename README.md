# 🎵 Cipher Grove Lab - Music Label Website

> **Plot twist**: This is my very first attempt at creating software! 🎭  
> **Co-pilot**: Claude AI (who's surprisingly patient with my "how do I computer?" questions)  
> **Status**: Learning to speak fluent JavaScript while building something actually cool

## What's This All About?

Welcome to my musical coding adventure! I'm building a modern music label website from scratch, and documenting every stumble, breakthrough, and "oh THAT'S what a function does" moment along the way.

### The Dream 🌟
A sleek, dark-themed website showcasing artists, releases, and news for an indie music label. Think Spotify meets your favorite underground label's aesthetic.

### The Reality 😅
Me asking Claude things like:
- "What's the difference between frontend and backend again?"
- "Why is my code angry? It's showing red squiggly lines everywhere"
- "Is 'npm' some kind of magic spell?"

## Tech Stack (aka "Things I'm Learning to Love")

- **Frontend**: React + TypeScript + Vite (because apparently TypeScript prevents me from breaking things)
- **Backend**: Node.js + Express + Prisma ORM (the server that serves... servers?)
- **Database**: PostgreSQL + Docker (it stores data in containers and doesn't judge my queries)
- **Testing**: Jest + Vitest + Supertest (because Claude insists good code needs tests - and wow, 165 tests!)
- **File Storage**: Express static serving with security headers (images now have a home!)
- **Validation**: Joi schemas (because users can't be trusted with form inputs)
- **Business Logic**: Enhanced services layer (I actually understand what this means now!)
- **Styling**: Tailwind CSS (utility classes that make me feel like a CSS wizard)
- **Dev Environment**: Docker containers (because apparently everything lives in boxes now)

## Features (Planned vs. Reality)

### ✅ What's Working (Phase 2.5 Complete - Services Layer Built!)
- [x] Project setup that doesn't immediately explode
- [x] **Comprehensive test infrastructure (165 tests - 129 passing, 36 need fixes)**
- [x] Docker PostgreSQL database with real data
- [x] **Enhanced database schema with image fields and platform support:**
  - [x] Artists table with 8 social platforms (Instagram, Spotify, YouTube, etc.)
  - [x] Releases table with 5 streaming platforms (Spotify, Apple Music, etc.)
  - [x] News table with publish/draft workflow and auto-slug generation
- [x] Prisma ORM for type-safe database operations
- [x] Sample data: 3 artists, 4 releases, 3 news articles seeded
- [x] **File storage system with Express static serving + security headers**
- [x] **Business logic services layer (the heart of the system!):**
  - [x] ArtistService - Featured artist limits (max 6), social platform validation
  - [x] ReleaseService - Streaming platform validation, artist relationships
  - [x] NewsService - Publishing workflow, slug generation, search functionality
- [x] **Advanced validation with Joi schemas for all 13 platforms**
- [x] **Business rule enforcement across the entire system**
- [x] Documentation that actually helps future-me
- [x] Git commits that tell a coherent story

### ⚠️ Current Priority (Fix & Build Phase 3)
- [ ] **Fix 36 failing foundation tests to restore TDD compliance**
- [ ] **REST API endpoints that actually use our awesome services** 
- [ ] **Image upload processing with multer + sharp (make those artist photos shine!)**
- [ ] **API middleware for validation, error handling, and rate limiting**
- [ ] Security headers and CORS configuration
- [ ] Comprehensive API testing with Supertest
- [ ] Error handling that doesn't just crash everything

### 🌈 What I Dream About (Phase 4+)
- [ ] **Frontend components that look professional (not like a 90s website)**
- [ ] **Music player with Howler.js that actually plays music**
- [ ] **Artist profiles with all those social platform links working**
- [ ] Contact forms that don't just vanish into the digital void
- [ ] Spotify integration that actually works
- [ ] Animations that don't make people dizzy
- [ ] Code so clean it sparks joy
- [ ] Zero console errors (ambitious, I know)

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

# Start the development servers and watch the magic happen
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

**Current Status**: 🎵 Phase 2.5 COMPLETE! Built a robust services layer with business logic, file storage, and comprehensive platform validation. Need to fix failing tests, then ready for REST APIs! 🎵

**Latest Achievement**: Honest documentation! Fixed test counts (165 tests, 36 failing), corrected progress tracking, and eliminated redundancy across enterprise-grade documentation. Plus added comprehensive codebase explanation guide! 📚

**What's Actually Working**: File uploads, 13 platform validations (8 social + 5 streaming), featured artist limits, auto-slug generation, publish/draft workflows, enterprise documentation, and complete learning resources! Time to fix those tests and build Phase 3! 🎯