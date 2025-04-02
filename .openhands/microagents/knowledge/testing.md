---
name: Testing Practices
description: Expert knowledge for testing React applications using Vitest and React Testing Library
type: knowledge
triggers: [test, testing, vitest, jest, rtl, unit test, integration, e2e]
author: OpenHands
version: 1.0.0
---

# Testing Guide

Best practices for testing React applications in the Libro project.

## Test Setup

### Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/']
    }
  }
});
```

## Component Testing

### Basic Component Test
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookCard } from './BookCard';

describe('BookCard', () => {
  const defaultProps = {
    title: 'Test Book',
    author: 'Test Author',
    onSelect: vi.fn()
  };

  it('renders book information', () => {
    render(<BookCard {...defaultProps} />);
    
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.author)).toBeInTheDocument();
  });

  it('handles selection', async () => {
    const user = userEvent.setup();
    render(<BookCard {...defaultProps} />);
    
    await user.click(screen.getByRole('button'));
    expect(defaultProps.onSelect).toHaveBeenCalled();
  });
});
```

## Query Patterns

### Selection Methods
```typescript
// By Role (Preferred)
const button = screen.getByRole('button', { name: /submit/i });
const input = screen.getByRole('textbox', { name: /email/i });

// By Label
const emailInput = screen.getByLabelText('Email address');

// By Text
const heading = screen.getByText(/welcome/i);

// By Test ID (Last Resort)
const element = screen.getByTestId('submit-button');
```

## Async Testing

### Data Fetching
```typescript
test('loads and displays books', async () => {
  // Mock API
  server.use(
    rest.get('/api/books', (req, res, ctx) => {
      return res(ctx.json([
        { id: 1, title: 'Book 1' }
      ]));
    })
  );

  render(<BookList />);
  
  // Wait for loading
  expect(await screen.findByText('Book 1')).toBeInTheDocument();
});
```

## Mock Patterns

### Function Mocks
```typescript
// Mock function
const handleSubmit = vi.fn();

// Mock module
vi.mock('./api', () => ({
  fetchBooks: vi.fn().mockResolvedValue([
    { id: 1, title: 'Book 1' }
  ])
}));

// Mock hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1 },
    isAuthenticated: true
  })
}));
```

## Context Testing

### Provider Wrapper
```typescript
const customRender = (ui: React.ReactElement, providerProps = {}) => {
  return render(
    <AppContext.Provider value={providerProps}>
      {ui}
    </AppContext.Provider>
  );
};

test('uses context value', () => {
  customRender(<Component />, { user: { id: 1 } });
  // Assert context usage
});
```

## Best Practices

### Test Structure
- Arrange: Set up test data
- Act: Execute test actions
- Assert: Verify expectations
- Cleanup: Reset if needed

### Component Tests
- Test behavior, not implementation
- Focus on user interactions
- Verify accessible elements
- Test error states
- Validate props usage

### Test Organization
- Group related tests
- Use clear descriptions
- Keep tests focused
- Share setup code
- Clean up after tests

### Code Coverage
- Components: 90%+
- Hooks: 90%+
- Utils: 85%+
- Services: 85%+
- Routes: 80%+

### Common Patterns
- User interactions
- Data loading
- Error handling
- Form submission
- Route changes

## Integration Testing

### Router Testing
```typescript
import { MemoryRouter } from 'react-router-dom';

const renderWithRouter = (ui: React.ReactElement, route = '/') => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
};
```

## Testing Tips

### Debugging
- screen.debug()
- test.only()
- Verbose errors
- Console logs
- Browser devtools

### Performance
- Mock heavy operations
- Use setup/teardown
- Batch related tests
- Clear mocks
- Reset handlers
