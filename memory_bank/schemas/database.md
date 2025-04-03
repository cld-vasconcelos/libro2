# Database Schema

The Libro application uses Supabase as its database, with the following table structure based on migrations:

## Tables

### reviews
Created in: `20250307100515_add_reviews.sql`
- Table for storing book reviews by users

### user_books
Created in: `20250310143716_add_user_books.sql`
Updated in: `20250310150000_update_user_books_policies.sql`, `20250310160000_add_select_policy.sql`, `20250310160001_add_source_to_user_books.sql`, `20250403000000_add_book_api_sources.sql`
- Table for tracking books in user collections
- Has security policies for user access
- Includes a source field to track where the book came from

### local_books
Created in: `20250311143000_add_local_books.sql`
- Table for storing locally added books

### book_api_sources
Created in: `20250403000000_add_book_api_sources.sql`
- Table for storing different book API sources (e.g., Google Books API, Open Library API)
- Contains API URLs, keys, and other configuration for each source
- Referenced by user_books.source field

## Functions

- Created timestamp function (`20250310143715_create_timestamp_function.sql`)
  Used for managing timestamps in the database

## Storage

- Added storage bucket (`20250311150100_add_storage_bucket.sql`)
  For storing file attachments or media related to books

## Notes

- The database uses RLS (Row Level Security) policies to control access to user_books
- Timestamps are managed using a custom function
- Books can come from multiple sources (tracked in user_books.source)
