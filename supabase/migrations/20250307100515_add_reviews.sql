-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (
        rating >= 0
        AND rating <= 5
    ),
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(book_id, user_id) -- Prevent multiple reviews from same user for same book
);
-- Create view to get average rating per book
CREATE VIEW book_average_ratings AS
SELECT book_id,
    ROUND(AVG(rating)::numeric, 1) as average_rating,
    COUNT(*) as total_reviews
FROM reviews
GROUP BY book_id;
-- Set up RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
-- Policy for selecting reviews (anyone can read)
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR
SELECT TO public USING (true);
-- Policy for inserting reviews (authenticated users only)
CREATE POLICY "Users can create reviews" ON reviews FOR
INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
-- Policy for updating reviews (only the review author)
CREATE POLICY "Users can update their own reviews" ON reviews FOR
UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Policy for deleting reviews (only the review author)
CREATE POLICY "Users can delete their own reviews" ON reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);
-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER set_updated_at BEFORE
UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();