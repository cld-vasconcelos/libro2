import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBookApiSources, getBookApiSourceByCode, createBookApiSource, updateBookApiSource, deleteBookApiSource } from '@/services/bookApiSourceService';
import { supabase } from '@/lib/supabase';

// Mock the Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
  }
}));

describe('Book API Source Service', () => {
  const mockSources = [
    {
      id: '1',
      name: 'Google Books API',
      code: 'google',
      base_url: 'https://www.googleapis.com/books/v1',
      api_key: null,
      is_active: true,
      created_at: '2025-04-02T00:00:00Z',
      updated_at: '2025-04-02T00:00:00Z'
    },
    {
      id: '2',
      name: 'Open Library API',
      code: 'openlibrary',
      base_url: 'https://openlibrary.org/api',
      api_key: null,
      is_active: true,
      created_at: '2025-04-02T00:00:00Z',
      updated_at: '2025-04-02T00:00:00Z'
    }
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getBookApiSources', () => {
    it('should fetch all book API sources', async () => {
      // Mock the Supabase response
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockSources,
            error: null
          })
        })
      } as any);

      const sources = await getBookApiSources();

      expect(supabase.from).toHaveBeenCalledWith('book_api_sources');
      expect(sources).toHaveLength(2);
      expect(sources[0].code).toBe('google');
      expect(sources[1].code).toBe('openlibrary');
    });

    it('should throw an error if the fetch fails', async () => {
      // Mock the Supabase error response
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' }
          })
        })
      } as any);

      await expect(getBookApiSources()).rejects.toThrow('Failed to fetch book API sources: Database error');
    });
  });

  describe('getBookApiSourceByCode', () => {
    it('should fetch a book API source by code', async () => {
      // Mock the Supabase response
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockSources[0],
              error: null
            })
          })
        })
      } as any);

      const source = await getBookApiSourceByCode('google');

      expect(supabase.from).toHaveBeenCalledWith('book_api_sources');
      expect(source?.code).toBe('google');
      expect(source?.name).toBe('Google Books API');
    });

    it('should return null if no source is found', async () => {
      // Mock the Supabase error response for no rows
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'No rows returned' }
            })
          })
        })
      } as any);

      const source = await getBookApiSourceByCode('nonexistent');

      expect(source).toBeNull();
    });

    it('should throw an error for other errors', async () => {
      // Mock the Supabase error response
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'OTHER', message: 'Database error' }
            })
          })
        })
      } as any);

      await expect(getBookApiSourceByCode('google')).rejects.toThrow('Failed to fetch book API source: Database error');
    });
  });

  describe('createBookApiSource', () => {
    it('should create a new book API source', async () => {
      const newSource = {
        name: 'New API',
        code: 'newapi',
        baseUrl: 'https://api.example.com',
        isActive: true
      };

      const createdSource = {
        id: '3',
        name: 'New API',
        code: 'newapi',
        base_url: 'https://api.example.com',
        api_key: null,
        is_active: true,
        created_at: '2025-04-02T00:00:00Z',
        updated_at: '2025-04-02T00:00:00Z'
      };

      // Mock the Supabase response
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: createdSource,
              error: null
            })
          })
        })
      } as any);

      const source = await createBookApiSource(newSource);

      expect(supabase.from).toHaveBeenCalledWith('book_api_sources');
      expect(source.id).toBe('3');
      expect(source.code).toBe('newapi');
    });

    it('should throw an error if creation fails', async () => {
      // Mock the Supabase error response
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' }
            })
          })
        })
      } as any);

      await expect(createBookApiSource({
        name: 'New API',
        code: 'newapi',
        baseUrl: 'https://api.example.com',
        isActive: true
      })).rejects.toThrow('Failed to create book API source: Database error');
    });
  });

  describe('updateBookApiSource', () => {
    it('should update a book API source', async () => {
      const updates = {
        name: 'Updated API',
        isActive: false
      };

      const updatedSource = {
        id: '1',
        name: 'Updated API',
        code: 'google',
        base_url: 'https://www.googleapis.com/books/v1',
        api_key: null,
        is_active: false,
        created_at: '2025-04-02T00:00:00Z',
        updated_at: '2025-04-02T00:00:00Z'
      };

      // Mock the Supabase response
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: updatedSource,
                error: null
              })
            })
          })
        })
      } as any);

      const source = await updateBookApiSource('1', updates);

      expect(supabase.from).toHaveBeenCalledWith('book_api_sources');
      expect(source.id).toBe('1');
      expect(source.name).toBe('Updated API');
      expect(source.isActive).toBe(false);
    });

    it('should throw an error if update fails', async () => {
      // Mock the Supabase error response
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database error' }
              })
            })
          })
        })
      } as any);

      await expect(updateBookApiSource('1', { name: 'Updated API' })).rejects.toThrow('Failed to update book API source: Database error');
    });
  });

  describe('deleteBookApiSource', () => {
    it('should delete a book API source', async () => {
      // Mock the Supabase response
      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null
          })
        })
      } as any);

      await expect(deleteBookApiSource('1')).resolves.not.toThrow();
      expect(supabase.from).toHaveBeenCalledWith('book_api_sources');
    });

    it('should throw an error if deletion fails', async () => {
      // Mock the Supabase error response
      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: { message: 'Database error' }
          })
        })
      } as any);

      await expect(deleteBookApiSource('1')).rejects.toThrow('Failed to delete book API source: Database error');
    });
  });
});
