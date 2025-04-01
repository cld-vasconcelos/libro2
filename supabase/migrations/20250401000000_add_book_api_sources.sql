-- Create book_api_sources table
CREATE TABLE book_api_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    api_key TEXT,
    base_url TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    priority INTEGER NOT NULL DEFAULT 0,
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
INSERT INTO book_api_sources (name, base_url, priority) VALUES
('google', 'https://www.googleapis.com/books/v1', 10),
('libro', '', 20),
('openlibrary', 'https://openlibrary.org/api', 5);

-- Remove the check constraint from user_books
ALTER TABLE user_books DROP CONSTRAINT valid_source;

-- Add foreign key constraint to user_books
ALTER TABLE user_books ALTER COLUMN source TYPE UUID USING (
  CASE
    WHEN source = 'google' THEN (SELECT id FROM book_api_sources WHERE name = 'google')
    WHEN source = 'libro' THEN (SELECT id FROM book_api_sources WHERE name = 'libro')
    ELSE NULL
  END
);

-- Add foreign key constraint
ALTER TABLE user_books ADD CONSTRAINT fk_book_api_source
FOREIGN KEY (source) REFERENCES book_api_sources(id) ON DELETE RESTRICT;

-- Add comment
COMMENT ON TABLE book_api_sources IS 'Stores information about different book API sources';
COMMENT ON COLUMN book_api_sources.name IS 'Unique name identifier for the API source';
COMMENT ON COLUMN book_api_sources.api_key IS 'API key for the source (if required)';
COMMENT ON COLUMN book_api_sources.base_url IS 'Base URL for the API';
COMMENT ON COLUMN book_api_sources.enabled IS 'Whether this API source is currently enabled';
COMMENT ON COLUMN book_api_sources.priority IS 'Priority order for searching (higher number = higher priority)';
