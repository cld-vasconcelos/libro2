---
name: React Development
description: Expert knowledge for React development practices and patterns
type: knowledge
triggers: [react, jsx, tsx, component, hook, props, state, context]
author: OpenHands
version: 1.0.0
---

# React Development Guide

Core knowledge for React development in the Libro project, focusing on functional components and hooks.

## Component Patterns

### Functional Components
```typescript
// Basic component with props
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'primary' 
}) => (
  <button
    className={`btn btn-${variant}`}
    onClick={onClick}
  >
    {label}
  </button>
);
```

### Error Boundaries
```typescript
const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    return <ErrorFallback />;
  }
  
  return <>{children}</>;
};
```

## Hook Usage

### State Management
```typescript
// Local state
const [value, setValue] = useState<string>('');

// Complex state
const [state, dispatch] = useReducer(reducer, initialState);

// Derived state
const total = useMemo(() => items.reduce((sum, item) => sum + item.price, 0), [items]);
```

### Side Effects
```typescript
// Data fetching
useEffect(() => {
  const fetchData = async () => {
    const data = await api.getData();
    setData(data);
  };
  void fetchData();
}, []);

// Cleanup
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe();
}, []);
```

## Performance Optimization

### Component Memoization
```typescript
// Prevent unnecessary rerenders
const MemoizedComponent = memo(Component, (prev, next) => {
  return prev.value === next.value;
});

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(prop);
}, [prop]);
```

### Context Usage
```typescript
// Create context
const AppContext = createContext<AppContextType | null>(null);

// Use context
const value = useContext(AppContext);
if (!value) throw new Error('Must be used within Provider');
```

## Common Patterns

### Custom Hooks
```typescript
const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};
```

### Compound Components
```typescript
const Tabs = ({ children }: { children: React.ReactNode }) => {
  const [active, setActive] = useState(0);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      {children}
    </TabsContext.Provider>
  );
};

Tabs.Panel = ({ children, index }: { children: React.ReactNode; index: number }) => {
  const { active } = useTabsContext();
  return active === index ? <>{children}</> : null;
};
```

## Testing Essentials

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('button click', async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  
  render(<Button label="Click me" onClick={onClick} />);
  await user.click(screen.getByRole('button'));
  
  expect(onClick).toHaveBeenCalled();
});
```

## Best Practices

- Use TypeScript for all components
- Keep components focused and small
- Handle loading and error states
- Clean up side effects
- Test user interactions
- Document props with JSDoc
- Use semantic HTML elements
- Follow accessibility guidelines
- Implement proper error handling
- Optimize performance judiciously
