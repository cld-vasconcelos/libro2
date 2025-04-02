-- Create book_api_sources table
CREATE TABLE book_api_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  api_key TEXT,
  base_url TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add comment to the table
COMMENT ON TABLE book_api_sources IS 'Stores information about different book API sources';

-- Add comments to columns
COMMENT ON COLUMN book_api_sources.name IS 'Unique identifier for the API source (e.g., google, openlibrary)';
COMMENT ON COLUMN book_api_sources.api_key IS 'API key for authentication (if required)';
COMMENT ON COLUMN book_api_sources.base_url IS 'Base URL for the API';
COMMENT ON COLUMN book_api_sources.description IS 'Description of the API source';
COMMENT ON COLUMN book_api_sources.is_active IS 'Whether the API source is currently active';

-- Insert default API sources
INSERT INTO book_api_sources (name, base_url, description)
VALUES
  ('google', 'https://www.googleapis.com/books/v1', 'Google Books API'),
  ('openlibrary', 'https://openlibrary.org/api', 'Open Library API'),
  ('libro', '', 'Internal Libro database');

-- Modify user_books table to remove the check constraint
ALTER TABLE user_books DROP CONSTRAINT valid_source;

-- Create a function to validate source against book_api_sources
CREATE OR REPLACE FUNCTION validate_book_source()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM book_api_sources WHERE name = NEW.source) THEN
    RAISE EXCEPTION 'Invalid book source: %', NEW.source;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to validate source on insert/update
CREATE TRIGGER validate_book_source_trigger
BEFORE INSERT OR UPDATE ON user_books
FOR EACH ROW
EXECUTE FUNCTION validate_book_source();

-- Add RLS policies for book_api_sources
ALTER TABLE book_api_sources ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view book API sources
CREATE POLICY "Anyone can view book API sources"
ON book_api_sources FOR SELECT
TO authenticated
USING (true);

-- Only admins can insert/update/delete book API sources
CREATE POLICY "Only admins can modify book API sources"
ON book_api_sources FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin');
