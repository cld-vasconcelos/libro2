import { supabase } from '@/lib/supabase';
import { Book, BookReview } from '@/types/book';
import { getBookById } from '@/services/bookService';

export interface Review {
  id: string;
  book_id: string;
  user_id: string;
  rating: number;
  review_text?: string;
  created_at: string;
  updated_at: string;
}

export interface BookAverageRating {
  average_rating: number;
  total_reviews: number;
}

export const getBookReviews = async (
  bookId: string,
  page = 1,
  pageSize = 10
): Promise<{ reviews: Review[]; total: number }> => {
  // First get total count
  const { count, error: countError } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('book_id', bookId);

  if (countError) {
    throw countError;
  }

  // Then get paginated results
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('book_id', bookId)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    throw error;
  }

  return {
    reviews: reviews || [],
    total: count || 0
  };
};

export const getUserReviewForBook = async (userId: string, bookId: string): Promise<Review | null> => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('book_id', bookId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
    throw error;
  }

  return data;
};

export const getBookAverageRating = async (bookId: string): Promise<BookAverageRating> => {
  const { data, error } = await supabase
    .from('book_average_ratings')
    .select('*')
    .eq('book_id', bookId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
    throw error;
  }

  return data || { average_rating: 0, total_reviews: 0 };
};

export const createReview = async (review: Omit<Review, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert([review])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateReview = async (reviewId: string, review: Partial<Review>) => {
  const { data, error } = await supabase
    .from('reviews')
    .update(review)
    .eq('id', reviewId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const deleteReview = async (reviewId: string) => {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId);

  if (error) {
    throw error;
  }
};

export const getReviewsByUserId = async (
  userId: string,
  page = 1,
  pageSize = 10
): Promise<{ reviews: Review[]; total: number }> => {
  // First get total count
  const { count, error: countError } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (countError) {
    throw countError;
  }

  // Then get paginated results
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    throw error;
  }

  return {
    reviews: reviews || [],
    total: count || 0
  };
};
