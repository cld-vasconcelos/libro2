import { supabase } from '@/lib/supabase';
import { Book, BookSourceName, GoogleBooksResponse } from '@/types/book';
import { OwnershipStatus, ReadingStatus } from './userBookService';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const getBookCoverUrl = (coverImage: string | null | undefined): string | undefined => {
  if (!coverImage) return undefined;
  if (coverImage.startsWith('http')) return coverImage;
  return `${SUPABASE_URL}/storage/v1/object/public/book-covers/${coverImage}`;
};

export const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1';

const mapGoogleBook = (item: GoogleBooksResponse['items'][0]): Book => {
  const { volumeInfo } = item;
  const isbn10 = volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier;
  const isbn13 = volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier;

  return {
    source: 'google',
    id: item.id,
    title: volumeInfo.title,
    authors: volumeInfo.authors || [],
    description: volumeInfo.description,
    publishedDate: volumeInfo.publishedDate,
    publisher: volumeInfo.publisher,
    isbn10,
    isbn13,
    pageCount: volumeInfo.pageCount,
    categories: volumeInfo.categories,
    language: volumeInfo.language,
    averageRating: volumeInfo.averageRating,
    coverImage: volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
  };
};

export const searchBooks = async (
  query: string, 
  page = 1, 
  pageSize = 40,
  searchType: 'general' | 'isbn' = 'general'
): Promise<{ books: Book[]; total: number }> => {
  // Clean ISBN query
  const cleanedQuery = searchType === 'isbn' ? query.replace(/[-\s]/g, '') : query;

  // First get total count from database
  const { count: libroTotal = 0 } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })
    .or(
      searchType === 'isbn' 
        ? `isbn_10.eq.${cleanedQuery},isbn_13.eq.${cleanedQuery}`
        : `title.ilike.%${query}%, authors.cs.{${query}}`
    );

  let mappedLocalBooks: Book[] = [];
  
  // Only query database if we're within range of available results
  if ((page - 1) * pageSize < libroTotal) {
    try {
      const { data: localBooks = [], error: libroError } = await supabase
        .from('books')
        .select('*')
        .or(
          searchType === 'isbn'
            ? `isbn_10.eq.${cleanedQuery},isbn_13.eq.${cleanedQuery}`
            : `title.ilike.%${query}%, authors.cs.{${query}}`
        )
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (libroError) {
        console.error('Failed to search Libro books:', libroError);
      } else {
        // Transform Libro books to match Book type
        mappedLocalBooks = localBooks.map(book => ({
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
          coverImage: getBookCoverUrl(book.cover_image),
        }));
      }
    } catch (error) {
      console.error('Error fetching from database:', error);
      // Continue with Google Books if database query fails
    }
  }

  // Calculate remaining slots for Google Books
  const remainingSlots = pageSize - mappedLocalBooks.length;

  // Calculate Google Books start index
  const googleStart = Math.max(0, (page - 1) * pageSize - mappedLocalBooks.length);

  // Search Google Books API
  try {
    const googleQuery = searchType === 'isbn' 
      ? `isbn:${cleanedQuery}`
      : query;
    const url = `${GOOGLE_BOOKS_API}/volumes?q=${encodeURIComponent(googleQuery)}&orderBy=relevance&startIndex=${googleStart}&maxResults=${remainingSlots}`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('Failed to search Google books');

    const data: GoogleBooksResponse = await response.json();
    const googleBooks = data.items?.map(mapGoogleBook) || [];

    // Filter out Google Books that exist in Libro (by ISBN)
    const filteredGoogleBooks = googleBooks.filter(googleBook => 
      !mappedLocalBooks.some(libroBook => 
        (googleBook.isbn10 && libroBook.isbn10 === googleBook.isbn10) ||
        (googleBook.isbn13 && libroBook.isbn13 === googleBook.isbn13)
      )
    );

    // Combine books from both sources (Libro first, then Google)
    const combinedBooks = [...mappedLocalBooks, ...filteredGoogleBooks];

    // Sort books prioritizing ones with cover images within each source group
    const sortedBooks = combinedBooks.sort((a, b) => {
      if (a.source === 'libro' && b.source === 'google') return -1;
      if (a.source === 'google' && b.source === 'libro') return 1;
      if (a.coverImage && !b.coverImage) return -1;
      if (!a.coverImage && b.coverImage) return 1;
      return 0;
    });

    // Calculate total (Libro total plus remaining Google results)
    const googleTotal = Math.min(data.totalItems || 0, 1000 - (libroTotal || 0));
    const total = (libroTotal || 0) + googleTotal;

    return {
      books: sortedBooks.slice(0, pageSize),
      total,
    };
  } catch (error) {
    console.error('Failed to search Google books:', error);
    
    // If Google Books fails, return just database results
    return {
      books: mappedLocalBooks,
      total: libroTotal || 0,
    };
  }
};

export const getBookById = async (id: string, source: BookSource = 'google'): Promise<Book | null> => {
  if (source === 'libro') {
    const { data: book, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching from Libro database:', error);
      return null;
    }

    if (!book) {
      console.warn(`Book not found in Libro database: ${id}`);
      return null;
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
      coverImage: getBookCoverUrl(book.cover_image),
    };
  }

  try {
    const url = `${GOOGLE_BOOKS_API}/volumes/${id}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Book not found in Google Books: ${id}`);
        return null;
      }
      throw new Error(`Failed to fetch book from Google Books API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data?.id || !data?.volumeInfo) {
      console.warn('Invalid data received from Google Books API');
      return null;
    }

    return {
      source: 'google',
      id: data.id,
      title: data.volumeInfo.title,
      authors: data.volumeInfo.authors || [],
      description: data.volumeInfo.description,
      publishedDate: data.volumeInfo.publishedDate,
      publisher: data.volumeInfo.publisher,
      isbn10: data.volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier,
      isbn13: data.volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier,
      pageCount: data.volumeInfo.pageCount,
      categories: data.volumeInfo.categories,
      language: data.volumeInfo.language,
      averageRating: data.volumeInfo.averageRating,
      coverImage: data.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
    };
  } catch (error) {
    console.error('Error fetching from Google Books:', error);
    throw new Error('Failed to fetch book from Google Books API');
  }
};

export interface ImportBookData {
  title?: string;
  authors?: string[];
  description?: string;
  publishedDate?: string;
  publisher?: string;
  pageCount?: number;
  language?: string;
  isbn10?: string;
  isbn13?: string;
  categories?: string[];
  ownership_status: OwnershipStatus;
  reading_status: ReadingStatus;
  user_id?: string; // Optional user ID to check if book is already in library
}

export interface ImportBookResult {
  book: Book;
  status: 'new' | 'exists';
}

export const importBook = async (bookData: ImportBookData): Promise<ImportBookResult> => {
  // Validate that title is present for CSV imports
  if (!bookData.title) {
    throw new Error('Title is required');
  }

  // Only search Google Books if we have an ISBN
  if (bookData.isbn10 || bookData.isbn13) {
    try {
      const searchQuery = bookData.isbn13 ? `isbn:${bookData.isbn13}` : `isbn:${bookData.isbn10}`;
      const url = `${GOOGLE_BOOKS_API}/volumes?q=${encodeURIComponent(searchQuery)}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        if (data.items?.length > 0) {
          const googleBook = mapGoogleBook(data.items[0]);
          const book: Book = {
            source: 'google' as BookSource,
            id: googleBook.id,
            title: googleBook.title,
            authors: googleBook.authors || [],
            description: googleBook.description,
            publishedDate: googleBook.publishedDate,
            publisher: googleBook.publisher,
            isbn10: googleBook.isbn10,
            isbn13: googleBook.isbn13,
            pageCount: googleBook.pageCount,
            categories: googleBook.categories,
            language: googleBook.language,
            averageRating: googleBook.averageRating,
            coverImage: googleBook.coverImage,
          };

          // Check if book is already in user's library if user_id is provided
          if (bookData.user_id) {
            const { data: existingBook } = await supabase
              .from('user_books')
              .select('id')
              .eq('book_id', book.id)
              .eq('user_id', bookData.user_id)
              .maybeSingle();

            if (existingBook) {
              return { book, status: 'exists' };
            }
          }

          return { book, status: 'new' };
        }
      }
    } catch (error) {
      console.error('Failed to search Google Books:', error);
    }
  }

  // Check local database by ISBN if provided, otherwise by title
  let localBook;
  if (bookData.isbn10 || bookData.isbn13) {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .or(`isbn_10.eq."${bookData.isbn10}",isbn_13.eq."${bookData.isbn13}"`)
      .maybeSingle();
    
    if (!error) {
      localBook = data;
    }
  } else if (bookData.title) {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .ilike('title', bookData.title)
      .maybeSingle();
    
    if (!error) {
      localBook = data;
    }
  }

  if (localBook) {
    const book: Book = {
      source: 'libro' as BookSource,
      id: localBook.id,
      title: localBook.title,
      authors: localBook.authors,
      description: localBook.description,
      publishedDate: localBook.published_date,
      publisher: localBook.publisher,
      pageCount: localBook.page_count,
      language: localBook.language,
      isbn10: localBook.isbn_10,
      isbn13: localBook.isbn_13,
      categories: localBook.categories,
      coverImage: getBookCoverUrl(localBook.cover_image),
    };

    // Check if book is already in user's library if user_id is provided
    if (bookData.user_id) {
      const { data: existingBook } = await supabase
        .from('user_books')
        .select('id')
        .eq('book_id', book.id)
        .eq('user_id', bookData.user_id)
        .maybeSingle();

      if (existingBook) {
        return { book, status: 'exists' };
      }
    }

    return { book, status: 'new' };
  }

  // No validation for required fields during CSV import to allow maximum flexibility

  // Create book in local database
  const bookToCreate = {
    title: bookData.title,
    authors: bookData.authors,
    description: bookData.description,
    published_date: bookData.publishedDate,
    publisher: bookData.publisher,
    page_count: bookData.pageCount,
    language: bookData.language,
    isbn_10: bookData.isbn10,
    isbn_13: bookData.isbn13,
    categories: bookData.categories,
  };

  const { data: newBook, error: insertError } = await supabase
    .from('books')
    .insert(bookToCreate)
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to create book: ${insertError.message}`);
  }

  const book: Book = {
    source: 'libro' as BookSource,
    id: newBook.id,
    title: newBook.title,
    authors: newBook.authors,
    description: newBook.description,
    publishedDate: newBook.published_date,
    publisher: newBook.publisher,
    pageCount: newBook.page_count,
    language: newBook.language,
    isbn10: newBook.isbn_10,
    isbn13: newBook.isbn_13,
    categories: newBook.categories,
    coverImage: getBookCoverUrl(newBook.cover_image),
  };

  return { book, status: 'new' };
};

export const getAuthorByName = async (name: string): Promise<{ name: string; books: Book[] }> => {
  const results = await Promise.all([
    // Search Libro books
    supabase
      .from('books')
      .select('*')
      .contains('authors', [name])
      .then(({ data, error }) => {
        if (error) throw error;
        return (data?.map(book => ({
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
          coverImage: getBookCoverUrl(book.cover_image),
        })) as Book[]) || [];
      }),

    // Search Google Books
    fetch(`${GOOGLE_BOOKS_API}/volumes?q=inauthor:"${encodeURIComponent(name)}"&orderBy=relevance&maxResults=40`)
      .then(response => response.json())
      .then((data: GoogleBooksResponse) => data.items?.map(mapGoogleBook) || [])
  ]);

  // Combine and deduplicate books
  const [libroBooks, googleBooks] = results;
  const allBooks = [...libroBooks];
  
  for (const googleBook of googleBooks) {
    const existsByISBN = allBooks.some(book => 
      (googleBook.isbn10 && book.isbn10 === googleBook.isbn10) ||
      (googleBook.isbn13 && book.isbn13 === googleBook.isbn13)
    );
    if (!existsByISBN) {
      allBooks.push(googleBook);
    }
  }

  return {
    name,
    books: allBooks.filter(book => book.authors.includes(name)),
  };
};
