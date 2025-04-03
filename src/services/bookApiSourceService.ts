import { supabase } from '@/lib/supabase';
import { BookApiSource } from '@/types/book';

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

export const getBookApiSourceByName = async (name: string): Promise<BookApiSource | null> => {
  const { data, error } = await supabase
    .from('book_api_sources')
    .select('*')
    .eq('name', name)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error(`Error fetching book API source with name ${name}:`, error);
    throw new Error(`Failed to fetch book API source with name ${name}`);
  }

  return data;
};

export const createBookApiSource = async (source: Omit<BookApiSource, 'id' | 'created_at' | 'updated_at'>): Promise<BookApiSource> => {
  const { data, error } = await supabase
    .from('book_api_sources')
    .insert(source)
    .select()
    .single();

  if (error) {
    console.error('Error creating book API source:', error);
    throw new Error('Failed to create book API source');
  }

  return data;
};

export const updateBookApiSource = async (id: string, updates: Partial<Omit<BookApiSource, 'id' | 'created_at' | 'updated_at'>>): Promise<BookApiSource> => {
  const { data, error } = await supabase
    .from('book_api_sources')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating book API source with id ${id}:`, error);
    throw new Error(`Failed to update book API source with id ${id}`);
  }

  return data;
};

export const deleteBookApiSource = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('book_api_sources')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting book API source with id ${id}:`, error);
    throw new Error(`Failed to delete book API source with id ${id}`);
  }
};
