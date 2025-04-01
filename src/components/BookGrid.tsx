
import React from 'react';
import BookCard from './BookCard';
import { Book } from '@/types/book';
import { Skeleton } from "@/components/ui/skeleton";

type BookGridProps = {
  books: Book[];
  isLoading?: boolean;
};

const BookGrid: React.FC<BookGridProps> = ({ books, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="rounded-lg overflow-hidden">
              <Skeleton className="w-full pb-[140%]" />
              <div className="p-3">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-medium text-gray-700 mb-2">No books found</h3>
        <p className="text-gray-500">Try adjusting your search terms</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
};

export default BookGrid;
