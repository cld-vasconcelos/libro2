import { describe, it, expect, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import LibraryBookCard from '../LibraryBookCard';
import { Book } from '@/types/book';
import { OwnershipStatus, ReadingStatus } from '@/services/userBookService';

// Mock BookCard component
vi.mock('../BookCard', () => ({
  default: vi.fn(() => <div data-testid="book-card">Book Card</div>),
}));

describe('LibraryBookCard', () => {
  const mockBook: Book = {
    id: '1',
    title: 'Test Book',
    authors: ['Test Author'],
    source: 'libro' as const,
  };

  it('renders BookCard with ownership and reading status badges', () => {
    render(
      <LibraryBookCard
        book={mockBook}
        ownershipStatus="Owned"
        readingStatus="Reading"
      />
    );

    expect(screen.getByTestId('book-card')).toBeInTheDocument();
    expect(screen.getByText('Owned')).toBeInTheDocument();
    expect(screen.getByText('Reading')).toBeInTheDocument();
  });

  it('displays different ownership statuses correctly', () => {
    const ownershipStatuses: OwnershipStatus[] = [
      'Owned',
      'Wishlist',
      'Borrowed',
      'Lent Out',
      'Digital',
      'Gifted',
    ];

    ownershipStatuses.forEach((status) => {
      cleanup();
      render(
        <LibraryBookCard
          book={mockBook}
          ownershipStatus={status}
          readingStatus="Not Started"
        />
      );
      expect(screen.getByText(status)).toBeInTheDocument();
    });
  });

  it('displays different reading statuses correctly', () => {
    const readingStatuses: ReadingStatus[] = [
      'Not Started',
      'Reading',
      'Paused',
      'Completed',
      'Abandoned',
      'Re-reading',
    ];

    readingStatuses.forEach((status) => {
      cleanup();
      render(
        <LibraryBookCard
          book={mockBook}
          ownershipStatus="Owned"
          readingStatus={status}
        />
      );
      expect(screen.getByText(status)).toBeInTheDocument();
    });
  });

  it('applies correct styling to status badges', () => {
    render(
      <LibraryBookCard
        book={mockBook}
        ownershipStatus="Owned"
        readingStatus="Reading"
      />
    );

    const badges = screen.getAllByText(/Owned|Reading/);
    badges.forEach(badge => {
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-700', 'rounded');
    });
  });
});
