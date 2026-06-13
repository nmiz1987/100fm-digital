import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CarHeader } from '../CarHeader';

describe('CarHeader', () => {
  it('renders the title', () => {
    render(<CarHeader darkMode={true} onExit={vi.fn()} />);
    expect(screen.getByText('מצב רכב')).toBeInTheDocument();
  });

  it('renders the exit button when onBack is not provided', () => {
    render(<CarHeader darkMode={true} onExit={vi.fn()} />);
    expect(screen.getByLabelText('יציאה ממצב רכב')).toBeInTheDocument();
    expect(screen.queryByLabelText('חזרה לרשימת התחנות')).not.toBeInTheDocument();
  });

  it('calls onExit when the exit button is clicked', () => {
    const onExit = vi.fn();
    render(<CarHeader darkMode={true} onExit={onExit} />);
    fireEvent.click(screen.getByLabelText('יציאה ממצב רכב'));
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('renders the back button when onBack is provided', () => {
    render(<CarHeader darkMode={true} onExit={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByLabelText('חזרה לרשימת התחנות')).toBeInTheDocument();
    expect(screen.queryByLabelText('יציאה ממצב רכב')).not.toBeInTheDocument();
  });

  it('calls onBack when the back button is clicked', () => {
    const onBack = vi.fn();
    render(<CarHeader darkMode={true} onExit={vi.fn()} onBack={onBack} />);
    fireEvent.click(screen.getByLabelText('חזרה לרשימת התחנות'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('applies dark mode styles', () => {
    render(<CarHeader darkMode={true} onExit={vi.fn()} />);
    expect(screen.getByRole('banner').className).toContain('bg-[#0f0f0f]');
  });

  it('applies light mode styles', () => {
    render(<CarHeader darkMode={false} onExit={vi.fn()} />);
    expect(screen.getByRole('banner').className).toContain('bg-white');
  });
});
