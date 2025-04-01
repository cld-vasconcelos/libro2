import { render, screen } from '../../test/utils/test-utils';
import StarRating from '../StarRating';
import { describe, it, expect } from 'vitest';

describe('StarRating', () => {
  it('renders correct number of stars', () => {
    render(<StarRating rating={3} />);
    const stars = screen.getAllByTestId('star');
    expect(stars).toHaveLength(5); // Default maxRating is 5
  });

  it('fills correct number of stars based on rating', () => {
    render(<StarRating rating={3} />);
    const stars = screen.getAllByTestId('star');
    
    // First 3 stars should be filled
    stars.slice(0, 3).forEach(star => {
      expect(star).toHaveClass('fill-book', 'text-book');
    });

    // Last 2 stars should be empty
    stars.slice(3).forEach(star => {
      expect(star).toHaveClass('fill-gray-100', 'text-gray-300');
    });
  });

  it('respects maxRating prop', () => {
    render(<StarRating rating={2} maxRating={3} />);
    const stars = screen.getAllByTestId('star');
    expect(stars).toHaveLength(3);
  });
});
