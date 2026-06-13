import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VolumeSlider } from '../VolumeSlider';
import { useStore } from '../../../store/store';

beforeEach(() => {
  useStore.setState({ isDarkMode: true, volume: 0.8 });
});

describe('VolumeSlider', () => {
  it('renders a range input with the current volume', () => {
    render(<VolumeSlider />);
    expect(screen.getByTitle('ווליום')).toHaveValue('0.8');
  });

  it('updates the store volume when changed', () => {
    render(<VolumeSlider />);
    fireEvent.change(screen.getByTitle('ווליום'), { target: { value: '0.5' } });
    expect(useStore.getState().volume).toBe(0.5);
  });

  it('shows the muted icon at volume 0', () => {
    useStore.setState({ volume: 0 });
    render(<VolumeSlider />);
    const svgLines = document.querySelectorAll('line[x1="23"]');
    expect(svgLines.length).toBeGreaterThan(0);
  });

  it('shows the low-volume icon below 0.5', () => {
    useStore.setState({ volume: 0.3 });
    render(<VolumeSlider />);
    const svgLines = document.querySelectorAll('line[x1="23"]');
    expect(svgLines.length).toBe(0);
    expect(document.querySelector('path[d="M15.54 8.46a5 5 0 0 1 0 7.07"]')).toBeInTheDocument();
  });

  it('shows the high-volume icon at or above 0.5', () => {
    useStore.setState({ volume: 0.8 });
    render(<VolumeSlider />);
    expect(document.querySelector('path[d="M19.07 4.93a10 10 0 0 1 0 14.14"]')).toBeInTheDocument();
  });

  it('renders in light mode without errors', () => {
    useStore.setState({ isDarkMode: false });
    const { container } = render(<VolumeSlider />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
