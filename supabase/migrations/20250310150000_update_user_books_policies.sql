-- Drop the old policy
DROP POLICY "Users can manage their own book collection" ON user_books;
-- Create specific policies for each operation
CREATE POLICY "Users can insert into their collection" ON user_books FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own collection" ON user_books FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete from their collection" ON user_books FOR DELETE USING (auth.uid() = user_id);