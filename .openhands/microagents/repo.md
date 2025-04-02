---
name: Repository Configuration
description: Core configuration and guidelines for the Libro 2 project
type: repo
author: OpenHands
version: 1.0.0
---

# Libro 2 Repository Guidelines

A modern web application for managing and cataloging books, built with React, TypeScript, and Supabase.

## Development Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Framework**: ShadCN
- **Backend**: Supabase
- **Database**: PostgreSQL
- **Testing**: Vitest + React Testing Library

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Route components
├── services/      # API service layers
├── contexts/      # React contexts
├── hooks/         # Custom React hooks
├── lib/          # Utilities and configurations
└── types/        # TypeScript type definitions
```

## Core Standards

### Code Quality
- TypeScript strict mode enabled
- Props interfaces required for all components
- Jest/Vitest for testing (90% coverage target)
- ESLint + Prettier for code formatting

### File Organization
- Components: `PascalCase.tsx`
- Hooks: `camelCase.ts` with 'use' prefix
- Tests: `ComponentName.test.tsx`
- Services: `camelCase.ts` with 'Service' suffix

### Database Practices
- Migrations for all schema changes
- Snake_case for database naming
- Timestamp tracking (created_at/updated_at)
- Explicit foreign key constraints

### Git Workflow
- Main branch: production-ready code
- Development branch: integration
- Feature branches: `feature/*`
- Fix branches: `fix/*`
- PR reviews required

## Security Requirements

- Row Level Security (RLS) enabled
- Environment variables for secrets
- Input validation required
- Regular dependency updates
- HTTPS enforced

## Performance Targets

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Bundle Size: < 250KB (gzipped)
- API Response: < 300ms

## Accessibility Standards

- WCAG 2.1 AA compliance
- Semantic HTML elements
- ARIA attributes where needed
- Keyboard navigation support
- Color contrast requirements met
