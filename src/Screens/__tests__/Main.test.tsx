import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Main } from '../Main';
import type { Station } from '../../types';
import { useStore } from '../../store/store';

const station: Station = {
  name: 'Rock FM',
  audio: 'http://stream/rock-fm',
  slug: 'rock-fm',
  logo: 'rock-fm.png',
};

beforeEach(() => {
  useStore.setState({
    isDarkMode: true,
    stations: [station],
    stationsLoading: false,
    tab: 'all',
    search: '',
    viewMode: 'grid',
    favorites: [],
    hidden: [],
    currentStation: null,
    currentSlider: null,
    sliderLabels: [],
    nowPlaying: null,
    isPlaying: false,
    isLoading: false,
    volume: 0.8,
    loadingTimeoutVisible: false,
  });
});

function renderMain() {
  return render(
    <MemoryRouter>
      <Main />
    </MemoryRouter>,
  );
}

describe('Main', () => {
  it('renders the header and station grid', () => {
    renderMain();
    expect(screen.getByPlaceholderText('חיפוש תחנה...')).toBeInTheDocument();
    expect(screen.getByText('Rock FM')).toBeInTheDocument();
  });

  it('shows the stations loader while stations are loading', () => {
    useStore.setState({ stationsLoading: true });
    renderMain();
    expect(screen.getByText('טוען תחנות...')).toBeInTheDocument();
    expect(screen.queryByText('Rock FM')).not.toBeInTheDocument();
  });

  it('does not render the player bar when there is no current station', () => {
    renderMain();
    expect(screen.getAllByText('Rock FM')).toHaveLength(1);
  });

  it('renders the player bar when there is a current station', () => {
    useStore.setState({ currentStation: station });
    renderMain();
    expect(screen.getAllByText('Rock FM').length).toBeGreaterThan(1);
  });

  it('shows the loading-timeout toast when visible', () => {
    useStore.setState({ loadingTimeoutVisible: true });
    renderMain();
    expect(screen.getByText('הטעינה אורכת זמן רב מהרגיל, ייתכן שיש בעיה בשידור')).toBeInTheDocument();
  });
});
