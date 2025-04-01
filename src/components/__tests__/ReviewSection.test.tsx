import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ReviewSection from '../ReviewSection';
import { getBookReviews, getBookAverageRating, getUserReviewForBook } from '@/services/reviewService';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUser } from '@/contexts/UserContext';
import { Session } from '@supabase/supabase-js';

// Mock the reviewService
vi.mock('@/services/reviewService', () => ({
  getBookReviews: vi.fn(),
  getBookAverageRating: vi.fn(),
  getUserReviewForBook: vi.fn(),
}));

// Mock the ReviewFormDialog component
vi.mock('../ReviewFormDialog', () => ({
  default: vi.fn(({ bookId, open, onOpenChange, editReview }) => (
    <div data-testid="review-form-dialog">
      <span>Review Form Dialog</span>
      <span data-testid="dialog-book-id">{bookId}</span>
      <span data-testid="dialog-open">{open.toString()}</span>
      <span data-testid="dialog-edit-review">{JSON.stringify(editReview)}</span>
      <button onClick={() => onOpenChange(false)}>Close Dialog</button>
    </div>
  )),
}));

// Mock UserContext with a Session object
const mockSession: Session = {
  user: {
    id: 'test-user-id',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2025-01-01T00:00:00Z',
    email: 'test@example.com',
    phone: '',
    role: null,
    identities: [],
    last_sign_in_at: null,
    updated_at: '2025-01-01T00:00:00Z',
    confirmed_at: '2025-01-01T00:00:00Z',
  },
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  expires_at: 9999999999,
};

const mockNoSession = null;

vi.mock('@/contexts/UserContext', () => ({
  useUser: vi.fn(() => ({
    session: mockSession,
    isLoading: false,
  })),
}));

describe('ReviewSection', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const mockReviewsData = {
    reviews: [
      {
        id: 'review-1',
        book_id: 'book-123',
        user_id: 'test-user-id',
        rating: 4,
        review_text: 'This is my review',
        created_at: '2025-03-15T12:00:00Z',
        updated_at: '2025-03-15T12:00:00Z',
      },
      {
        id: 'review-2',
        book_id: 'book-123',
        user_id: 'other-user-id',
        rating: 3,
        review_text: 'This is another review',
        created_at: '2025-03-14T12:00:00Z',
        updated_at: '2025-03-14T12:00:00Z',
      },
    ],
    total: 2
  };

  const mockAverageRating = {
    average_rating: 3.5,
    total_reviews: 2,
  };

  const mockUserReview = {
    id: 'review-1',
    book_id: 'book-123',
    user_id: 'test-user-id',
    rating: 4,
    review_text: 'This is my review',
    created_at: '2025-03-15T12:00:00Z',
    updated_at: '2025-03-15T12:00:00Z',
  };

  const renderComponent = (
    userHasReview = true,
    hasSession = true,
    isLoading = false
  ) => {
    // Setup mocks based on parameters
    vi.mocked(getBookReviews).mockResolvedValue(isLoading ? null : mockReviewsData);
    vi.mocked(getBookAverageRating).mockResolvedValue(isLoading ? null : mockAverageRating);
    vi.mocked(getUserReviewForBook).mockResolvedValue(
      isLoading ? null : userHasReview ? mockUserReview : null
    );

    // Mock session based on parameter
    vi.mocked(useUser).mockReturnValue({
      session: hasSession ? mockSession : mockNoSession,
      isLoading: false,
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReviewSection bookId="book-123" />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('renders loading skeletons when data is loading', async () => {
    // Create a new query client for this test to ensure clean state
    const testQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    // Mock the loading state by returning a promise that doesn't resolve
    vi.mocked(getBookReviews).mockReturnValue(new Promise(() => {}));
    vi.mocked(getBookAverageRating).mockReturnValue(new Promise(() => {}));
    
    // Ensure UserContext is mocked properly
    vi.mocked(useUser).mockReturnValue({
      session: mockSession,
      isLoading: false,
    });

    render(
      <QueryClientProvider client={testQueryClient}>
        <MemoryRouter>
          <ReviewSection bookId="book-123" />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Check for skeleton elements - using h- class which is part of the Skeleton component
    const skeletons = document.querySelectorAll('.h-8');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders reviews and average rating correctly', async () => {
    renderComponent();

    // Wait for data to load
    await waitFor(() => {
      expect(getBookReviews).toHaveBeenCalledWith('book-123', 1, 10);
      expect(getBookAverageRating).toHaveBeenCalledWith('book-123');
    });

    // Check for reviews heading
    expect(screen.getByText('Reviews')).toBeInTheDocument();

    // Check for average rating - using a regex to match text that might be split across elements
    expect(screen.getByText('2 reviews')).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('3.5'))).toBeInTheDocument();

    // Check for review content
    expect(screen.getByText('This is my review')).toBeInTheDocument();
    expect(screen.getByText('This is another review')).toBeInTheDocument();
  });

  it('renders "no reviews" message when there are no reviews', async () => {
    // Mock empty reviews
    vi.mocked(getBookReviews).mockResolvedValue({ reviews: [], total: 0 });
    vi.mocked(getBookAverageRating).mockResolvedValue({ average_rating: 0, total_reviews: 0 });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReviewSection bookId="book-123" />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(getBookReviews).toHaveBeenCalledWith('book-123', 1, 10);
    });

    // Check for no reviews message - using a function to match text that might be split across elements
    expect(screen.getByText((content) => content.includes('There are no reviews for this book yet'))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Be the first to write one'))).toBeInTheDocument();
  });

  it('renders "sign in to write a review" message for unauthenticated users', async () => {
    // Mock empty reviews to trigger the "no reviews" message with sign in link
    vi.mocked(getBookReviews).mockResolvedValue({ reviews: [], total: 0 });
    vi.mocked(getBookAverageRating).mockResolvedValue({ average_rating: 0, total_reviews: 0 });
    vi.mocked(useUser).mockReturnValue({
      session: null,
      isLoading: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReviewSection bookId="book-123" />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(getBookReviews).toHaveBeenCalledWith('book-123', 1, 10);
    });

    // Check for text content directly since the link might be rendered differently
    const noReviewsText = screen.getByText((content) => 
      content.includes('There are no reviews for this book yet')
    );
    expect(noReviewsText).toBeInTheDocument();
    
    const signInText = screen.getByText((content) => 
      content.includes('Sign in')
    );
    expect(signInText).toBeInTheDocument();
    
    // Find the link element
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/login');
  });

  it('shows "Write a Review" button for authenticated users without a review', async () => {
    renderComponent(false, true);

    // Wait for data to load
    await waitFor(() => {
      expect(getUserReviewForBook).toHaveBeenCalledWith('test-user-id', 'book-123');
    });

    // Check for write review button
    const writeReviewButton = screen.getByText('Write a Review');
    expect(writeReviewButton).toBeInTheDocument();
  });

  it('does not show "Write a Review" button for users who already have a review', async () => {
    renderComponent(true, true);

    // Wait for data to load
    await waitFor(() => {
      expect(getUserReviewForBook).toHaveBeenCalledWith('test-user-id', 'book-123');
    });

    // Check that write review button is not present
    expect(screen.queryByText('Write a Review')).not.toBeInTheDocument();
  });

  it('opens the review dialog when "Write a Review" button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent(false, true);

    // Wait for data to load
    await waitFor(() => {
      expect(getUserReviewForBook).toHaveBeenCalledWith('test-user-id', 'book-123');
    });

    // Click the write review button
    const writeReviewButton = screen.getByText('Write a Review');
    await user.click(writeReviewButton);

    // Check that dialog is opened
    expect(screen.getByTestId('dialog-open')).toHaveTextContent('true');
    expect(screen.getByTestId('dialog-book-id')).toHaveTextContent('book-123');
    expect(screen.getByTestId('dialog-edit-review')).toHaveTextContent('');
  });

  it('opens the edit review dialog when edit button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent(true, true);

    // Wait for data to load
    await waitFor(() => {
      expect(getBookReviews).toHaveBeenCalledWith('book-123', 1, 10);
    });

    // Find and click the edit button
    const editButton = screen.getByTitle('Edit review');
    await user.click(editButton);

    // Check that dialog is opened with edit data
    expect(screen.getByTestId('dialog-open')).toHaveTextContent('true');
    expect(screen.getByTestId('dialog-book-id')).toHaveTextContent('book-123');
    
    // Check that the edit review data is passed correctly
    const editReviewData = JSON.parse(screen.getByTestId('dialog-edit-review').textContent || '{}');
    expect(editReviewData.id).toBe('review-1');
    expect(editReviewData.rating).toBe(4);
    expect(editReviewData.review_text).toBe('This is my review');
  });

  it('renders stars correctly based on rating', async () => {
    renderComponent();

    // Wait for data to load
    await waitFor(() => {
      expect(getBookReviews).toHaveBeenCalledWith('book-123', 1, 10);
    });

    // Check for filled stars in the reviews
    const filledStars = document.querySelectorAll('.fill-yellow-400');
    expect(filledStars.length).toBeGreaterThan(0);
  });

  it('sorts reviews to show the user\'s review first', async () => {
    // Create reviews with the user's review not first in the list
    const reversedMockReviews = {
      reviews: [...mockReviewsData.reviews].reverse(),
      total: 2
    };
    vi.mocked(getBookReviews).mockResolvedValue(reversedMockReviews);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReviewSection bookId="book-123" />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(getBookReviews).toHaveBeenCalledWith('book-123', 1, 10);
    });

    // Get all review elements
    const reviewElements = document.querySelectorAll('.rounded-lg.p-4.border');
    
    // The first review should be the user's review (with bg-book/5 class)
    expect(reviewElements[0]).toHaveClass('bg-book/5');
  });
});
