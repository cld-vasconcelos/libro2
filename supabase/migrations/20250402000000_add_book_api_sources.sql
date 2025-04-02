-- Create book_api_sources table
CREATE TABLE book_api_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    base_url TEXT NOT NULL,
    api_key TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE book_api_sources ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Book API sources are viewable by everyone" ON book_api_sources FOR
SELECT USING (true);

CREATE POLICY "Only admins can manage book API sources" ON book_api_sources FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
);

-- Create trigger for updated_at
CREATE TRIGGER set_book_api_sources_timestamp BEFORE
UPDATE ON book_api_sources FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Insert default sources
INSERT INTO book_api_sources (name, code, base_url, api_key) VALUES
('Google Books API', 'google', 'https://www.googleapis.com/books/v1', NULL),
('Open Library API', 'openlibrary', 'https://openlibrary.org/api', NULL),
('Libro Database', 'libro', '', NULL);

-- Modify user_books table to use the new source codes
ALTER TABLE user_books DROP CONSTRAINT valid_source;
ALTER TABLE user_books ADD CONSTRAINT valid_source CHECK (
    source IN (SELECT code FROM book_api_sources)
);
