---
name: Add New Component
description: Creates a new React component with TypeScript, testing, and documentation
type: task
triggers: [create component, add new component, generate component]
author: OpenHands
version: 1.0.0
---

# React Component Generator

Creates standardized React components following project conventions.

## Usage

```bash
claude create component Button
claude create component UserDashboard --type page
claude create component TextField --type ui
```

## Process

1. Setup Component Files
```bash
# Create directory
mkdir -p src/components/{ComponentName}

# Create files
touch src/components/{ComponentName}/{
  ComponentName.tsx,
  ComponentName.test.tsx,
  ComponentName.css
}
```

2. Generate Component Code

### Component Template
```typescript
import React from 'react';
import styles from './{ComponentName}.css';

interface {ComponentName}Props {
  // Props here
}

export const {ComponentName}: React.FC<{ComponentName}Props> = ({
  // Props destructuring
}) => {
  return (
    <div className={styles.container}>
      {/* Component content */}
    </div>
  );
};

export default {ComponentName};
```

### Test Template
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { {ComponentName} } from './{ComponentName}';

describe('{ComponentName}', () => {
  it('renders correctly', () => {
    render(<{ComponentName} />);
    // Basic rendering test
  });

  it('handles user interactions', async () => {
    const user = userEvent.setup();
    render(<{ComponentName} />);
    // Interaction tests
  });
});
```

### CSS Template
```css
.container {
  /* Component styles */
}
```

## Validation

### Required Structure
```
ComponentName/
├── ComponentName.tsx
├── ComponentName.test.tsx
├── ComponentName.css
└── README.md (optional)
```

### Code Standards
- TypeScript strict mode
- Props interface
- Proper exports
- Error handling
- Accessibility

### Testing Requirements
- Basic render test
- Props validation
- User interactions
- Error states
- Integration tests

## Examples

### Basic Component
```bash
# UI element
claude create component Button
```

### Page Component
```bash
# Page with routing
claude create component Dashboard --type page
```

### Complex Component
```bash
# Feature with state
claude create component BookingCalendar --type feature
```

## Best Practices

### Component Design
- Single responsibility
- Props validation
- Error boundaries
- Loading states
- Proper types

### Testing
- User interactions
- Error handling
- Edge cases
- Accessibility
- Performance

### Documentation
- Clear description
- Props table
- Usage examples
- Breaking changes
- Dependencies
