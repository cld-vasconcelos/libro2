import { supabase } from '@/lib/supabase';
import { BookApiSource } from '@/types/book';

/**
 * Fetches all available book API sources
 */
export const getBookApiSources = async (): Promise<BookApiSource[]> => {
  const { data, error } = await supabase
    .from('book_api_sources')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching book API sources:', error);
    throw new Error('Failed to fetch book API sources');
  }

  return data || [];
};

/**
 * Fetches a specific book API source by name
 */
export const getBookApiSourceByName = async (name: string): Promise<BookApiSource | null> => {
  const { data, error } = await supabase
    .from('book_api_sources')
    .select('*')
    .eq('name', name)
    .single();

  if (error) {
    console.error(`Error fetching book API source '${name}':`, error);
    return null;
  }

  return data;
};

/**
 * Creates a new book API source
 */
export const createBookApiSource = async (source: Omit<BookApiSource, 'id' | 'created_at' | 'updated_at'>): Promise<BookApiSource> => {
  const { data, error } = await supabase
    .from('book_api_sources')
    .insert(source)
    .select()
    .single();

  if (error) {
    console.error('Error creating book API source:', error);
    throw new Error(`Failed to create book API source: ${error.message}`);
  }

  return data;
};

/**
 * Updates an existing book API source
 */
export const updateBookApiSource = async (id: string, updates: Partial<Omit<BookApiSource, 'id' | 'created_at' | 'updated_at'>>): Promise<BookApiSource> => {
  const { data, error } = await supabase
    .from('book_api_sources')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating book API source:', error);
    throw new Error(`Failed to update book API source: ${error.message}`);
  }

  return data;
};

/**
 * Deletes a book API source
 * Note: This will fail if the source is referenced by any user_books
 */
export const deleteBookApiSource = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('book_api_sources')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting book API source:', error);
    throw new Error(`Failed to delete book API source: ${error.message}`);
  }
};
