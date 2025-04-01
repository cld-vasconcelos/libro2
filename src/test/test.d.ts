import '@testing-library/jest-dom';

declare global {
  namespace Vi {
    interface JestMatchers<T> {
      toBeInTheDocument(): T;
      toHaveClass(...classNames: string[]): T;
      toHaveAttribute(attr: string, value?: string): T;
    }
  }
}
