import { render, screen } from '../../test/utils/test-utils';
import { describe, it, expect, vi } from 'vitest';
import BookGrid from '../BookGrid';
import { Book } from '@/types/book';
import { MemoryRouter } from 'react-router-dom';

// Mock BookCard component to simplify testing
vi.mock('../BookCard', () => ({
  default: ({ book }: { book: Book }) => (
    <div data-testid="book-card" data-book-id={book.id}>
      {book.title}
    </div>
  ),
}));

describe('BookGrid', () => {
  const mockBooks: Book[] = [
    {
      id: '1',
      source: 'libro',
      title: 'Book 1',
      authors: ['Author 1'],
    },
    {
      id: '2',
      source: 'google',
      title: 'Book 2',
      authors: ['Author 2'],
    },
    {
      id: '3',
      source: 'libro',
      title: 'Book 3',
      authors: ['Author 3'],
    },
  ];

  it('renders a grid of book cards', () => {
    render(
      <MemoryRouter>
        <BookGrid books={mockBooks} />
      </MemoryRouter>
    );

    const bookCards = screen.getAllByTestId('book-card');
    expect(bookCards).toHaveLength(3);
    expect(screen.getByText('Book 1')).toBeInTheDocument();
    expect(screen.getByText('Book 2')).toBeInTheDocument();
    expect(screen.getByText('Book 3')).toBeInTheDocument();
  });

  it('renders loading skeletons when isLoading is true', () => {
    render(
      <MemoryRouter>
        <BookGrid books={[]} isLoading={true} />
      </MemoryRouter>
    );

    // Check for skeleton elements
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(48); // 12 skeleton cards with 4 elements each
  });

  it('renders empty state when no books are found', () => {
    render(
      <MemoryRouter>
        <BookGrid books={[]} />
      </MemoryRouter>
    );

    expect(screen.getByText('No books found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search terms')).toBeInTheDocument();
  });

  it('applies correct grid layout classes', () => {
    render(
      <MemoryRouter>
        <BookGrid books={mockBooks} />
      </MemoryRouter>
    );

    const grid = document.querySelector('.grid');
    expect(grid).toHaveClass(
      'grid',
      'grid-cols-2',
      'sm:grid-cols-3',
      'md:grid-cols-4',
      'lg:grid-cols-5',
      'gap-4',
      'md:gap-6'
    );
  });
});
