import { supabase } from '@/lib/supabase';
import { Book, GoogleBooksResponse } from '@/types/book';

import { GOOGLE_BOOKS_API } from './bookService';

interface CreateBookData {
  title: string;
  authors: string[];
  description: string;
  publishedDate: string;
  publisher: string;
  pageCount: number;
  language: string;
  isbn10: string;
  isbn13: string;
  categories: string[];
  coverImage?: File;
}

interface UpdateBookData {
  id: string;
  title?: string;
  authors?: string[];
  description?: string;
  publishedDate?: string;
  publisher?: string;
  pageCount?: number;
  language?: string;
  categories?: string[];
  coverImage?: File;
}

const checkGoogleBooksISBN = async (isbn10?: string, isbn13?: string): Promise<boolean> => {
  if (!isbn10 && !isbn13) return false;

  const query = isbn10 ? `isbn:${isbn10}` : `isbn:${isbn13}`;
  const url = `${GOOGLE_BOOKS_API}/volumes?q=${query}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to check Google Books');

  const data: GoogleBooksResponse = await response.json();
  return (data.totalItems || 0) > 0;
};

export const createBook = async (data: CreateBookData): Promise<Book> => {
  // Check if ISBNs exist in Google Books or Libro database
  const [googleBooksExists, libroExists] = await Promise.all([
    checkGoogleBooksISBN(data.isbn10, data.isbn13),
    checkISBNExists(data.isbn10, data.isbn13)
  ]);

  if (googleBooksExists) {
    throw new Error('This book already exists in Google Books');
  }

  if (libroExists) {
    throw new Error('This book already exists in the Libro database');
  }

  // Upload cover image if provided
  let coverPath = null;
  if (data.coverImage) {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('book-covers')
      .upload(`${Date.now()}-${data.coverImage.name}`, data.coverImage);

    if (uploadError) throw new Error('Failed to upload cover image');
    
    const { data: { publicUrl } } = supabase.storage
      .from('book-covers')
      .getPublicUrl(uploadData.path);
      
    coverPath = publicUrl;
  }

  // Create book record
  const { data: book, error } = await supabase
    .from('books')
    .insert({
      title: data.title,
      authors: data.authors,
      description: data.description,
      published_date: data.publishedDate,
      publisher: data.publisher,
      page_count: data.pageCount,
      language: data.language,
      isbn_10: data.isbn10,
      isbn_13: data.isbn13,
      categories: data.categories,
      cover_image: coverPath,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    source: 'libro',
    id: book.id,
    title: book.title,
    authors: book.authors,
    description: book.description,
    publishedDate: book.published_date,
    publisher: book.publisher,
    pageCount: book.page_count,
    language: book.language,
    isbn10: book.isbn_10,
    isbn13: book.isbn_13,
    categories: book.categories,
    coverImage: book.cover_image,
  };
};

export const updateBook = async (data: UpdateBookData): Promise<Book> => {
  let coverPath = undefined;
  
  if (data.coverImage) {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('book-covers')
      .upload(`${Date.now()}-${data.coverImage.name}`, data.coverImage);

    if (uploadError) throw new Error('Failed to upload cover image');
    
    const { data: { publicUrl } } = supabase.storage
      .from('book-covers')
      .getPublicUrl(uploadData.path);
      
    coverPath = publicUrl;
  }

  const updateData = {
    ...(data.title && { title: data.title }),
    ...(data.authors && { authors: data.authors }),
    ...(data.description && { description: data.description }),
    ...(data.publishedDate && { published_date: data.publishedDate }),
    ...(data.publisher && { publisher: data.publisher }),
    ...(data.pageCount && { page_count: data.pageCount }),
    ...(data.language && { language: data.language }),
    ...(data.categories && { categories: data.categories }),
    ...(coverPath && { cover_image: coverPath }),
  };

  const { data: book, error } = await supabase
    .from('books')
    .update(updateData)
    .eq('id', data.id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    source: 'libro',
    id: book.id,
    title: book.title,
    authors: book.authors,
    description: book.description,
    publishedDate: book.published_date,
    publisher: book.publisher,
    pageCount: book.page_count,
    language: book.language,
    isbn10: book.isbn_10,
    isbn13: book.isbn_13,
    categories: book.categories,
    coverImage: book.cover_image,
  };
};

export const getLibroBook = async (id: string): Promise<Book | null> => {
  const { data: book, error } = await supabase
    .from('books')
    .select()
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }

  return {
    source: 'libro',
    id: book.id,
    title: book.title,
    authors: book.authors,
    description: book.description,
    publishedDate: book.published_date,
    publisher: book.publisher,
    pageCount: book.page_count,
    language: book.language,
    isbn10: book.isbn_10,
    isbn13: book.isbn_13,
    categories: book.categories,
    coverImage: book.cover_image,
  };
};

export const checkISBNExists = async (isbn10?: string, isbn13?: string): Promise<boolean> => {
  if (!isbn10 && !isbn13) return false;

  const { count, error } = await supabase
    .from('books')
    .select('id', { count: 'exact', head: true })
    .or(`isbn_10.eq.${isbn10},isbn_13.eq.${isbn13}`);

  if (error) throw new Error(error.message);

  return count !== null && count > 0;
};
