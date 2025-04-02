# Repository: Libro 2

## Overview
Libro 2 is a web application for managing and cataloging books, built with React, TypeScript, and Supabase. This document serves as the central repository guidelines document that is automatically loaded by OpenHands when working with this repository.

## Architecture

### Frontend
- React + TypeScript application
- Vite as build tool
- ShadCN UI components
- Client-side routing with custom implementation
- Responsive design for mobile and desktop views

### Backend
- Supabase for backend services
  - Authentication
  - Database
  - Storage
- PostgreSQL database with migrations

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

## Coding Standards

### TypeScript
- Strict type checking enabled
- Interfaces preferred over type aliases when possible
- Generic types should be descriptive and meaningful

### React
- Functional components with hooks
- Props interfaces must be defined for all components
- Custom hooks for shared logic
- Context API for global state management

### Testing
- Jest + React Testing Library
- Tests located next to implementation files
- Coverage requirements:
  - Components: 90%
  - Services: 85%
  - Utils: 80%

### File Naming
- React components: PascalCase (.tsx)
- Hooks: camelCase with 'use' prefix
- Services: camelCase with 'Service' suffix
- Test files: ComponentName.test.tsx

## Database Guidelines

### Migrations
- All schema changes must be made through migrations
- Migrations must be reversible
- Follow the naming convention: YYYYMMDDHHMMSS_descriptive_name.sql

### Tables
- Use snake_case for table and column names
- Include created_at and updated_at timestamps
- Foreign key constraints must be explicitly named

## Git Workflow

### Branches
- main: production-ready code
- development: integration branch
- feature/*: new features
- fix/*: bug fixes

### Commits
- Conventional Commits format
- Present tense, imperative mood
- Reference issue numbers when applicable

### Pull Requests
- Required reviews: 1
- Must pass CI checks
- Must be up to date with base branch

## Environment Setup
- Node.js 18+ required
- Supabase CLI for local development
- Environment variables specified in .env.example

## Security Guidelines
- No sensitive data in logs
- API keys and secrets managed through environment variables
- Regular dependency updates
- Input validation on all user inputs

## Performance Standards
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- Bundle size < 250KB (gzipped)
- API response time < 300ms

## Accessibility
- WCAG 2.1 AA compliance required
- Semantic HTML elements
- Proper ARIA attributes
- Keyboard navigation support
- Color contrast ratios meet standards

## Memory Bank Organization
- facts/: Architectural decisions and service documentation
- procedures/: Step-by-step guides for common tasks
- rules/: Project conventions and integration guidelines
- schemas/: Database and API schemas

This document serves as the primary repository configuration for OpenHands AI assistance. All repository-specific instructions are consolidated here for consistent AI interactions across the project.
