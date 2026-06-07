import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NowPlayingScreen } from './NowPlayingScreen';
import type { Station, Slider } from '../types';

const slider1: Slider = { audio: 'http://slider1' };
const slider2: Slider = { audio: 'http://slider2' };

const station: Station = {
  name: 'Rock FM',
  audio: 'http://stream.mp3',
  slug: 'rock-fm',
  logo: 'logo.png',
};

const stationWithSliders: Station = { ...station, sliders: [slider1, slider2] };

const defaultProps = {
  open: true,
  station,
  currentSlider: null as Slider | null,
  sliderLabels: [] as string[],
  nowPlaying: null,
  isPlaying: false,
  isLoading: false,
  isFavorite: false,
  darkMode: true,
  onClose: vi.fn(),
  onPlayPause: vi.fn(),
  onToggleFavorite: vi.fn(),
  onDarkModeToggle: vi.fn(),
  onSelectLive: vi.fn(),
  onSelectSlider: vi.fn(),
};

describe('NowPlayingScreen', () => {
  it('renders station name and cover image', () => {
    render(<NowPlayingScreen {...defaultProps} />);
    expect(screen.getByText('Rock FM')).toBeInTheDocument();
    expect(screen.getByAltText('Rock FM')).toBeInTheDocument();
  });

  it('shows now playing track line when available', () => {
    render(<NowPlayingScreen {...defaultProps} nowPlaying={{ artist: 'Radiohead', name: 'Creep', timestamp: 0, before: 0 }} />);
    expect(screen.getByText('Radiohead — Creep')).toBeInTheDocument();
  });

  it('shows play icon when not playing and pause icon when playing', () => {
    const { rerender } = render(<NowPlayingScreen {...defaultProps} isPlaying={false} />);
    expect(screen.getByTitle('נגן')).toBeInTheDocument();

    rerender(<NowPlayingScreen {...defaultProps} isPlaying={true} />);
    expect(screen.getByTitle('השהה')).toBeInTheDocument();
  });

  it('calls onPlayPause when the play/pause button is clicked', () => {
    const onPlayPause = vi.fn();
    render(<NowPlayingScreen {...defaultProps} onPlayPause={onPlayPause} />);
    fireEvent.click(screen.getByTitle('נגן'));
    expect(onPlayPause).toHaveBeenCalledTimes(1);
  });

  it('shows filled heart when isFavorite and calls onToggleFavorite on click', () => {
    const onToggleFavorite = vi.fn();
    render(<NowPlayingScreen {...defaultProps} isFavorite={true} onToggleFavorite={onToggleFavorite} />);
    const heart = screen.getByTitle('הסר ממועדפים');
    expect(heart).toBeInTheDocument();
    fireEvent.click(heart);
    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
  });

  it('calls onDarkModeToggle when the theme button is clicked', () => {
    const onDarkModeToggle = vi.fn();
    render(<NowPlayingScreen {...defaultProps} onDarkModeToggle={onDarkModeToggle} />);
    fireEvent.click(screen.getByTitle('מצב בהיר'));
    expect(onDarkModeToggle).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the back button is clicked', () => {
    const onClose = vi.fn();
    render(<NowPlayingScreen {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByTitle('חזרה למסך הראשי'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders slider pills and calls onSelectLive / onSelectSlider', () => {
    const onSelectLive = vi.fn();
    const onSelectSlider = vi.fn();
    render(
      <NowPlayingScreen
        {...defaultProps}
        station={stationWithSliders}
        sliderLabels={['Live label', 'Slider label']}
        onSelectLive={onSelectLive}
        onSelectSlider={onSelectSlider}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Rock FM #1' }));
    expect(onSelectLive).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Slider label' }));
    expect(onSelectSlider).toHaveBeenCalledWith(slider2);
  });

  it('does not render slider pills when the station has none', () => {
    render(<NowPlayingScreen {...defaultProps} />);
    expect(screen.queryByText('Rock FM #1')).not.toBeInTheDocument();
  });

  it('applies open vs. closed transform/opacity classes based on the open prop', () => {
    const { container, rerender } = render(<NowPlayingScreen {...defaultProps} open={true} />);
    expect(container.firstChild).toHaveClass('translate-y-0', 'opacity-100');

    rerender(<NowPlayingScreen {...defaultProps} open={false} />);
    expect(container.firstChild).toHaveClass('translate-y-full', 'opacity-0', 'pointer-events-none');
  });
});
