import { supabase } from '@/lib/supabase';
import { getBookById, importBook } from './bookService';
import { BookSourceName } from '@/types/book';

export const ownershipStatuses = [
  'Owned',
  'Wishlist',
  'Borrowed',
  'Lent Out',
  'Digital',
  'Gifted',
] as const;

export const readingStatuses = [
  'Not Started',
  'Reading',
  'Paused',
  'Completed',
  'Abandoned',
  'Re-reading',
] as const;

export interface UserBook {
  id: string;
  book_id: string;
  source: BookSourceName;
  ownership_status: OwnershipStatus;
  reading_status: ReadingStatus;
  created_at: string;
}

export interface UserBookWithDetails extends UserBook {
  bookDetails: {
    title: string;
    authors: string[];
    coverImage?: string;
    description?: string;
    publishedDate?: string;
    publisher?: string;
    pageCount?: number;
    language?: string;
    isbn10?: string;
    isbn13?: string;
    categories?: string[];
  };
}

export type OwnershipStatus = 'Owned' | 'Wishlist' | 'Borrowed' | 'Lent Out' | 'Digital' | 'Gifted';
export type ReadingStatus = 'Not Started' | 'Reading' | 'Paused' | 'Completed' | 'Abandoned' | 'Re-reading';

interface AddBookToCollectionData {
  bookId: string;
  source: BookSourceName;
  ownershipStatus: OwnershipStatus;
  readingStatus: ReadingStatus;
}

export const addBookToCollection = async ({ bookId, source, ownershipStatus, readingStatus }: AddBookToCollectionData): Promise<void> => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    throw new Error('You must be logged in to add books to your collection');
  }

  const { error } = await supabase.from('user_books').insert({
    book_id: bookId,
    source,
    user_id: session.user.id,
    ownership_status: ownershipStatus,
    reading_status: readingStatus,
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const getUserBooks = async (
  page = 1,
  pageSize = 10
): Promise<{ books: UserBookWithDetails[]; total: number }> => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    throw new Error('You must be logged in to view your collection');
  }

  // Ensure valid pagination parameters
  const validPage = Math.max(1, page);
  const validPageSize = Math.max(1, pageSize);
  const start = (validPage - 1) * validPageSize;
  const end = start + validPageSize - 1;

  // Get total count first
  const { count, error: countError } = await supabase
    .from('user_books')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.user.id);

  if (countError) {
    throw new Error(countError.message);
  }

  // Then get paginated results
  const { data: userBooks, error } = await supabase
    .from('user_books')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .range(start, end);

  if (error) {
    throw new Error(error.message);
  }

  // Fetch book details from appropriate source
  const booksWithDetails = await Promise.all(
    (userBooks || []).map(async (book) => {
      try {
        const bookDetails = await getBookById(book.book_id, book.source);
        if (!bookDetails) {
          console.error(`Could not find book details for ID: ${book.book_id} from source: ${book.source}`);
          return null;
        }
        return {
          ...book,
          bookDetails: {
            title: bookDetails.title,
            authors: bookDetails.authors || [],
            coverImage: bookDetails.coverImage,
            description: bookDetails.description,
            publishedDate: bookDetails.publishedDate,
            publisher: bookDetails.publisher,
            pageCount: bookDetails.pageCount,
            language: bookDetails.language,
            isbn10: bookDetails.isbn10,
            isbn13: bookDetails.isbn13,
            categories: bookDetails.categories,
          },
        };
      } catch (error) {
        console.error(`Error fetching book details for ID: ${book.book_id} from source: ${book.source}`, error);
        return null;
      }
    })
  );

  // Filter out any failed book fetches
  const validBooks = booksWithDetails.filter((book): book is UserBookWithDetails => book !== null);

  return {
    books: validBooks,
    total: count || 0
  };
};

export const isBookInCollection = async (bookId: string): Promise<boolean> => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    return false;
  }
  
  const { data: books, error } = await supabase
    .from('user_books')
    .select('id, source')
    .eq('book_id', bookId)
    .eq('user_id', session.user.id);

  if (error) {
    throw new Error(error.message);
  }
  
  // A book can exist in collection from either source
  return books.length > 0;
};

export const updateBookInCollection = async ({ 
  bookId, 
  ownershipStatus, 
  readingStatus 
}: {
  bookId: string;
  ownershipStatus: OwnershipStatus;
  readingStatus: ReadingStatus;
}) => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    throw new Error('You must be logged in to update books in your collection');
  }

  const { error } = await supabase
    .from('user_books')
    .update({
      ownership_status: ownershipStatus,
      reading_status: readingStatus,
    })
    .eq('book_id', bookId)
    .eq('user_id', session.user.id);

  if (error) {
    throw new Error(error.message);
  }
};

export const removeFromCollection = async (bookId: string) => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    throw new Error('You must be logged in to remove books from your collection');
  }

  const { error } = await supabase
    .from('user_books')
    .delete()
    .eq('book_id', bookId)
    .eq('user_id', session.user.id);

  if (error) {
    throw new Error(error.message);
  }
};

export const getAllUserBooks = async (): Promise<UserBookWithDetails[]> => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    throw new Error('You must be logged in to view your collection');
  }

  const { data: userBooks, error } = await supabase
    .from('user_books')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // Fetch book details from appropriate source
  const booksWithDetails = await Promise.all(
    (userBooks || []).map(async (book) => {
      try {
        const bookDetails = await getBookById(book.book_id, book.source);
        if (!bookDetails) {
          console.error(`Could not find book details for ID: ${book.book_id} from source: ${book.source}`);
          return null;
        }
        return {
          ...book,
          bookDetails: {
            title: bookDetails.title,
            authors: bookDetails.authors || [],
            coverImage: bookDetails.coverImage,
            description: bookDetails.description,
            publishedDate: bookDetails.publishedDate,
            publisher: bookDetails.publisher,
            pageCount: bookDetails.pageCount,
            language: bookDetails.language,
            isbn10: bookDetails.isbn10,
            isbn13: bookDetails.isbn13,
            categories: bookDetails.categories,
          },
        };
      } catch (error) {
        console.error(`Error fetching book details for ID: ${book.book_id} from source: ${book.source}`, error);
        return null;
      }
    })
  );

  // Filter out any failed book fetches
  return booksWithDetails.filter((book): book is UserBookWithDetails => book !== null);
};

export interface ImportCollectionResult {
  success: number;
  failed: Array<{ row: number; error: string }>;
}

export interface ImportProgress {
  current: number;
  total: number;
}

export const importCollectionFromCsv = async (
  csvContent: string,
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportCollectionResult> => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    throw new Error('You must be logged in to import books to your collection');
  }

  const lines = csvContent.split('\n');
  if (lines.length < 2) { // Header + at least one row
    throw new Error('CSV file is empty or invalid');
  }

  const headers = lines[0].split(',').map(h => h.trim());
  
  // Detect CSV format based on headers
  const isGoodreads = headers.includes('Book Id') && headers.includes('Title') && headers.includes('Author');
  // Get column indexes based on format
  let isbn10Index = -1;
  let isbn13Index = -1;
  let titleIndex = -1;
  let authorsIndex = -1;
  let publisherIndex = -1;
  let pagesIndex = -1;
  let publishedDateIndex = -1;
  let ownershipIndex = -1;
  let readingIndex = -1;
  let myRatingIndex = -1;
  let myReviewIndex = -1;
  
  if (isGoodreads) {
    isbn10Index = headers.indexOf('ISBN');
    isbn13Index = headers.indexOf('ISBN13');
    titleIndex = headers.indexOf('Title');
    authorsIndex = headers.indexOf('Author');
    const additionalAuthorsIndex = headers.indexOf('Additional Authors');
    publisherIndex = headers.indexOf('Publisher');
    pagesIndex = headers.indexOf('Number of Pages');
    publishedDateIndex = headers.indexOf('Year Published');
    myRatingIndex = headers.indexOf('My Rating');
    myReviewIndex = headers.indexOf('My Review');
    
    // Set default statuses for Goodreads imports
    ownershipIndex = -1; // Will use 'Owned' as default
    readingIndex = -1; // Will use 'Completed' as default
  } else {
    // Libro format
    isbn10Index = headers.indexOf('ISBN-10');
    isbn13Index = headers.indexOf('ISBN-13');
    titleIndex = headers.indexOf('Title');
    authorsIndex = headers.indexOf('Authors');
    publisherIndex = headers.indexOf('Publisher');
    pagesIndex = headers.indexOf('Number of pages');
    publishedDateIndex = headers.indexOf('Published date');
    ownershipIndex = headers.indexOf('Ownership Status');
    readingIndex = headers.indexOf('Reading Status');
    
    if (isbn10Index === -1 && isbn13Index === -1) {
      throw new Error('CSV must contain either ISBN-10 or ISBN-13 column');
    }
    if (ownershipIndex === -1 || readingIndex === -1) {
      throw new Error('CSV must contain Ownership Status and Reading Status columns (for Libro format)');
    }
  }

  const result: ImportCollectionResult = {
    success: 0,
    failed: []
  };

  // Get total rows for progress (excluding header and empty lines)
  const totalRows = lines.slice(1).filter(line => line.trim()).length;

  // Get non-empty rows
  const nonEmptyLines = lines.slice(1).filter(line => line.trim());
  let processedRows = 0;

  // Process each row
  for (const line of nonEmptyLines) {
    try {
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => {
        const cleaned = v.trim().replace(/^"|"$/g, '').replace(/""/g, '"');
        return cleaned;
      });

      // Get ISBNs with proper parsing for Goodreads format
      let isbn10: string | undefined;
      let isbn13: string | undefined;

      if (isGoodreads) {
        // Goodreads format has quotes and equals, like: ="1234567890"
        if (isbn10Index !== -1) {
          const rawIsbn = values[isbn10Index];
          const match = rawIsbn.match(/="?(\d+)"?/);
          isbn10 = match ? match[1] : undefined;
        }
        if (isbn13Index !== -1) {
          const rawIsbn = values[isbn13Index];
          const match = rawIsbn.match(/="?(\d+)"?/);
          isbn13 = match ? match[1] : undefined;
        }
      } else {
        // Libro format is straightforward
        isbn10 = isbn10Index !== -1 ? values[isbn10Index] : undefined;
        isbn13 = isbn13Index !== -1 ? values[isbn13Index] : undefined;
      }

      // Get statuses based on format
      let ownership: OwnershipStatus = 'Owned'; // Default for Goodreads
      let reading: ReadingStatus = 'Completed'; // Default for Goodreads
      
      if (!isGoodreads) {
        ownership = values[ownershipIndex] as OwnershipStatus;
        reading = values[readingIndex] as ReadingStatus;

        if (!ownership || !reading) {
          throw new Error('Missing ownership or reading status');
        }

        if (!ownershipStatuses.includes(ownership)) {
          throw new Error(`Invalid ownership status "${ownership}". Must be one of: ${ownershipStatuses.join(', ')}`);
        }

        if (!readingStatuses.includes(reading)) {
          throw new Error(`Invalid reading status "${reading}". Must be one of: ${readingStatuses.join(', ')}`);
        }
      }

      // Map fields based on format and import book
      try {
        // Map authors based on format
        let authors: string[] = [];
        if (isGoodreads) {
          const mainAuthor = values[authorsIndex];
          let additionalAuthors: string[] = [];
          const additionalAuthorsValue = headers.includes('Additional Authors') ? values[headers.indexOf('Additional Authors')] : '';
          if (additionalAuthorsValue) {
            additionalAuthors = additionalAuthorsValue.split(',').map(a => a.trim());
          }
          authors = [mainAuthor, ...additionalAuthors].filter(Boolean);
        } else {
          authors = values[authorsIndex]?.split(';').map(a => a.trim()) || [];
        }

        // Import book
        const importResult = await importBook({
          title: values[titleIndex],
          authors,
          description: headers.includes('Description') ? values[headers.indexOf('Description')] : undefined,
          publishedDate: isGoodreads ? 
            values[publishedDateIndex] :  // Year for Goodreads
            values[publishedDateIndex],   // Full date for Libro
          publisher: publisherIndex !== -1 ? values[publisherIndex] : undefined,
          pageCount: pagesIndex !== -1 ? parseInt(values[pagesIndex]) : undefined,
          language: headers.includes('Language') ? values[headers.indexOf('Language')] : undefined,
          isbn10,
          isbn13,
          categories: headers.includes('Categories') ? values[headers.indexOf('Categories')].split(';').map(c => c.trim()) : undefined,
          ownership_status: ownership,
          reading_status: reading,
          user_id: session.user.id
        });

        // If the book exists in the library, skip it but count as processed
        if (importResult.status === 'exists') {
          processedRows++;
          onProgress?.({ current: processedRows, total: totalRows });
          continue;
        }

        // Add the book to user's collection
        await addBookToCollection({
          bookId: importResult.book.id,
          source: importResult.book.source,
          ownershipStatus: ownership,
          readingStatus: reading,
        });

        // For Goodreads imports, add review if rating exists
        if (isGoodreads && myRatingIndex !== -1) {
          const rating = parseInt(values[myRatingIndex]);
          const reviewText = myReviewIndex !== -1 ? values[myReviewIndex] : undefined;
          
          if (rating > 0) {
            try {
              await supabase.from('reviews').insert({
                book_id: importResult.book.id,
                user_id: session.user.id,
                rating,
                review_text: reviewText,
              });
            } catch (reviewError) {
              // Ignore duplicate review errors
              if (!(reviewError instanceof Error && reviewError.message.includes('duplicate key value violates unique constraint'))) {
                console.error('Failed to create review:', reviewError);
              }
            }
          }
        }

        // Mark as successfully imported and update progress
        result.success++;
        processedRows++;
        onProgress?.({ current: processedRows, total: totalRows });

      } catch (importError) {
        throw new Error(importError instanceof Error ? importError.message : 'Failed to import book');
      }

    } catch (error) {
      // Count as failed
      result.failed.push({
        row: processedRows + 1, // +1 to account for header row
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      processedRows++;
      onProgress?.({ current: processedRows, total: totalRows });
    }
  }
  
  return result;
};

export const getBookStatus = async (bookId: string): Promise<{ 
  ownershipStatus: OwnershipStatus; 
  readingStatus: ReadingStatus; 
} | null> => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    return null;
  }

  const { data, error } = await supabase
    .from('user_books')
    .select('ownership_status, reading_status')
    .eq('book_id', bookId)
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;

  return {
    ownershipStatus: data.ownership_status,
    readingStatus: data.reading_status,
  };
};
