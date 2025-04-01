import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditLibraryDialog } from '../EditLibraryDialog';
import { updateBookInCollection, OwnershipStatus, ReadingStatus } from '@/services/userBookService';

// Mock the userBookService
vi.mock('@/services/userBookService', () => ({
  updateBookInCollection: vi.fn(),
  OwnershipStatus: [
    'Owned',
    'Wishlist',
    'Borrowed',
    'Lent Out',
    'Digital',
    'Gifted',
  ],
  ReadingStatus: [
    'Not Started',
    'Reading',
    'Paused',
    'Completed',
    'Abandoned',
    'Re-reading',
  ],
}));

// Mock the toast component
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock the Select components
vi.mock('@/components/ui/select', () => {
  const Select = ({ value, onValueChange, children, disabled }) => {
    // Find the testId from the SelectTrigger child
    let testId = '';
    React.Children.forEach(children, child => {
      if (child.type.name === 'SelectTrigger' && child.props['data-testid']) {
        testId = child.props['data-testid'].replace('select-trigger-', '');
      }
    });
    
    return (
      <div data-testid={`select-mock-${testId}`}>
        <button 
          data-testid={`select-trigger-${testId}`}
          onClick={() => {}} 
          disabled={disabled}
        >
          {value}
        </button>
        <div data-testid={`select-content-${testId}`}>
          {React.Children.map(children, child => {
            if (child.type.name === 'SelectContent') {
              return React.Children.map(child.props.children, item => {
                if (item.type.name === 'SelectItem') {
                  return (
                    <button 
                      key={item.props.value}
                      data-testid={`select-item-${item.props.value}`}
                      onClick={() => onValueChange(item.props.value)}
                      disabled={disabled}
                    >
                      {item.props.value}
                    </button>
                  );
                }
                return null;
              });
            }
            return null;
          })}
        </div>
      </div>
    );
  };

  return {
    Select,
    SelectContent: ({ children }) => children,
    SelectItem: ({ value, children }) => children,
    SelectTrigger: ({ children }) => children,
    SelectValue: () => null,
  };
});

describe('EditLibraryDialog', () => {
  const mockOnClose = vi.fn();
  
  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    bookId: '123',
    bookTitle: 'Test Book',
    currentOwnershipStatus: 'Owned' as OwnershipStatus,
    currentReadingStatus: 'Not Started' as ReadingStatus,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with the correct title and book name', () => {
    render(<EditLibraryDialog {...defaultProps} />);
    
    expect(screen.getByText('Update Library Status')).toBeInTheDocument();
    expect(screen.getByText('Update status for "Test Book" in your library')).toBeInTheDocument();
  });

  it('initializes with the current ownership and reading statuses', () => {
    render(<EditLibraryDialog {...defaultProps} />);
    
    // Check that the select elements show the current values
    const ownershipTrigger = screen.getByTestId('select-trigger-ownership');
    expect(ownershipTrigger).toHaveTextContent('Owned');
    
    const readingTrigger = screen.getByTestId('select-trigger-reading');
    expect(readingTrigger).toHaveTextContent('Not Started');
  });

  it('allows changing the ownership status', async () => {
    const user = userEvent.setup();
    render(<EditLibraryDialog {...defaultProps} />);
    
    // Open the ownership status dropdown
    const ownershipTrigger = screen.getByTestId('select-trigger-ownership');
    await user.click(ownershipTrigger);
    
    // Select a different status
    const wishlistOption = screen.getByTestId('select-item-Wishlist');
    await user.click(wishlistOption);
    
    // Verify the selection changed
    expect(ownershipTrigger).toHaveTextContent('Wishlist');
  });

  it('allows changing the reading status', async () => {
    const user = userEvent.setup();
    render(<EditLibraryDialog {...defaultProps} />);
    
    // Open the reading status dropdown
    const readingTrigger = screen.getByTestId('select-trigger-reading');
    await user.click(readingTrigger);
    
    // Select a different status
    const readingOption = screen.getByTestId('select-item-Reading');
    await user.click(readingOption);
    
    // Verify the selection changed
    expect(readingTrigger).toHaveTextContent('Reading');
  });

  it('submits the form with updated values', async () => {
    const user = userEvent.setup();
    render(<EditLibraryDialog {...defaultProps} />);
    
    // Change ownership status
    const ownershipTrigger = screen.getByTestId('select-trigger-ownership');
    await user.click(ownershipTrigger);
    const digitalOption = screen.getByTestId('select-item-Digital');
    await user.click(digitalOption);
    
    // Change reading status
    const readingTrigger = screen.getByTestId('select-trigger-reading');
    await user.click(readingTrigger);
    const completedOption = screen.getByTestId('select-item-Completed');
    await user.click(completedOption);
    
    // Submit the form
    const saveButton = screen.getByText('Save Changes');
    await user.click(saveButton);
    
    // Verify the service was called with correct values
    await waitFor(() => {
      expect(updateBookInCollection).toHaveBeenCalledWith({
        bookId: '123',
        ownershipStatus: 'Digital',
        readingStatus: 'Completed',
      });
    });
    
    // Verify dialog was closed
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles errors during form submission', async () => {
    const user = userEvent.setup();
    const mockError = new Error('Test error');
    (updateBookInCollection as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(mockError);
    
    render(<EditLibraryDialog {...defaultProps} />);
    
    // Submit the form without changing values
    const saveButton = screen.getByText('Save Changes');
    await user.click(saveButton);
    
    // Verify the service was called
    await waitFor(() => {
      expect(updateBookInCollection).toHaveBeenCalled();
    });
    
    // Verify dialog was not closed due to error
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('closes the dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<EditLibraryDialog {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('disables form controls during submission', async () => {
    const user = userEvent.setup();
    // Make the updateBookInCollection function delay to simulate network request
    (updateBookInCollection as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      return new Promise(resolve => setTimeout(resolve, 100));
    });
    
    render(<EditLibraryDialog {...defaultProps} />);
    
    // Submit the form
    const saveButton = screen.getByText('Save Changes');
    await user.click(saveButton);
    
    // Check that buttons and selects are disabled during submission
    expect(saveButton).toBeDisabled();
    expect(screen.getByText('Cancel')).toBeDisabled();
    
    // Wait for the submission to complete
    await waitFor(() => {
      expect(updateBookInCollection).toHaveBeenCalled();
    });
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    // Make the updateBookInCollection function delay to simulate network request
    (updateBookInCollection as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      return new Promise(resolve => setTimeout(resolve, 100));
    });
    
    render(<EditLibraryDialog {...defaultProps} />);
    
    // Submit the form
    const saveButton = screen.getByText('Save Changes');
    await user.click(saveButton);
    
    // Check that the button text changes to indicate loading
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    
    // Wait for the submission to complete
    await waitFor(() => {
      expect(updateBookInCollection).toHaveBeenCalled();
    });
  });
});
