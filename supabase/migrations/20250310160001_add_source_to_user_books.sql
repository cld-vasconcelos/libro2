-- Add source column to user_books
ALTER TABLE user_books
ADD COLUMN source text NOT NULL DEFAULT 'google';
-- Update source for existing Libro books
UPDATE user_books
SET source = 'libro'
WHERE book_id IN (
        SELECT id::text
        FROM books
    );
-- Add check constraint
ALTER TABLE user_books
ADD CONSTRAINT valid_source CHECK (source IN ('google', 'libro'));
-- Create index for faster lookups
CREATE INDEX user_books_book_id_source_idx ON user_books(book_id, source);
COMMENT ON COLUMN user_books.book_id IS 'ID from either Google Books API or Libro database';
COMMENT ON COLUMN user_books.source IS 'Source of the book (google or libro)';