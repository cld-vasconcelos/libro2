import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, Pencil } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { getBookReviews, getBookAverageRating, getUserReviewForBook } from '@/services/reviewService';
import { useUser } from '@/contexts/UserContext';
import ReviewFormDialog from './ReviewFormDialog';

interface ReviewSectionProps {
  bookId: string;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20];

const ReviewSection: React.FC<ReviewSectionProps> = ({ bookId }) => {
  const { session } = useUser();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    editReview?: {
      id: string;
      rating: number;
      review_text?: string;
    };
  }>({ isOpen: false });

  const { data: userReview } = useQuery({
    queryKey: ['userReview', bookId, session?.user?.id],
    queryFn: () => getUserReviewForBook(session?.user?.id || '', bookId),
    enabled: !!session?.user?.id,
  });

  const { data: reviewsData, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['reviews', bookId, page, pageSize],
    queryFn: () => getBookReviews(bookId, page, pageSize),
  });

  const { data: averageRating, isLoading: isLoadingAverage } = useQuery({
    queryKey: ['averageRating', bookId],
    queryFn: () => getBookAverageRating(bookId),
  });

  if (isLoadingReviews || isLoadingAverage) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const totalPages = reviewsData ? Math.ceil(reviewsData.total / pageSize) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-medium mb-1">Reviews</h2>
          {averageRating?.total_reviews ? (
            <p className="text-gray-600">
              <span className="flex items-center gap-2">
                {`${averageRating.total_reviews} review${
                  averageRating.total_reviews === 1 ? '' : 's'
                }`}
                <span className="flex items-center gap-1">
                  • <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> 
                  {averageRating.average_rating}
                </span>
              </span>
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-4">
          {reviewsData?.total > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Reviews per page:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1);
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
          )}
          {session?.user && !userReview && (
            <button 
              onClick={() => setDialogState({ isOpen: true })}
              className="px-4 py-2 bg-book text-white rounded-lg hover:bg-book-dark transition-colors"
            >
              Write a Review
            </button>
          )}
        </div>
      </div>
      
      <ReviewFormDialog
        bookId={bookId}
        open={dialogState.isOpen}
        onOpenChange={(isOpen) => setDialogState({ isOpen })}
        editReview={dialogState.editReview}
      />

      {!reviewsData?.reviews || reviewsData.reviews.length === 0 ? (
        <p className="text-gray-600 text-center py-8">
          There are no reviews for this book yet.
          {session?.user
            ? ' Be the first to write one!'
            : ' '}
            {!session?.user && (
              <Link to="/login" className="text-book hover:underline">
                Sign in to be the first to write one!
              </Link>
            )}
        </p>
      ) : (
        <>
          <div className="space-y-6 mb-6">
            {reviewsData.reviews
              .sort((a, b) => (a.user_id === session?.user?.id ? -1 : b.user_id === session?.user?.id ? 1 : 0))
              .map((review) => (
              <div
                key={review.id}
                className={`rounded-lg p-4 border ${
                  review.user_id === session?.user?.id
                    ? 'bg-book/5 border-book/10'
                    : 'bg-gray-50 border-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <div className="flex items-center gap-4">
                    <div>{renderStars(review.rating)}</div>
                    {session?.user?.id === review.user_id && (
                      <button
                        onClick={() => setDialogState({ 
                          isOpen: true,
                          editReview: {
                            id: review.id,
                            rating: review.rating,
                            review_text: review.review_text,
                          }
                        })}
                        className="p-1 rounded-full hover:bg-gray-100"
                        title="Edit review"
                      >
                        <Pencil className="h-4 w-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                  <span className="text-gray-500 text-sm shrink-0">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                {review.review_text && (
                  <p className="text-gray-700">{review.review_text}</p>
                )}
              </div>
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
                        setPage(page - 1);
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
                            setPage(p);
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
                        setPage(page + 1);
                      }}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewSection;
