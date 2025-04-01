
export interface Author {
  id: string;
  name: string;
  bio?: string;
  books?: Book[];
}

export interface BookApiSource {
  id: string;
  name: string;
  api_key?: string;
  base_url: string;
  enabled: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export type BookSourceName = 'google' | 'libro' | 'openlibrary' | string;

export interface Book {
  source: BookSourceName;
  id: string;
  title: string;
  authors: string[];
  coverImage?: string;
  description?: string;
  publishedDate?: string;
  publisher?: string;
  isbn10?: string;
  isbn13?: string;
  pageCount?: number;
  categories?: string[];
  language?: string;
  averageRating?: number;
}

export interface BookReview {
  id: string;
  book: Book;
  content: string;
  rating: number;
  user_id: string;
  created_at: string;
}

export interface GoogleBooksResponse {
  items: {
    id: string;
    volumeInfo: {
      title: string;
      authors?: string[];
      description?: string;
      publishedDate?: string;
      publisher?: string;
      imageLinks?: {
        thumbnail?: string;
        smallThumbnail?: string;
      };
      industryIdentifiers?: Array<{
        type: string;
        identifier: string;
      }>;
      pageCount?: number;
      categories?: string[];
      language?: string;
      averageRating?: number;
    };
  }[];
  totalItems: number;
}
