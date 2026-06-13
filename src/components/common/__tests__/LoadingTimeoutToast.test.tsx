import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoadingTimeoutToast } from '../LoadingTimeoutToast';
import { useStore } from '../../../store/store';

beforeEach(() => {
  useStore.setState({
    isDarkMode: true,
    loadingTimeoutVisible: false,
  });
});

describe('LoadingTimeoutToast', () => {
  it('renders nothing when not visible', () => {
    const { container } = render(<LoadingTimeoutToast />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the message when visible', () => {
    useStore.setState({ loadingTimeoutVisible: true });
    render(<LoadingTimeoutToast />);
    expect(screen.getByText('הטעינה אורכת זמן רב מהרגיל, ייתכן שיש בעיה בשידור')).toBeInTheDocument();
  });

  it('calls dismissLoadingTimeout when clicked', () => {
    useStore.setState({ loadingTimeoutVisible: true });
    render(<LoadingTimeoutToast />);
    fireEvent.click(screen.getByRole('button'));
    expect(useStore.getState().loadingTimeoutVisible).toBe(false);
  });

  it('applies dark mode styles', () => {
    useStore.setState({ loadingTimeoutVisible: true, isDarkMode: true });
    render(<LoadingTimeoutToast />);
    expect(screen.getByRole('button').className).toContain('bg-[#1a1a1a]/95');
  });

  it('applies light mode styles', () => {
    useStore.setState({ loadingTimeoutVisible: true, isDarkMode: false });
    render(<LoadingTimeoutToast />);
    expect(screen.getByRole('button').className).toContain('bg-white/95');
  });
});
