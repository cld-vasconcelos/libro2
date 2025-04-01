import { describe, beforeEach, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import TopBar from '../TopBar';
import { useUser } from '@/contexts/UserContext';
import { signOut } from '@/services/authService';
import { Session } from '@supabase/supabase-js';

// Mock the react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the UserContext
vi.mock('@/contexts/UserContext', () => ({
  useUser: vi.fn(),
}));

// Mock the authService
vi.mock('@/services/authService', () => ({
  signOut: vi.fn(),
}));

// Mock the toast component
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock the BookFormDialog component
vi.mock('../BookFormDialog', () => ({
  BookFormDialog: vi.fn(({ open, onClose, onSuccess }) => (
    <div data-testid="book-form-dialog">
      <span>Book Form Dialog</span>
      <span data-testid="dialog-open">{open.toString()}</span>
      <button onClick={() => onClose()}>Close Dialog</button>
      <button onClick={() => onSuccess()}>Success</button>
    </div>
  )),
}));

describe('TopBar', () => {
  // Mock session for authenticated user tests
  const mockSession: Session = {
    user: {
      id: 'test-user-id',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2025-01-01T00:00:00Z',
      email: 'john.doe@example.com',
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderTopBar = (isAuthenticated = false) => {
    // Mock the useUser hook to return authenticated or unauthenticated state
    vi.mocked(useUser).mockReturnValue({
      session: isAuthenticated ? mockSession : null,
      isLoading: false,
    });

    return render(
      <MemoryRouter>
        <TopBar />
      </MemoryRouter>
    );
  };

  it('renders the logo and search bar', () => {
    renderTopBar();
    
    // Check for logo
    expect(screen.getByText('Libro')).toBeInTheDocument();
    
    // Check for search bar
    expect(screen.getByPlaceholderText('Search for books, authors, or topics...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('does not show Add Book button when user is not authenticated', () => {
    renderTopBar(false);
    
    expect(screen.queryByText('Add Book')).not.toBeInTheDocument();
  });

  it('shows Add Book button when user is authenticated', () => {
    renderTopBar(true);
    
    expect(screen.getByText('Add Book')).toBeInTheDocument();
  });

  it('shows Login option in dropdown when user is not authenticated', async () => {
    const user = userEvent.setup();
    renderTopBar(false);
    
    // Open the dropdown menu
    const userButton = screen.getByRole('button', {
      name: '', // User icon button doesn't have a name when not authenticated
    });
    await user.click(userButton);
    
    // Check for Login option
    expect(screen.getByText('Login')).toBeInTheDocument();
    
    // Check that authenticated options are not shown
    expect(screen.queryByText('My Library')).not.toBeInTheDocument();
    expect(screen.queryByText('My Reviews')).not.toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('shows authenticated options in dropdown when user is authenticated', async () => {
    const user = userEvent.setup();
    renderTopBar(true);
    
    // Open the dropdown menu
    const userButton = screen.getByText('JD');
    await user.click(userButton);
    
    // Check for authenticated options
    expect(screen.getByText('My Library')).toBeInTheDocument();
    expect(screen.getByText('My Reviews')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    
    // Check that Login option is not shown
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  it('navigates to login page when Login is clicked', async () => {
    const user = userEvent.setup();
    renderTopBar(false);
    
    // Open the dropdown menu
    const userButton = screen.getByRole('button', {
      name: '', // User icon button doesn't have a name when not authenticated
    });
    await user.click(userButton);
    
    // Click on Login
    const loginOption = screen.getByText('Login');
    await user.click(loginOption);
    
    // Check that navigate was called with correct path
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('navigates to library page when My Library is clicked', async () => {
    const user = userEvent.setup();
    renderTopBar(true);
    
    // Open the dropdown menu
    const userButton = screen.getByText('JD');
    await user.click(userButton);
    
    // Click on My Library
    const libraryOption = screen.getByText('My Library');
    await user.click(libraryOption);
    
    // Check that navigate was called with correct path
    expect(mockNavigate).toHaveBeenCalledWith('/library');
  });

  it('navigates to reviews page when My Reviews is clicked', async () => {
    const user = userEvent.setup();
    renderTopBar(true);
    
    // Open the dropdown menu
    const userButton = screen.getByText('JD');
    await user.click(userButton);
    
    // Click on My Reviews
    const reviewsOption = screen.getByText('My Reviews');
    await user.click(reviewsOption);
    
    // Check that navigate was called with correct path
    expect(mockNavigate).toHaveBeenCalledWith('/reviews');
  });

  it('calls signOut and navigates to home page when Logout is clicked', async () => {
    const user = userEvent.setup();
    renderTopBar(true);
    
    // Open the dropdown menu
    const userButton = screen.getByText('JD');
    await user.click(userButton);
    
    // Click on Logout
    const logoutOption = screen.getByText('Logout');
    await user.click(logoutOption);
    
    // Check that signOut was called
    expect(signOut).toHaveBeenCalled();
    
    // Wait for the async logout process to complete
    await waitFor(() => {
      // Check that navigate was called with correct path
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('handles search form submission for general search', async () => {
    const user = userEvent.setup();
    renderTopBar();
    
    // Type in the search input
    const searchInput = screen.getByPlaceholderText('Search for books, authors, or topics...');
    await user.type(searchInput, 'Harry Potter');
    
    // Submit the form
    const searchButton = screen.getByRole('button', { name: /search/i });
    await user.click(searchButton);
    
    // Check that navigate was called with correct search query and type
    expect(mockNavigate).toHaveBeenCalledWith('/search?q=Harry%20Potter&type=general');
  });

  it('handles search form submission for ISBN search', async () => {
    const user = userEvent.setup();
    renderTopBar();
    
    // Type in the search input with an ISBN-10
    const searchInput = screen.getByPlaceholderText('Search for books, authors, or topics...');
    await user.type(searchInput, '0123456789');
    
    // Submit the form
    const searchButton = screen.getByRole('button', { name: /search/i });
    await user.click(searchButton);
    
    // Check that navigate was called with correct search query and type
    expect(mockNavigate).toHaveBeenCalledWith('/search?q=0123456789&type=isbn');
  });

  it('does not navigate on empty search', async () => {
    const user = userEvent.setup();
    renderTopBar();
    
    // Submit the form without typing anything
    const searchButton = screen.getByRole('button', { name: /search/i });
    await user.click(searchButton);
    
    // Check that navigate was not called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('opens BookFormDialog when Add Book button is clicked', async () => {
    const user = userEvent.setup();
    renderTopBar(true);
    
    // Click on Add Book button
    const addBookButton = screen.getByText('Add Book');
    await user.click(addBookButton);
    
    // Check that dialog is opened
    expect(screen.getByTestId('dialog-open')).toHaveTextContent('true');
  });

  it('displays user initials when authenticated', () => {
    renderTopBar(true);
    
    // Check for user initials (JD from john.doe@example.com)
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('handles error during logout', async () => {
    const user = userEvent.setup();
    renderTopBar(true);
    
    // Mock signOut to throw an error
    vi.mocked(signOut).mockRejectedValueOnce(new Error('Logout failed'));
    
    // Open the dropdown menu
    const userButton = screen.getByText('JD');
    await user.click(userButton);
    
    // Click on Logout
    const logoutOption = screen.getByText('Logout');
    await user.click(logoutOption);
    
    // Check that signOut was called
    expect(signOut).toHaveBeenCalled();
    
    // Wait for the async logout process to complete
    await waitFor(() => {
      // Check that navigate was not called since logout failed
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('navigates to home page when logo is clicked', async () => {
    const user = userEvent.setup();
    renderTopBar();
    
    // Click on the logo
    const logo = screen.getByText('Libro');
    await user.click(logo);
    
    // Check that the href attribute is correct
    expect(logo.closest('a')).toHaveAttribute('href', '/');
  });
});
