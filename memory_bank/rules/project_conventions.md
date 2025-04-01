# Project Conventions and Rules

## Database Rules

1. All database changes must be made through migration files
2. Never modify existing migration files, always create new ones
3. Migration files must use the timestamp naming format: YYYYMMDDHHMMSS_descriptive_name.sql
4. Tables containing user data must implement Row Level Security (RLS)

## Project Structure

1. React components go in `src/components/`
2. Pages/routes go in `src/pages/`
3. Business logic goes in service files under `src/services/`
4. Types and interfaces go in `src/types/`
5. Utility functions go in `src/lib/`
6. Context providers go in `src/contexts/`
7. Custom hooks go in `src/hooks/`

## Component Rules

1. Each component should be in its own file
2. UI components should be stored in `src/components/ui/`
3. Component files should match their component name (e.g., BookCard.tsx)
4. Dialog components should end with "Dialog" (e.g., BookFormDialog.tsx)

## Service Layer Rules

1. Each domain entity should have its own service
2. Services should be organized by feature/entity
3. External integrations should be isolated in dedicated services
4. Services should abstract database and API interactions

## Naming Conventions

1. TypeScript files use .ts extension, React component files use .tsx
2. Components use PascalCase (e.g., BookCard)
3. Services use camelCase with "Service" suffix (e.g., bookService)
4. Database tables use snake_case
5. Files use appropriate suffixes:
   - Components: .tsx
   - Services: Service.ts
   - Contexts: Context.tsx
   - Types: .ts

## State Management

1. User authentication state managed through UserContext
2. Component-level state using React hooks
3. Form state managed through form components

## Type Safety

1. Use TypeScript for all new code
2. Define interfaces for data structures in types/
3. Use proper type annotations for function parameters and returns

## Security and Compliance

1. All development must follow OWASP security guidelines (https://owasp.org/)
2. Implement input validation and sanitization
3. Use proper authentication and authorization checks
4. Follow secure session management practices
5. Implement proper error handling without exposing sensitive details
6. Use secure communication protocols (HTTPS)
7. Keep dependencies updated and monitor for security vulnerabilities

## Logging and Debugging

1. Implement extensive logging throughout the application
2. Log all critical operations and state changes
3. Include relevant context in log messages (user ID, operation type, timestamp)
4. Use appropriate log levels (debug, info, warn, error)
5. Ensure logs don't contain sensitive information
6. Maintain structured logging format for better parsing

## Testing Requirements

1. All new features must include comprehensive tests
2. Tests must cover:
   - Unit tests for business logic
   - Integration tests for API endpoints
   - Component tests for UI elements
3. Maintain minimum test coverage requirements
4. Include both positive and negative test cases
5. Mock external dependencies in tests
6. Tests must be deterministic and isolated

## CI/CD Rules

1. All pull requests to the main branch must pass CI checks before merging
2. Test files should be placed in `__tests__` directories adjacent to the code they test
3. Test files should follow the naming convention: `ComponentName.test.tsx`
4. CI workflow changes must be made through pull requests
5. Branch protection rules must be maintained to enforce test passing
