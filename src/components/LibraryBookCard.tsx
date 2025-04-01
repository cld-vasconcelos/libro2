import React from 'react';
import BookCard from './BookCard';
import { Book } from '@/types/book';
import { OwnershipStatus, ReadingStatus } from '@/services/userBookService';

interface LibraryBookCardProps {
  book: Book;
  ownershipStatus: OwnershipStatus;
  readingStatus: ReadingStatus;
}

const LibraryBookCard: React.FC<LibraryBookCardProps> = ({ 
  book, 
  ownershipStatus,
  readingStatus 
}) => {
  return (
    <div className="relative group">
      <BookCard book={book} />
      <div className="pointer-events-none absolute top-2 right-2 flex gap-1">
        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-700 rounded">
          {ownershipStatus}
        </span>
        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-700 rounded">
          {readingStatus}
        </span>
      </div>
    </div>
  );
};

export default LibraryBookCard;
