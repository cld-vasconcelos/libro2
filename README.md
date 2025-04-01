# Libro

A modern web application for managing your personal book collection. Libro allows users to search for books, create libraries, write reviews, and track their reading progress.

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: 
  - Radix UI for accessible components
  - shadcn/ui for styled components
  - TailwindCSS for styling
- **State Management**: React Query
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: React Router DOM
- **Testing**: Vitest with React Testing Library

## Integrations

- **Database & Auth**: Supabase
  - User authentication
  - Book data storage
  - Reviews system
  - User libraries
- **External APIs**: 
  - Google Books API for book search and metadata
  - Book cover image storage in Supabase Storage

## Running Locally

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in required environment variables
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:5173](http://localhost:5173) in your browser

### Running Tests

The project uses Vitest for testing. Available test commands:

```bash
# Run tests in watch mode
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Memory Bank

The project includes a memory bank system that documents:

- **Architecture & Services**: Documentation of service layer patterns and responsibilities
- **Database Schemas**: Database structure and relationships
- **Project Conventions**: Coding standards and patterns
- **CI/CD Workflows**: Deployment and integration procedures
- **Database Migrations**: Schema evolution history

Memory bank documentation can be found in the `memory_bank/` directory:
- `facts/`: Architecture and implementation details
- `procedures/`: Workflows and processes
- `rules/`: Project conventions and guidelines
- `schemas/`: Database and type definitions
