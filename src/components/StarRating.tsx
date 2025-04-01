import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
}

const StarRating = ({ rating, maxRating = 5 }: StarRatingProps) => {
  return (
    <div className="flex gap-0.5">
      {[...Array(maxRating)].map((_, index) => (
        <Star
          key={index}
          data-testid="star"
          className={`h-4 w-4 ${
            index < rating
              ? 'fill-book text-book'
              : 'fill-gray-100 text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

export default StarRating;
