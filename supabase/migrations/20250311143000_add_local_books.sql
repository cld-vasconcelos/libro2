-- Create books table for locally managed books
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    authors TEXT [] NOT NULL,
    description TEXT,
    published_date TEXT,
    publisher TEXT,
    page_count INTEGER,
    language TEXT,
    isbn_10 TEXT UNIQUE,
    isbn_13 TEXT UNIQUE,
    categories TEXT [],
    cover_image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Enable RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
-- Create policies
CREATE POLICY "Books are viewable by everyone" ON books FOR
SELECT USING (true);
CREATE POLICY "Authenticated users can insert books" ON books FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update books" ON books FOR
UPDATE USING (auth.role() = 'authenticated');
-- Create trigger for updated_at
CREATE TRIGGER set_books_timestamp BEFORE
UPDATE ON books FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();