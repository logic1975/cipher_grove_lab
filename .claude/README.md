# Documentation Index

**Navigation guide for cipher_grove_lab enterprise-grade documentation**

## 📋 Quick Reference

| Need to Find | Go To |
|--------------|-------|
| **Project Overview** | `../CLAUDE.md` |
| **Technology Stack** | `02-architecture/system-overview.md#technology-stack` |
| **Database Schema** | `02-architecture/database-schema.md` |
| **API Endpoints** | `02-architecture/api-specification.md` |
| **Testing Strategy** | `03-development/testing-strategy.md` |
| **Development Plan** | `03-development/development-plan.md` |
| **Test Helpers** | `03-development/test-helpers.md` |
| **Business Rules** | `06-domain/business-rules.md` |

## 🏗️ Architecture Documentation

### Core System Design
- **`02-architecture/system-overview.md`** - Technology stack, data flow, deployment architecture
- **`02-architecture/database-schema.md`** - Complete schema with JSON field structures
- **`02-architecture/api-specification.md`** - REST API contracts with TypeScript types
- **`02-architecture/security-model.md`** - Enterprise security practices and implementation

## 🔧 Development Resources

### Process and Standards
- **`03-development/development-plan.md`** - Phase-based roadmap with enterprise project management
- **`03-development/testing-strategy.md`** - Comprehensive TDD approach with testing pyramid
- **`03-development/test-helpers.md`** - Reusable test patterns and mock data utilities
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

## 🔄 Documentation Principles

1. **Single Source of Truth**: Each concept has one authoritative location
2. **Cross-Referencing**: Use `@filename.md#section` format for links
3. **Enterprise Focus**: Maintain professional standards for learning purposes
4. **Consistency**: Standardized terminology across all documents

---

*This index ensures efficient navigation and reduces context window usage while maintaining comprehensive enterprise-grade documentation.*