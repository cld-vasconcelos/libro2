# Testing Documentation

This project uses Vitest with React Testing Library for testing. The setup includes:

## Tools & Libraries

- **Vitest**: Test runner that's Vite-native
- **@testing-library/react**: For testing React components
- **@testing-library/jest-dom**: Custom DOM element matchers
- **@testing-library/user-event**: For simulating user interactions
- **jsdom**: For DOM emulation in Node.js environment

## Directory Structure

```
src/test/
├── README.md           # This documentation
├── setup.ts           # Global test setup and configuration
├── test.d.ts         # TypeScript definitions for test matchers
└── utils/
    └── test-utils.tsx # Common test utilities and custom render function
```

## Test File Naming & Location

- Test files should be placed in `__tests__` directories adjacent to the code they're testing
- Test files should be named `*.test.tsx` or `*.test.ts`
- Example: `src/components/__tests__/ComponentName.test.tsx`

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Writing Tests

### Import Statement

Use the custom render function from test utils:

```typescript
import { render, screen } from '../../test/utils/test-utils';
```

### Test Structure

```typescript
describe('ComponentName', () => {
  it('should [expected behavior]', () => {
    render(<Component />);
    // ... test code
  });
});
```

### Common Patterns

1. **Querying Elements**
   ```typescript
   // Prefer data-testid for querying
   const element = screen.getByTestId('test-id');
   
   // Other queries
   screen.getByRole('button');
   screen.getByText('Submit');
   ```

2. **Testing User Interactions**
   ```typescript
   const { user } = render(<Component />);
   await user.click(screen.getByRole('button'));
   ```

3. **Testing Asynchronous Operations**
   ```typescript
   await waitFor(() => {
     expect(screen.getByText('Loaded')).toBeInTheDocument();
   });
   ```

## Best Practices

1. Test components in isolation
2. Use data-testid sparingly, prefer user-centric queries
3. Test component behavior, not implementation details
4. Write tests that resemble how users interact with your app
5. Keep tests focused and concise
