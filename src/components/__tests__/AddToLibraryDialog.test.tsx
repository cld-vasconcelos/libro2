import { render, screen, waitFor } from '../../test/utils/test-utils';
import { AddToLibraryDialog } from '../AddToLibraryDialog';
import { addBookToCollection } from '@/services/userBookService';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { BookSource } from '@/types/book';

// Mock dependencies
vi.mock('@/services/userBookService', () => ({
  addBookToCollection: vi.fn(),
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn(),
}));

describe('AddToLibraryDialog', () => {
  const mockToast = vi.fn();
  const mockInvalidateQueries = vi.fn();
  const mockOnClose = vi.fn();
  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    bookId: '123',
    bookTitle: 'Test Book',
    source: 'google' as BookSource,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as Mock).mockReturnValue({ toast: mockToast });
    (useQueryClient as Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });
  });

  it('renders dialog with book title', () => {
    render(<AddToLibraryDialog {...defaultProps} />);
    expect(screen.getByText(`Add "Test Book" to your library`)).toBeInTheDocument();
  });

  it('renders ownership and reading status selects', () => {
    render(<AddToLibraryDialog {...defaultProps} />);
    expect(screen.getByText('Ownership Status')).toBeInTheDocument();
    expect(screen.getByText('Reading Status')).toBeInTheDocument();
  });

  it('handles successful book addition', async () => {
    const { user } = render(<AddToLibraryDialog {...defaultProps} />);
    (addBookToCollection as Mock).mockResolvedValueOnce({});

    await user.click(screen.getByRole('button', { name: 'Add to Library' }));

    await waitFor(() => {
      expect(addBookToCollection).toHaveBeenCalledWith({
        bookId: '123',
        source: 'google',
        ownershipStatus: 'Owned', // Default value
        readingStatus: 'Not Started', // Default value
      });
    });

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['bookInCollection', '123'] });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['userBooks'] });
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Book added to your library.',
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles failed book addition', async () => {
    const { user } = render(<AddToLibraryDialog {...defaultProps} />);
    const error = new Error('Failed to add book');
    (addBookToCollection as Mock).mockRejectedValueOnce(error);

    await user.click(screen.getByRole('button', { name: 'Add to Library' }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to add book',
        variant: 'destructive',
      });
    });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('shows default status values', () => {
    render(<AddToLibraryDialog {...defaultProps} />);
    
    // Find and verify ownership status
    const ownershipSelectValue = screen.getByText('Owned');
    expect(ownershipSelectValue).toBeInTheDocument();

    // Find and verify reading status
    const readingSelectValue = screen.getByText('Not Started');
    expect(readingSelectValue).toBeInTheDocument();
  });

  it('submits with default values', async () => {
    const { user } = render(<AddToLibraryDialog {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: 'Add to Library' }));

    await waitFor(() => {
      expect(addBookToCollection).toHaveBeenCalledWith({
        bookId: '123',
        source: 'google',
        ownershipStatus: 'Owned',
        readingStatus: 'Not Started',
      });
    });
  });

  it('disables buttons while loading', async () => {
    const { user } = render(<AddToLibraryDialog {...defaultProps} />);
    let resolvePromise: (value: unknown) => void;
    const addPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    (addBookToCollection as Mock).mockReturnValue(addPromise);

    await user.click(screen.getByRole('button', { name: 'Add to Library' }));

    expect(screen.getByRole('button', { name: 'Adding...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();

    resolvePromise({});
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add to Library' })).toBeEnabled();
    });
  });

  it('closes dialog on cancel', async () => {
    const { user } = render(<AddToLibraryDialog {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
