import { describe, beforeEach, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookFormDialog } from '../BookFormDialog';
import { createBook, updateBook } from '@/services/libroBookService';
import { Book } from '@/types/book';

// Mock the book service functions
vi.mock('@/services/libroBookService', () => ({
  createBook: vi.fn(),
  updateBook: vi.fn(),
}));

// Mock the toast component
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('BookFormDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  
  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onSuccess: mockOnSuccess,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the add book form when no book is provided', () => {
    render(<BookFormDialog {...defaultProps} />);
    expect(screen.getByText('Add New Book')).toBeInTheDocument();
    expect(screen.getByText('Fill in the book details below.')).toBeInTheDocument();
  });

  it('renders the edit book form when a book is provided', () => {
    const mockBook = {
      id: '1',
      title: 'Test Book',
      authors: ['Author 1'],
      description: 'Test description',
      publishedDate: '2024-03-17',
      publisher: 'Test Publisher',
      pageCount: 100,
      language: 'en',
      isbn10: '1234567890',
      isbn13: '1234567890123',
      categories: ['Fiction'],
      source: 'libro' as const,
    };

    render(<BookFormDialog {...defaultProps} book={mockBook} />);
    expect(screen.getByText('Edit Book')).toBeInTheDocument();
    expect(screen.getByText('Update the book details below.')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Book')).toBeInTheDocument();
  });

  it('handles author additions and removals', async () => {
    const user = userEvent.setup();
    render(<BookFormDialog {...defaultProps} />);

    // Add an author
    const authorInput = screen.getAllByPlaceholderText('Type and press Enter')[0];
    await user.type(authorInput, 'Test Author');
    await user.keyboard('{Enter}');

    expect(screen.getByText('Test Author')).toBeInTheDocument();

    // Remove the author
    const authorChip = screen.getByText('Test Author').closest('div');
    const removeButton = authorChip?.querySelector('button');
    if (!removeButton) throw new Error('Remove button not found');
    await user.click(removeButton);

    expect(screen.queryByText('Test Author')).not.toBeInTheDocument();
  });

  it('handles category additions and removals', async () => {
    const user = userEvent.setup();
    render(<BookFormDialog {...defaultProps} />);

    // Add a category
    const categoryInput = screen.getAllByPlaceholderText('Type and press Enter')[1];
    await user.type(categoryInput, 'Test Category');
    await user.keyboard('{Enter}');

    expect(screen.getByText('Test Category')).toBeInTheDocument();

    // Remove the category
    const categoryChip = screen.getByText('Test Category').closest('div');
    const removeButton = categoryChip?.querySelector('button');
    if (!removeButton) throw new Error('Remove button not found');
    await user.click(removeButton);

    expect(screen.queryByText('Test Category')).not.toBeInTheDocument();
  });

  it('submits the form with valid data for new book', async () => {
    const user = userEvent.setup();
    render(<BookFormDialog {...defaultProps} />);

    // Fill out form fields
    await user.type(screen.getByLabelText('Title'), 'Test Book');
    await user.type(screen.getByLabelText('Description'), 'Test Description');
    await user.type(screen.getByLabelText('Publisher'), 'Test Publisher');
    await user.type(screen.getByLabelText('Language'), 'en');
    await user.type(screen.getByLabelText('ISBN-10'), '1234567890');
    await user.type(screen.getByLabelText('ISBN-13'), '1234567890123');
    await user.type(screen.getByLabelText('Page Count'), '100');

    // Add an author
    const authorInput = screen.getAllByPlaceholderText('Type and press Enter')[0];
    await user.type(authorInput, 'Test Author');
    await user.keyboard('{Enter}');

    // Add a category
    const categoryInput = screen.getAllByPlaceholderText('Type and press Enter')[1];
    await user.type(categoryInput, 'Test Category');
    await user.keyboard('{Enter}');

    // Set published date
    const dateInput = screen.getByLabelText('Published Date');
    await user.type(dateInput, '2024-03-17');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create book/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(createBook).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Book',
        authors: ['Test Author'],
        description: 'Test Description',
        publishedDate: '2024-03-17',
        publisher: 'Test Publisher',
        pageCount: 100,
        language: 'en',
        isbn10: '1234567890',
        isbn13: '1234567890123',
        categories: ['Test Category'],
      }));
    });

    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('updates an existing book', async () => {
    const user = userEvent.setup();
    const mockBook = {
      id: '1',
      title: 'Original Title',
      authors: ['Original Author'],
      description: 'Original description',
      publishedDate: '2024-03-17',
      publisher: 'Original Publisher',
      pageCount: 100,
      language: 'en',
      categories: ['Original Category'],
      source: 'libro' as const,
    };

    render(<BookFormDialog {...defaultProps} book={mockBook} />);

    // Update title
    const titleInput = screen.getByDisplayValue('Original Title');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Title');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(updateBook).toHaveBeenCalledWith(expect.objectContaining({
        id: '1',
        title: 'Updated Title',
      }));
    });

    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('validates required fields for new book', async () => {
    const user = userEvent.setup();
    render(<BookFormDialog {...defaultProps} />);

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /create book/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('At least one author is required')).toBeInTheDocument();
      expect(screen.getByText('Description is required')).toBeInTheDocument();
      expect(screen.getByText('Published date is required')).toBeInTheDocument();
      expect(screen.getByText('Publisher is required')).toBeInTheDocument();
      expect(screen.getByText('Language is required')).toBeInTheDocument();
      expect(screen.getByText('ISBN-10 must be 10 characters')).toBeInTheDocument();
      expect(screen.getByText('ISBN-13 must be 13 characters')).toBeInTheDocument();
      expect(screen.getByText('At least one category is required')).toBeInTheDocument();
    });

    expect(createBook).not.toHaveBeenCalled();
  });

  it('closes the dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<BookFormDialog {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles errors during form submission', async () => {
    const user = userEvent.setup();
    const mockError = new Error('Test error');
    (createBook as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(mockError);

    render(<BookFormDialog {...defaultProps} />);

    // Fill required fields
    await user.type(screen.getByLabelText('Title'), 'Test Book');
    await user.type(screen.getByLabelText('Description'), 'Test Description');
    await user.type(screen.getByLabelText('Publisher'), 'Test Publisher');
    await user.type(screen.getByLabelText('Language'), 'en');
    await user.type(screen.getByLabelText('ISBN-10'), '1234567890');
    await user.type(screen.getByLabelText('ISBN-13'), '1234567890123');
    await user.type(screen.getByLabelText('Page Count'), '100');

    // Add an author
    const authorInput = screen.getAllByPlaceholderText('Type and press Enter')[0];
    await user.type(authorInput, 'Test Author');
    await user.keyboard('{Enter}');

    // Add a category
    const categoryInput = screen.getAllByPlaceholderText('Type and press Enter')[1];
    await user.type(categoryInput, 'Test Category');
    await user.keyboard('{Enter}');

    // Set published date
    const dateInput = screen.getByLabelText('Published Date');
    await user.type(dateInput, '2024-03-17');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create book/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(createBook).toHaveBeenCalled();
      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
