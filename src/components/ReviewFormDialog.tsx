import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { createReview, updateReview } from '@/services/reviewService';
import { useUser } from '@/contexts/UserContext';

interface ReviewFormDialogProps {
  bookId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editReview?: {
    id: string;
    rating: number;
    review_text?: string;
  };
}

const ReviewFormDialog: React.FC<ReviewFormDialogProps> = ({
  bookId,
  open,
  onOpenChange,
  editReview,
}) => {
  const { session } = useUser();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  React.useEffect(() => {
    if (editReview) {
      setRating(editReview.rating);
      setReviewText(editReview.review_text || '');
    }
  }, [editReview]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || rating === 0) return;

    setIsSubmitting(true);
    try {
      if (editReview) {
        await updateReview(editReview.id, {
          rating,
          review_text: reviewText.trim() || undefined,
        });
      } else {
        await createReview({
          book_id: bookId,
          user_id: session.user.id,
          rating,
          review_text: reviewText.trim() || undefined,
        });
      }

      // Invalidate and refetch queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['reviews', bookId] }),
        queryClient.invalidateQueries({ queryKey: ['averageRating', bookId] }),
        queryClient.invalidateQueries({ 
          queryKey: ['userReview', bookId, session.user.id] 
        }),
      ]);

      // Reset form and close dialog
      if (!editReview) {
        setRating(0);
        setReviewText('');
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-8 w-8 cursor-pointer transition-colors ${
              star <= (hoverRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          // Reset form when closing
          if (!editReview) {
            setRating(0);
            setReviewText('');
          }
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editReview ? 'Edit Review' : 'Write a Review'}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-6 py-6">
            <div className="flex flex-col items-center gap-2">
              {renderStars()}
              <span className="text-sm text-gray-500">
                {rating 
                  ? `You rated this ${rating} star${rating !== 1 ? 's' : ''}` 
                  : 'Select a rating'}
              </span>
            </div>

            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write your review (optional)"
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter className="flex gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rating === 0 || isSubmitting}
              className="px-4 py-2 bg-book text-white rounded-lg hover:bg-book-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : editReview ? 'Save Changes' : 'Submit Review'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewFormDialog;
