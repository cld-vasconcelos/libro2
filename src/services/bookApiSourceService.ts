import { supabase } from '@/lib/supabase';
import { BookApiSource } from '@/types/book';

/**
 * Fetches all book API sources
 */
export const getBookApiSources = async (): Promise<BookApiSource[]> => {
  const { data, error } = await supabase
    .from('book_api_sources')
    .select('*')
    .order('name');

  if (error) throw new Error(`Failed to fetch book API sources: ${error.message}`);

  return data.map(source => ({
    id: source.id,
    name: source.name,
    apiKey: source.api_key,
    baseUrl: source.base_url,
    description: source.description,
    isActive: source.is_active,
    createdAt: source.created_at,
    updatedAt: source.updated_at
  }));
};

/**
 * Fetches a single book API source by name
 */
export const getBookApiSourceByName = async (name: string): Promise<BookApiSource | null> => {
  const { data, error } = await supabase
    .from('book_api_sources')
    .select('*')
    .eq('name', name)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Record not found
    throw new Error(`Failed to fetch book API source: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    apiKey: data.api_key,
    baseUrl: data.base_url,
    description: data.description,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

/**
 * Creates a new book API source
 */
export const createBookApiSource = async (source: Omit<BookApiSource, 'id' | 'createdAt' | 'updatedAt'>): Promise<BookApiSource> => {
  const { data, error } = await supabase
    .from('book_api_sources')
    .insert({
      name: source.name,
      api_key: source.apiKey,
      base_url: source.baseUrl,
      description: source.description,
      is_active: source.isActive
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create book API source: ${error.message}`);

  return {
    id: data.id,
    name: data.name,
    apiKey: data.api_key,
    baseUrl: data.base_url,
    description: data.description,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

/**
 * Updates an existing book API source
 */
export const updateBookApiSource = async (id: string, updates: Partial<Omit<BookApiSource, 'id' | 'createdAt' | 'updatedAt'>>): Promise<BookApiSource> => {
  const updateData: Record<string, any> = {};

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.apiKey !== undefined) updateData.api_key = updates.apiKey;
  if (updates.baseUrl !== undefined) updateData.base_url = updates.baseUrl;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

  const { data, error } = await supabase
    .from('book_api_sources')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update book API source: ${error.message}`);

  return {
    id: data.id,
    name: data.name,
    apiKey: data.api_key,
    baseUrl: data.base_url,
    description: data.description,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

/**
 * Deletes a book API source
 */
export const deleteBookApiSource = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('book_api_sources')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Failed to delete book API source: ${error.message}`);
};

/**
 * Checks if a book API source exists by name
 */
export const bookApiSourceExists = async (name: string): Promise<boolean> => {
  const { count, error } = await supabase
    .from('book_api_sources')
    .select('id', { count: 'exact', head: true })
    .eq('name', name);

  if (error) throw new Error(`Failed to check if book API source exists: ${error.message}`);

  return count !== null && count > 0;
};
