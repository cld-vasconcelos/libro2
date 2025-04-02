# Testing Knowledge

## Keywords
testing, jest, vitest, react-testing-library, unit test, integration test, e2e, mock, stub, spy, assertion, coverage

## Overview
Expert in testing practices for React applications, including unit testing, integration testing, and test-driven development using Jest, Vitest, and React Testing Library.

## React Testing Library

### Basic Testing
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked!')).toBeInTheDocument();
  });
});
```

### Queries
```typescript
// Best practices in order of preference
const button = screen.getByRole('button');
const input = screen.getByLabelText('Username');
const header = screen.getByText('Welcome');
const image = screen.getByAltText('Profile');
const element = screen.getByTestId('custom-element');

// Async queries
const element = await screen.findByText('Loaded');
const items = await screen.findAllByRole('listitem');

// Query variants
const optionalElement = screen.queryByText('Not always there');
const allItems = screen.getAllByRole('listitem');
```

### User Interactions
```typescript
import userEvent from '@testing-library/user-event';

test('form submission', async () => {
  const user = userEvent.setup();
  const handleSubmit = vi.fn();
  
  render(<Form onSubmit={handleSubmit} />);
  
  await user.type(screen.getByLabelText('Email'), 'test@example.com');
  await user.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(handleSubmit).toHaveBeenCalled();
});
```

## Jest/Vitest Configuration

### Setup
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
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/']
    }
  }
});
```

### Custom Matchers
```typescript
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    return {
      pass,
      message: () => `expected ${received} to be within range ${floor}-${ceiling}`
    };
  }
});
```

## Mocking

### Function Mocks
```typescript
// Mock function
const mockFn = vi.fn();
mockFn.mockReturnValue('default');
mockFn.mockResolvedValue({ data: 'async' });

// Spy on method
const spy = vi.spyOn(object, 'method');

// Mock implementation
const mock = vi.fn().mockImplementation(() => 'result');
```

### Module Mocks
```typescript
// Mock module
vi.mock('./service', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: 'mocked' })
}));

// Mock specific module parts
vi.mock('axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: {} })
  }
}));
```

### Timer Mocks
```typescript
// Fast-forward time
vi.useFakeTimers();
vi.advanceTimersByTime(1000);
vi.runAllTimers();
vi.useRealTimers();
```

## Integration Testing

### Router Testing
```typescript
import { BrowserRouter } from 'react-router-dom';

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

test('navigation', () => {
  renderWithRouter(<App />);
  // Test navigation logic
});
```

### Context Testing
```typescript
const renderWithContext = (ui: React.ReactElement, contextValue = {}) => {
  return render(
    <AppContext.Provider value={contextValue}>
      {ui}
    </AppContext.Provider>
  );
};
```

## Testing Patterns

### Component Testing
```typescript
describe('Component', () => {
  // Setup/teardown
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Rendering
  test('renders initially', () => {
    render(<Component />);
    // Assertions
  });

  // User interaction
  test('handles events', async () => {
    const user = userEvent.setup();
    // Test interactions
  });

  // Async behavior
  test('loads data', async () => {
    // Test loading states
  });
});
```

### Hook Testing
```typescript
import { renderHook, act } from '@testing-library/react';

test('useCustomHook', () => {
  const { result } = renderHook(() => useCustomHook());

  act(() => {
    result.current.update();
  });

  expect(result.current.value).toBe('updated');
});
```

## Test Organization

### File Structure
```
src/
  components/
    Button/
      Button.tsx
      Button.test.tsx
  hooks/
    useAuth/
      useAuth.ts
      useAuth.test.ts
  test/
    setup.ts
    utils/
      test-utils.tsx
```

### Test Suites
```typescript
describe('Feature', () => {
  describe('Component', () => {
    describe('method', () => {
      it('should handle case 1', () => {});
      it('should handle case 2', () => {});
    });
  });
});
```

## Best Practices

### Writing Tests
- Test behavior, not implementation
- Use semantic queries
- Avoid testing implementation details
- Write readable test descriptions
- Follow the Arrange-Act-Assert pattern

### Test Coverage
- Maintain high coverage for critical paths
- Balance coverage with maintenance cost
- Focus on user-facing functionality
- Test edge cases and error states

### Performance
- Mock heavy operations
- Use setup/teardown efficiently
- Batch related tests
- Clean up after tests

### Debugging
- Use screen.debug()
- Leverage test.only and test.skip
- Use descriptive error messages
- Maintain isolated test environments
