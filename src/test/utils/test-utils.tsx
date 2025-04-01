import { ReactElement } from 'react';
import { render as rtlRender } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

function render(ui: ReactElement) {
  return {
    user: userEvent.setup(),
    ...rtlRender(ui),
  };
}

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { render };
