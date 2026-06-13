import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StationsLoader } from '../StationsLoader';
import { useStore } from '../../../store/store';

beforeEach(() => {
  useStore.setState({ isDarkMode: true });
});

describe('StationsLoader', () => {
  it('renders the loading text', () => {
    render(<StationsLoader />);
    expect(screen.getByText('טוען תחנות...')).toBeInTheDocument();
  });

  it('applies dark mode styles', () => {
    useStore.setState({ isDarkMode: true });
    render(<StationsLoader />);
    expect(screen.getByText('טוען תחנות...').className).toContain('text-white/40');
  });

  it('applies light mode styles', () => {
    useStore.setState({ isDarkMode: false });
    render(<StationsLoader />);
    expect(screen.getByText('טוען תחנות...').className).toContain('text-gray-400');
  });
});
