import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SliderTabs } from '../SliderTabs';
import type { Station, Slider } from '../../../types';
import { useStore } from '../../../store/store';

const slider1: Slider = { audio: 'http://slider1' };
const slider2: Slider = { audio: 'http://slider2' };

const station: Station = {
  name: 'Rock FM',
  audio: 'http://stream',
  slug: 'rock-fm',
  logo: 'logo.png',
  sliders: [slider1, slider2],
};

beforeEach(() => {
  useStore.setState({
    isDarkMode: true,
    currentStation: station,
    currentSlider: null,
    sliderLabels: [],
  });
});

describe('SliderTabs', () => {
  it('renders the live tab and one tab per slider', () => {
    useStore.setState({ sliderLabels: ['Live Now', 'S1', 'S2'] });
    render(<SliderTabs station={station} />);
    expect(screen.getByRole('button', { name: 'Live Now' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'S1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'S2' })).toBeInTheDocument();
  });

  it('uses fallback labels when sliderLabels is empty', () => {
    render(<SliderTabs station={station} />);
    expect(screen.getByRole('button', { name: 'Rock FM #1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rock FM #2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rock FM #3' })).toBeInTheDocument();
  });

  it('marks the live tab active when there is no current slider', () => {
    useStore.setState({ sliderLabels: ['Live Now', 'S1', 'S2'] });
    render(<SliderTabs station={station} />);
    expect(screen.getByRole('button', { name: 'Live Now' }).className).toContain('bg-[#e8192c]');
  });

  it('marks the matching slider tab active', () => {
    useStore.setState({ sliderLabels: ['Live Now', 'S1', 'S2'], currentSlider: slider1 });
    render(<SliderTabs station={station} />);
    expect(screen.getByRole('button', { name: 'S1' }).className).toContain('bg-[#e8192c]');
    expect(screen.getByRole('button', { name: 'Live Now' }).className).not.toContain('bg-[#e8192c]');
  });

  it('returns to live playback when the live tab is clicked', () => {
    useStore.setState({ sliderLabels: ['Live Now', 'S1', 'S2'], currentSlider: slider1 });
    render(<SliderTabs station={station} />);
    fireEvent.click(screen.getByRole('button', { name: 'Live Now' }));
    expect(useStore.getState().currentSlider).toBeNull();
  });

  it('selects a slider when its tab is clicked', () => {
    useStore.setState({ sliderLabels: ['Live Now', 'S1', 'S2'] });
    render(<SliderTabs station={station} />);
    fireEvent.click(screen.getByRole('button', { name: 'S1' }));
    expect(useStore.getState().currentSlider).toEqual(slider1);
  });

  it('renders in light mode without errors', () => {
    useStore.setState({ isDarkMode: false });
    const { container } = render(<SliderTabs station={station} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
