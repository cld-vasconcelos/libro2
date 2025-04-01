import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/contexts/UserContext';
import TopBar from '@/components/TopBar';
import { getReviewsByUserId } from '@/services/reviewService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import StarRating from '@/components/StarRating';
import Spinner from '@/components/ui/spinner';
import { getBookById } from '@/services/bookService';
import { Book, BookReview } from '@/types/book';
import { Review } from '@/services/reviewService';

const PAGE_SIZE_OPTIONS = [5, 10, 20];

const Reviews = () => {
  const { session, isLoading: isSessionLoading } = useUser();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;

  const { data: reviewsData, isLoading: isReviewsLoading } = useQuery({
    queryKey: ['userReviews', session?.user.id, page, pageSize],
    queryFn: async () => {
      if (!session?.user.id) return { reviews: [], total: 0 };
      return getReviewsByUserId(session.user.id, page, pageSize);
    },
    enabled: !!session?.user.id,
  });

  // Fetch books data separately
  const { data: reviews = [], isLoading: isBooksLoading } = useQuery({
    queryKey: ['userReviewsBooks', session?.user.id, page, pageSize, reviewsData?.reviews],
    queryFn: async () => {
      const reviewsWithBooks = await Promise.all<BookReview>(
        (reviewsData?.reviews || []).map(async (review) => {
          // First try Google Books
          const googleBook = await getBookById(review.book_id, 'google')
            .catch(() => null); // Catch any errors and continue

          if (googleBook) {
            return {
              id: review.id,
              rating: review.rating,
              content: review.review_text || '',
              created_at: review.created_at,
              user_id: review.user_id,
              book: googleBook
            };
          }

          // If not found in Google Books, try Libro
          const libroBook = await getBookById(review.book_id, 'libro')
            .catch(() => null); // Catch any errors and continue

          if (libroBook) {
            return {
              id: review.id,
              rating: review.rating,
              content: review.review_text || '',
              created_at: review.created_at,
              user_id: review.user_id,
              book: libroBook
            };
          }

          // If book not found in either source, return with placeholder
          return {
            id: review.id,
            rating: review.rating,
            content: review.review_text || '',
            created_at: review.created_at,
            user_id: review.user_id,
            book: {
              id: review.book_id,
              source: 'google',
              title: 'Unknown Book',
              authors: [],
              description: 'Book details not available'
            }
          };
        })
      );
      return reviewsWithBooks;
    },
    enabled: !!reviewsData?.reviews?.length,
  });

  const isLoading = isSessionLoading || isReviewsLoading || isBooksLoading;

  // Only redirect after we confirm there's no session
  if (!isSessionLoading && !session) {
    navigate('/login');
    return null;
  }

  const totalPages = reviewsData ? Math.ceil(reviewsData.total / pageSize) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Reviews</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Reviews per page:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setSearchParams(prev => {
                  const params = new URLSearchParams(prev);
                  params.set('pageSize', value);
                  params.set('page', '1'); // Reset to first page when changing size
                  return params;
                });
              }}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isSessionLoading ? (
          <div className="h-[calc(100vh-12rem)] flex justify-center items-center">
            <Spinner />
          </div>
        ) : isReviewsLoading || !reviewsData ? (
          <div className="h-[calc(100vh-12rem)] flex justify-center items-center">
            <Spinner />
            <span className="ml-2 text-gray-600">Loading reviews...</span>
          </div>
        ) : isBooksLoading ? (
          <div className="grid gap-4">
            {(reviewsData?.reviews || []).map((review) => (
              <Card key={review.id} className="hover:shadow-md transition-shadow animate-pulse">
                <div className="flex">
                  <div className="flex-shrink-0 w-24 h-32 m-4 bg-gray-200" />
                  <div className="flex-1 p-4">
                    <div className="h-6 w-2/3 bg-gray-200 rounded mb-4" />
                    <div className="h-4 w-1/3 bg-gray-200 rounded mb-2" />
                    <div className="h-16 bg-gray-200 rounded" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-gray-600">You haven't written any reviews yet.</p>
        ) : (
          <>
            <div className="grid gap-4 mb-8">
              {reviews.map((review) => (
                <Card key={review.id} className="hover:shadow-md transition-shadow">
                  <div className="flex">
                    <div
                      className="flex-shrink-0 w-24 h-32 m-4 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => navigate(`/book/${review.book.id}?source=${review.book.source}`)}
                    >
                      <img
                        src={review.book.coverImage || '/placeholder.svg'}
                        alt={review.book.title}
                        className="w-full h-full object-cover rounded-md shadow-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <CardHeader>
                        <CardTitle>
                          <button
                            onClick={() => navigate(`/book/${review.book.id}?source=${review.book.source}`)}
                            className="hover:text-book-DEFAULT transition-colors text-left"
                          >
                            {review.book.title}
                          </button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-2">
                          <StarRating rating={review.rating} />
                        </div>
                        <p className="text-gray-600">{review.content}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Posted on {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  {page > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setSearchParams(prev => {
                            const params = new URLSearchParams(prev);
                            params.set('page', (page - 1).toString());
                            return params;
                          });
                        }}
                      />
                    </PaginationItem>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2))
                    .map((p, i, arr) => (
                      <React.Fragment key={p}>
                        {i > 0 && arr[i - 1] !== p - 1 && (
                          <PaginationItem>
                            <span className="px-4">...</span>
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            isActive={page === p}
                            onClick={(e) => {
                              e.preventDefault();
                              setSearchParams(prev => {
                                const params = new URLSearchParams(prev);
                                params.set('page', p.toString());
                                return params;
                              });
                            }}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      </React.Fragment>
                    ))}

                  {page < totalPages && (
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setSearchParams(prev => {
                            const params = new URLSearchParams(prev);
                            params.set('page', (page + 1).toString());
                            return params;
                          });
                        }}
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Reviews;
