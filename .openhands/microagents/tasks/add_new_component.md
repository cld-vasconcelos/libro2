# Add New React Component

Creates a new React component with TypeScript, styling, tests, and documentation following project standards.

## Trigger
"create component", "add new component", "generate component"

## Inputs
- Component name (required)
- Component type (optional: page/ui/feature, defaults to feature)
- Include styles (optional: yes/no, defaults to yes)
- Include tests (optional: yes/no, defaults to yes)

## Steps

1. Validate Component Name
- Check naming convention (PascalCase)
- Ensure unique name
- Validate path location

2. Create Component Structure
```bash
# Create component directory
mkdir -p src/components/{ComponentName}

# Create required files
touch src/components/{ComponentName}/{
  ComponentName.tsx,
  ComponentName.test.tsx,
  ComponentName.css
}
```

3. Generate Component Code

### Component Template
```typescript
import React from 'react';
import styles from './{ComponentName}.css';

interface {ComponentName}Props {
  // Add props here
}

export const {ComponentName}: React.FC<{ComponentName}Props> = ({
  // Destructure props
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
    // Add assertions
  });

  it('handles user interactions', async () => {
    const user = userEvent.setup();
    render(<{ComponentName} />);
    // Add interaction tests
  });
});
```

### CSS Template
```css
.container {
  /* Add component styles */
}
```

4. Update Exports
```typescript
// Update index.ts if needed
export * from './{ComponentName}';
```

5. Generate Documentation
```markdown
# {ComponentName}

## Overview
[Component description]

## Props
| Name | Type | Required | Description |
|------|------|----------|-------------|
| prop | type | yes/no   | description |

## Usage
\`\`\`tsx
import { {ComponentName} } from '@/components/{ComponentName}';

function Example() {
  return <{ComponentName} />;
}
\`\`\`

## Examples
[Add common usage examples]
```

## Validation

### Required Structure
```
ComponentName/
├── ComponentName.tsx
├── ComponentName.test.tsx
├── ComponentName.css
└── index.ts (optional)
```

### Code Standards
- TypeScript strict mode compliance
- Props interface defined
- Error boundaries included
- Accessibility features
- Proper event handling
- Memory leak prevention

### Testing Requirements
- Basic rendering test
- Props validation
- User interaction tests
- Edge cases covered
- Accessibility tests
- Integration tests if needed

## Examples

### Basic Component
```bash
# Create simple component
claude create component Button
```

### Page Component
```bash
# Create page component with routing
claude create component UserDashboard --type page
```

### UI Component
```bash
# Create UI component
claude create component TextField --type ui
```

### Feature Component
```bash
# Create complex feature component
claude create component BookingCalendar --type feature
```

## Best Practices

### Component Organization
- One component per file
- Related components grouped
- Shared components in ui/
- Pages in pages/
- Features in features/

### Props
- Document all props
- Use TypeScript interfaces
- Provide default values
- Validate required props

### State Management
- Use appropriate hooks
- Document state updates
- Handle side effects
- Clean up resources

### Styling
- Use CSS modules
- Follow BEM naming
- Support dark mode
- Handle responsive design

### Testing
- Test user interactions
- Test error states
- Test accessibility
- Test performance

### Documentation
- Clear component description
- Usage examples
- Props documentation
- Known limitations
- Breaking changes

## Notes
- Follows project architecture
- Maintains consistent style
- Ensures testability
- Promotes reusability
- Considers accessibility
- Supports maintainability
