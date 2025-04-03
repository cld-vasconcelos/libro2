-- Create book_api_sources table
CREATE TABLE book_api_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    api_url TEXT NOT NULL,
    api_key TEXT,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE book_api_sources ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Book API sources are viewable by everyone" ON book_api_sources FOR
SELECT USING (true);

CREATE POLICY "Only authenticated users can manage book API sources" ON book_api_sources FOR ALL USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER set_book_api_sources_timestamp BEFORE
UPDATE ON book_api_sources FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Insert default sources
INSERT INTO book_api_sources (name, api_url, description) VALUES
('google', 'https://www.googleapis.com/books/v1', 'Google Books API'),
('openlibrary', 'https://openlibrary.org/api', 'Open Library API');

-- Drop the check constraint on user_books.source
ALTER TABLE user_books DROP CONSTRAINT valid_source;

-- Add a new constraint that references the book_api_sources table
ALTER TABLE user_books ADD CONSTRAINT valid_source CHECK (
    source IN (SELECT name FROM book_api_sources) OR source = 'libro'
);

-- Add comment to explain the constraint
COMMENT ON CONSTRAINT valid_source ON user_books IS 'Source must be "libro" or a name from book_api_sources table';
