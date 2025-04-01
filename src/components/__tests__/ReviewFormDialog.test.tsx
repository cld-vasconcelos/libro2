import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewFormDialog from '../ReviewFormDialog';
import { createReview, updateReview } from '@/services/reviewService';

// Mock the reviewService
vi.mock('@/services/reviewService', () => ({
  createReview: vi.fn(),
  updateReview: vi.fn(),
}));

// Mock the UserContext
vi.mock('@/contexts/UserContext', () => ({
  useUser: () => ({
    session: {
      user: {
        id: 'test-user-id',
      },
    },
  }),
}));

// Mock the react-query hooks
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn().mockResolvedValue(undefined),
  }),
}));

describe('ReviewFormDialog', () => {
  const mockOnOpenChange = vi.fn();
  
  const defaultProps = {
    bookId: 'book-123',
    open: true,
    onOpenChange: mockOnOpenChange,
  };

  const editReviewProps = {
    ...defaultProps,
    editReview: {
      id: 'review-123',
      rating: 4,
      review_text: 'This is an existing review',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the create review dialog correctly', () => {
    render(<ReviewFormDialog {...defaultProps} />);
    
    expect(screen.getByText('Write a Review')).toBeInTheDocument();
    expect(screen.getByText('Select a rating')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Write your review (optional)')).toBeInTheDocument();
    expect(screen.getByText('Submit Review')).toBeInTheDocument();
  });

  it('renders the edit review dialog with existing data', () => {
    render(<ReviewFormDialog {...editReviewProps} />);
    
    expect(screen.getByText('Edit Review')).toBeInTheDocument();
    expect(screen.getByText('You rated this 4 stars')).toBeInTheDocument();
    
    const textarea = screen.getByPlaceholderText('Write your review (optional)');
    expect(textarea).toHaveValue('This is an existing review');
    
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('allows setting a rating', async () => {
    const user = userEvent.setup();
    render(<ReviewFormDialog {...defaultProps} />);
    
    // Find all star elements (there should be 5)
    const stars = document.querySelectorAll('.cursor-pointer');
    expect(stars.length).toBe(5);
    
    // Click the third star
    await user.click(stars[2]);
    
    // Verify the rating text updates
    expect(screen.getByText('You rated this 3 stars')).toBeInTheDocument();
  });

  it('submits a new review', async () => {
    const user = userEvent.setup();
    render(<ReviewFormDialog {...defaultProps} />);
    
    // Set a rating
    const stars = document.querySelectorAll('.cursor-pointer');
    await user.click(stars[4]); // 5-star rating
    
    // Add review text
    const textarea = screen.getByPlaceholderText('Write your review (optional)');
    await user.type(textarea, 'This is my review');
    
    // Submit the form
    const submitButton = screen.getByText('Submit Review');
    await user.click(submitButton);
    
    // Verify the service was called with correct values
    await waitFor(() => {
      expect(createReview).toHaveBeenCalledWith({
        book_id: 'book-123',
        user_id: 'test-user-id',
        rating: 5,
        review_text: 'This is my review',
      });
    });
    
    // Verify dialog was closed
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('updates an existing review', async () => {
    const user = userEvent.setup();
    render(<ReviewFormDialog {...editReviewProps} />);
    
    // Change the rating
    const stars = document.querySelectorAll('.cursor-pointer');
    await user.click(stars[2]); // 3-star rating
    
    // Change the review text
    const textarea = screen.getByPlaceholderText('Write your review (optional)');
    await user.clear(textarea);
    await user.type(textarea, 'Updated review text');
    
    // Submit the form
    const saveButton = screen.getByText('Save Changes');
    await user.click(saveButton);
    
    // Verify the service was called with correct values
    await waitFor(() => {
      expect(updateReview).toHaveBeenCalledWith('review-123', {
        rating: 3,
        review_text: 'Updated review text',
      });
    });
    
    // Verify dialog was closed
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('disables the submit button when no rating is selected', () => {
    render(<ReviewFormDialog {...defaultProps} />);
    
    const submitButton = screen.getByText('Submit Review');
    expect(submitButton).toBeDisabled();
  });

  it('handles errors during submission', async () => {
    const user = userEvent.setup();
    const mockError = new Error('Test error');
    (createReview as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(mockError);
    
    // Mock console.error to prevent error output in tests
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    render(<ReviewFormDialog {...defaultProps} />);
    
    // Set a rating
    const stars = document.querySelectorAll('.cursor-pointer');
    await user.click(stars[3]); // 4-star rating
    
    // Submit the form
    const submitButton = screen.getByText('Submit Review');
    await user.click(submitButton);
    
    // Verify the service was called
    await waitFor(() => {
      expect(createReview).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Error submitting review:', mockError);
    });
    
    // Verify dialog was not closed due to error
    expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  it('closes the dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<ReviewFormDialog {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('resets form when dialog is closed and reopened', async () => {
    const user = userEvent.setup();
    
    // First render - dialog is open
    const { unmount } = render(<ReviewFormDialog {...defaultProps} />);
    
    // Set a rating
    const stars = document.querySelectorAll('.cursor-pointer');
    await user.click(stars[2]); // 3-star rating
    
    // Add review text
    const textarea = screen.getByPlaceholderText('Write your review (optional)');
    await user.type(textarea, 'This is my review');
    
    // Verify the rating and text were set
    expect(screen.getByText('You rated this 3 stars')).toBeInTheDocument();
    expect(textarea).toHaveValue('This is my review');
    
    // Unmount the component (simulating dialog close)
    unmount();
    
    // Render again (simulating dialog reopen)
    render(<ReviewFormDialog {...defaultProps} />);
    
    // Verify the form has been reset
    expect(screen.getByText('Select a rating')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Write your review (optional)')).toHaveValue('');
  });
});
