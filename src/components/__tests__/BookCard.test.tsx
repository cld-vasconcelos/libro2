import { render, screen } from '../../test/utils/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import BookCard from '../BookCard';
import { Book } from '@/types/book';

// Mock react-query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

interface RatingData {
  average_rating: number;
  total_reviews: number;
}

const createMockQueryResult = (data: RatingData) => ({
  fetchStatus: 'idle' as const,
  promise: Promise.resolve() as Promise<unknown>,
  data,
  isLoading: false,
  isError: false,
  error: null,
  status: 'success',
  isSuccess: true,
  isPending: false,
  isLoadingError: false,
  isRefetchError: false,
  dataUpdatedAt: Date.now(),
  errorUpdatedAt: 0,
  failureCount: 0,
  failureReason: null,
  errorUpdateCount: 0,
  isFetched: true,
  isFetchedAfterMount: true,
  isFetching: false,
  isInitialLoading: false,
  isPaused: false,
  isPlaceholderData: false,
  isRefetching: false,
  isStale: false,
  refetch: vi.fn(),
} as const);

const mockUseQuery = useQuery as unknown as Mock<typeof useQuery>;

describe('BookCard', () => {
  const mockBook: Book = {
    id: '123',
    source: 'libro',
    title: 'Test Book',
    authors: ['John Doe', 'Jane Smith'],
    coverImage: 'http://example.com/cover.jpg',
  };

  const mockRating = {
    average_rating: 4.5,
    total_reviews: 10,
  };

  beforeEach(() => {
    mockUseQuery.mockReturnValue(createMockQueryResult(mockRating));
  });

  it('renders book details correctly', () => {
    render(
      <MemoryRouter>
        <BookCard book={mockBook} />
      </MemoryRouter>
    );

    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('John Doe (+1)')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', mockBook.coverImage);
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Test Book cover');
  });

  it('renders source badge with correct styling for libro source', () => {
    render(
      <MemoryRouter>
        <BookCard book={mockBook} />
      </MemoryRouter>
    );

    const badge = screen.getByText('Libro');
    expect(badge).toHaveClass('bg-book-50', 'text-book-700');
  });

  it('renders source badge with correct styling for google source', () => {
    const googleBook = { ...mockBook, source: 'google' as const };
    render(
      <MemoryRouter>
        <BookCard book={googleBook} />
      </MemoryRouter>
    );

    const badge = screen.getByText('Google');
    expect(badge).toHaveClass('bg-purple-100', 'text-purple-800');
  });

  it('renders title in placeholder when no cover image', () => {
    const bookWithoutCover = { ...mockBook, coverImage: undefined };
    render(
      <MemoryRouter>
        <BookCard book={bookWithoutCover} />
      </MemoryRouter>
    );

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    const placeholderTitle = screen.getAllByText('Test Book')[0];
    expect(placeholderTitle).toHaveClass('text-book-DEFAULT');
  });

  it('links to correct book detail page', () => {
    render(
      <MemoryRouter>
        <BookCard book={mockBook} />
      </MemoryRouter>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/book/${mockBook.id}?source=${mockBook.source}`);
  });

  describe('BookRating', () => {
    it('renders rating when data exists', () => {
      render(
        <MemoryRouter>
          <BookCard book={mockBook} />
        </MemoryRouter>
      );

      expect(screen.getByText('4.5')).toBeInTheDocument();
      expect(screen.getByText('(10)')).toBeInTheDocument();
    });

    it('does not render when no reviews exist', () => {
      mockUseQuery.mockReturnValue(
        createMockQueryResult({ average_rating: 0, total_reviews: 0 })
      );

      render(
        <MemoryRouter>
          <BookCard book={mockBook} />
        </MemoryRouter>
      );

      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('uses correct query key', () => {
      render(
        <MemoryRouter>
          <BookCard book={mockBook} />
        </MemoryRouter>
      );

      expect(useQuery).toHaveBeenCalledWith({
        queryKey: ['averageRating', mockBook.id],
        queryFn: expect.any(Function),
      });
    });
  });
});
