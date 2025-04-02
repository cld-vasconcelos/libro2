# React Development Knowledge

## Keywords
react, jsx, tsx, component, hook, props, state, context, memo, useEffect, useState, react-dom

## Overview
Expert in React development practices, component architecture, hooks, and optimization techniques.

## Component Best Practices

### Functional Components
```typescript
// Preferred approach
const Component = ({ prop1, prop2 }: Props) => {
  return <div>...</div>;
};

// Avoid class components unless necessary for legacy code
```

### Props Types
- Always define prop types using TypeScript interfaces
- Make props optional when they have sensible defaults
- Document complex prop types

### State Management
- Use useState for local state
- Leverage useReducer for complex state logic
- Context API for global state
- Avoid prop drilling

## Hooks Guidelines

### Built-in Hooks
- useState: Local component state
- useEffect: Side effects management
- useContext: Context consumption
- useMemo: Value memoization
- useCallback: Function memoization
- useRef: DOM references and persistent values

### Custom Hooks
- Extract reusable logic into custom hooks
- Follow use* naming convention
- Keep hooks focused and composable

## Performance Optimization

### Memoization
```typescript
// Memoize expensive calculations
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// Memoize callback functions
const memoizedCallback = useCallback(
  () => doSomething(a, b),
  [a, b],
);
```

### React.memo Usage
```typescript
const MemoizedComponent = React.memo(Component, (prevProps, nextProps) => {
  return prevProps.value === nextProps.value;
});
```

## Error Handling

### Error Boundaries
```typescript
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    return <ErrorFallback />;
  }
  
  return children;
};
```

## Common Patterns

### Compound Components
```typescript
const Tabs = ({ children }) => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
};

Tabs.Panel = ({ children, index }) => {
  const { activeTab } = useTabsContext();
  return activeTab === index ? children : null;
};
```

### Render Props
```typescript
const DataFetcher = ({ render }) => {
  const [data, setData] = useState(null);
  // ... fetch logic
  return render(data);
};
```

## Testing Recommendations
- Use React Testing Library
- Test component behavior, not implementation
- Focus on user interactions
- Avoid testing library internals

## Common Mistakes to Avoid
- Mutating state directly
- Ignoring key props in lists
- Overusing useEffect
- Not cleaning up side effects
- Premature optimization

## Performance Tips
- Use production builds
- Implement code splitting
- Lazy load components
- Optimize images and assets
- Minimize re-renders

## Accessibility
- Use semantic HTML
- Implement ARIA attributes
- Ensure keyboard navigation
- Test with screen readers
- Handle focus management

## Debugging Tools
- React Developer Tools
- Performance profiler
- Network tab monitoring
- Error boundaries
- Console logging patterns

## Framework Integration
- Next.js considerations
- Vite configuration
- State management libraries
- Router implementations
