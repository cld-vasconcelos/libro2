# Services Architecture

The Libro application uses a service-layer architecture to handle business logic and data access. Here's an overview of the services and their responsibilities:

## Core Services

### authService (src/services/authService.ts)
- Handles user authentication and authorization
- Integrates with Supabase auth

### bookService (src/services/bookService.ts)
- Core service for book-related operations
- Likely handles common book operations used by other services

### userBookService (src/services/userBookService.ts)
- Manages user's book collections
- Interacts with the user_books table
- Handles operations like adding/removing books from collections

### reviewService (src/services/reviewService.ts)
- Manages book reviews
- Handles CRUD operations for user reviews
- Interacts with the reviews table

### libroBookService (src/services/libroBookService.ts)
- Appears to handle integration with an external book service/API
- Possibly for fetching book metadata or catalog information

### localBookService (src/services/localBookService.ts)
- Manages locally added books
- Interacts with the local_books table
- Handles user-created book entries

## Service Layer Patterns

1. Each service has a specific domain responsibility
2. Services are organized by feature/entity
3. Services abstract database and API interactions
4. External integrations are isolated in dedicated services
5. Clear separation between local and external book sources
