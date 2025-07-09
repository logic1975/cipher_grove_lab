# Documentation Index

**Navigation guide for cipher_grove_lab enterprise-grade documentation**  
**Status**: ✅ Backend 100% Complete | 🚧 Frontend Phase 4.2 In Progress

## 📋 Quick Reference

| Need to Find | Go To |
|--------------|-------|
| **Project Overview** | `../CLAUDE.md` |
| **Current Status** | Backend complete (450 tests passing, 3 skipped), Frontend in progress (65 tests all passing) |
| **Technology Stack** | `02-architecture/system-overview.md#technology-stack` |
| **Database Schema** | `02-architecture/database-schema.md` (5 tables) |
| **API Endpoints** | `02-architecture/api-specification.md` (46 endpoints) |
| **Testing Strategy** | `03-development/testing-strategy.md` |
| **Development Plan** | `03-development/development-plan.md` |
| **Test Helpers** | `03-development/test-helpers.md` |
| **Business Rules** | `06-domain/business-rules.md` |

## 🏗️ Architecture Documentation

### Core System Design
- **`02-architecture/system-overview.md`** - Complete architecture with data flow diagrams
- **`02-architecture/database-schema.md`** - 5 tables (Artists, Releases, News*, Contact, Newsletter) + Concerts planned
- **`02-architecture/api-specification.md`** - ✅ 46 REST endpoints fully documented (News API built but not in active use)
- **`02-architecture/security-model.md`** - Enterprise security practices and implementation

*Note: News functionality was fully implemented but is not exposed in the frontend per updated project scope

## 🔧 Development Resources

### Process and Standards
- **`03-development/development-plan.md`** - Phase-based roadmap with enterprise project management
- **`03-development/workflow.md`** - Enhanced TDD workflow with documentation and regression requirements
- **`03-development/testing-strategy.md`** - Comprehensive TDD approach with testing pyramid
- **`03-development/test-helpers.md`** - Reusable test patterns and mock data utilities
- **`03-development/coding-standards.md`** - Project-specific coding standards and patterns
- **`03-development/troubleshooting.md`** - Common issues and solutions

## 🎯 Project Context

### Business and Requirements
- **`01-project/overview.md`** - Business goals and project scope
- **`01-project/requirements.md`** - Technical requirements and acceptance criteria
- **`06-domain/business-rules.md`** - Music industry-specific business logic

### Design and UX
- **`04-design/design-system.md`** - UI specifications, colors, typography, components

## 📚 Cross-Reference Guide

### When You Need...

**Database Information**: Start with `database-schema.md` for JSON structures, reference from API spec
**API Types**: Defined in `api-specification.md`, with data structures in `database-schema.md`
**Testing Patterns**: Main strategy in `testing-strategy.md`, helpers in `test-helpers.md`
**Enterprise Standards**: Security in `security-model.md`, business rules in `business-rules.md`

### Authoritative Sources
- **Technology Stack**: `system-overview.md` (authoritative)
- **Data Structures**: `database-schema.md` (authoritative)  
- **Testing Standards**: `testing-strategy.md` (authoritative)
- **API Contracts**: `api-specification.md` (authoritative)

## ✅ Backend Implementation Summary

### Complete Features (Phase 1-3)
- **REST APIs**: 46 endpoints across Artists, Releases, News, Contact, Newsletter
- **Middleware Stack**: Rate limiting, validation (Joi), error handling, file upload
- **Services Layer**: Complete business logic with 90%+ test coverage
- **Database**: 5 tables with relationships, indexes, and constraints
- **File Storage**: Image upload with multi-size processing (Sharp)
- **Testing**: 453 tests (450 passing, 3 skipped)

### API Modules
1. **Artists API** (7 endpoints) - CRUD + image upload + featured management
2. **Releases API** (9 endpoints) - CRUD + cover art + statistics
3. **News API** (13 endpoints) - Fully implemented but not exposed in frontend
4. **Contact API** (7 endpoints) - Submissions + admin management
5. **Newsletter API** (8 endpoints) - Subscriptions + GDPR compliance
6. **Concerts API** (planned) - To be implemented in Phase 4.4

## 🔄 Documentation Principles

1. **Single Source of Truth**: Each concept has one authoritative location
2. **Cross-Referencing**: Use `@filename.md#section` format for links
3. **Enterprise Focus**: Maintain professional standards for learning purposes
4. **Consistency**: Standardized terminology across all documents

---

*This index ensures efficient navigation and reduces context window usage while maintaining comprehensive enterprise-grade documentation.*