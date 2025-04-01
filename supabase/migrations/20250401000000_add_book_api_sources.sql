-- Create book_api_sources table
CREATE TABLE book_api_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    api_key TEXT,
    base_url TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE book_api_sources ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Book API sources are viewable by everyone" ON book_api_sources FOR
SELECT USING (true);

-- Only allow admins to manage book API sources
CREATE POLICY "Only admins can manage book API sources" ON book_api_sources FOR ALL
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create trigger for updated_at
CREATE TRIGGER set_book_api_sources_timestamp BEFORE
UPDATE ON book_api_sources FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Insert default sources
INSERT INTO book_api_sources (name, base_url, description)
VALUES
    ('google', 'https://www.googleapis.com/books/v1', 'Google Books API'),
    ('libro', '', 'Local Libro database');

-- Modify user_books table to use the new book_api_sources table
ALTER TABLE user_books DROP CONSTRAINT valid_source;

-- Add foreign key constraint to user_books
ALTER TABLE user_books
ADD CONSTRAINT fk_book_source
FOREIGN KEY (source)
REFERENCES book_api_sources(name)
ON UPDATE CASCADE;

-- Add comment to explain the relationship
COMMENT ON COLUMN user_books.source IS 'Source of the book (references book_api_sources.name)';
