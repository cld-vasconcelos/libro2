-- Add select policy for user_books
CREATE POLICY "Users can view their own collection" ON user_books FOR
SELECT USING (auth.uid() = user_id);