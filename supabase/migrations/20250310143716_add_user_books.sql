-- Create enum types for book statuses
CREATE TYPE ownership_status AS ENUM (
    'Owned',
    'Wishlist',
    'Borrowed',
    'Lent Out',
    'Digital',
    'Gifted'
);
CREATE TYPE reading_status AS ENUM (
    'Not Started',
    'Reading',
    'Paused',
    'Completed',
    'Abandoned',
    'Re-reading'
);
-- Create user_books table
CREATE TABLE user_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id TEXT NOT NULL,
    -- Google Books API ID
    ownership_status ownership_status NOT NULL,
    reading_status reading_status NOT NULL DEFAULT 'Not Started',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, book_id)
);
-- Enable RLS
ALTER TABLE user_books ENABLE ROW LEVEL SECURITY;
-- Create RLS policies
CREATE POLICY "Users can view their own book collection" ON user_books FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own book collection" ON user_books FOR ALL USING (auth.uid() = user_id);
-- Create updated_at trigger
CREATE TRIGGER set_user_books_timestamp BEFORE
UPDATE ON user_books FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();