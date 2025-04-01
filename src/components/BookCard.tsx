import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Book } from '@/types/book';
import { getBookAverageRating } from '@/services/reviewService';

type BookCardProps = {
  book: Book;
};

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  return (
    <Link to={`/book/${book.id}?source=${book.source}`} className="book-card block rounded-lg">
      <div className="rounded-lg overflow-hidden bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm h-full transition-all duration-300">
        <div className="relative pb-[140%] bg-book-light">
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={`${book.title} cover`}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 animate-fade-in"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-book-light">
              <span className="text-book-DEFAULT font-medium text-sm">{book.title}</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              book.source === 'libro' 
                ? 'bg-book-50 text-book-700' 
                : 'bg-purple-100 text-purple-800'
            }`}>
              {book.source === 'libro' ? 'Libro' : 'Google'}
            </span>
          </div>
        </div>
        
        <div className="px-3 pt-3 pb-2 flex flex-col h-[100px]">
          <div className="flex-1 mb-0.5">
            <h3 className="font-medium text-sm line-clamp-2 mb-0.5">{book.title}</h3>
            <p className="text-xs text-gray-500 truncate">
              {book.authors && book.authors.length > 0 ? (
                <>
                  {book.authors[0]}
                  {book.authors.length > 1 && ` (+${book.authors.length - 1})`}
                </>
              ) : null}
            </p>
          </div>
          <BookRating bookId={book.id} />
        </div>
      </div>
    </Link>
  );
};

const BookRating: React.FC<{ bookId: string }> = ({ bookId }) => {
  const { data: averageRating } = useQuery({
    queryKey: ['averageRating', bookId],
    queryFn: () => getBookAverageRating(bookId),
  });

  if (!averageRating?.total_reviews) {
    return (
      <div className="flex items-center gap-1 text-xs">
        <Star className="h-3 w-3 fill-gray-200 text-gray-200" />
        <span className="text-gray-400">-</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-xs">
      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
      <span>{averageRating.average_rating}</span>
      <span className="text-gray-400">
        ({averageRating.total_reviews})
      </span>
    </div>
  );
};

export default BookCard;
