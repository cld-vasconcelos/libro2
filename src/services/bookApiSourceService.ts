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
    throw new Error(`Failed to fetch book API sources: ${error.message}`);
  }

  return data.map(source => ({
    id: source.id,
    name: source.name,
    code: source.code,
    baseUrl: source.base_url,
    apiKey: source.api_key,
    isActive: source.is_active,
    createdAt: source.created_at,
    updatedAt: source.updated_at
  }));
};

/**
 * Fetches a single book API source by its code
 */
export const getBookApiSourceByCode = async (code: string): Promise<BookApiSource | null> => {
  const { data, error } = await supabase
    .from('book_api_sources')
    .select('*')
    .eq('code', code)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error(`Error fetching book API source with code ${code}:`, error);
    throw new Error(`Failed to fetch book API source: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    code: data.code,
    baseUrl: data.base_url,
    apiKey: data.api_key,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

/**
 * Creates a new book API source
 * Note: This function should only be accessible to admin users
 */
export const createBookApiSource = async (source: Omit<BookApiSource, 'id' | 'createdAt' | 'updatedAt'>): Promise<BookApiSource> => {
  const { data, error } = await supabase
    .from('book_api_sources')
    .insert({
      name: source.name,
      code: source.code,
      base_url: source.baseUrl,
      api_key: source.apiKey,
      is_active: source.isActive
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating book API source:', error);
    throw new Error(`Failed to create book API source: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    code: data.code,
    baseUrl: data.base_url,
    apiKey: data.api_key,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

/**
 * Updates an existing book API source
 * Note: This function should only be accessible to admin users
 */
export const updateBookApiSource = async (id: string, updates: Partial<Omit<BookApiSource, 'id' | 'createdAt' | 'updatedAt'>>): Promise<BookApiSource> => {
  const updateData: Record<string, any> = {};

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.code !== undefined) updateData.code = updates.code;
  if (updates.baseUrl !== undefined) updateData.base_url = updates.baseUrl;
  if (updates.apiKey !== undefined) updateData.api_key = updates.apiKey;
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

  const { data, error } = await supabase
    .from('book_api_sources')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating book API source with ID ${id}:`, error);
    throw new Error(`Failed to update book API source: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    code: data.code,
    baseUrl: data.base_url,
    apiKey: data.api_key,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

/**
 * Deletes a book API source
 * Note: This function should only be accessible to admin users
 */
export const deleteBookApiSource = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('book_api_sources')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting book API source with ID ${id}:`, error);
    throw new Error(`Failed to delete book API source: ${error.message}`);
  }
};
