import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { CarApp } from '../CarApp';
import type { Station } from '../../types';
import { useStore } from '../../store/store';

const makeStation = (slug: string, name: string): Station => ({
  name,
  audio: `http://stream/${slug}`,
  slug,
  logo: `${slug}.png`,
});

const stationA = makeStation('rock-fm', 'Rock FM');
const stationB = makeStation('jazz-club', 'Jazz Club');
const stations = [stationA, stationB];

beforeEach(() => {
  useStore.setState({
    isDarkMode: true,
    stations,
    stationsLoading: false,
    tab: 'all',
    search: '',
    favorites: [],
    hidden: [],
    currentStation: null,
    currentSlider: null,
    isPlaying: false,
    isLoading: false,
    nowPlaying: null,
    sliderLabels: [],
  });
});

function renderCarApp(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/car" element={<CarApp />} />
        <Route path="/car/:slug" element={<CarApp />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('CarApp', () => {
  it('renders the station list at /car', () => {
    renderCarApp('/car');
    expect(screen.getByText('Rock FM')).toBeInTheDocument();
    expect(screen.getByText('Jazz Club')).toBeInTheDocument();
  });

  it('renders station info at /car/:slug', () => {
    renderCarApp('/car/rock-fm');
    expect(screen.getByText('Rock FM')).toBeInTheDocument();
    expect(screen.queryByText('Jazz Club')).not.toBeInTheDocument();
  });

  it('shows a not-found message for an unknown slug', () => {
    renderCarApp('/car/unknown-slug');
    expect(screen.getByText('התחנה לא נמצאה')).toBeInTheDocument();
  });

  it('navigates back to the station list from the not-found screen', () => {
    renderCarApp('/car/unknown-slug');
    fireEvent.click(screen.getByText('חזרה לרשימת התחנות'));
    expect(screen.getByText('Rock FM')).toBeInTheDocument();
    expect(screen.getByText('Jazz Club')).toBeInTheDocument();
  });

  it('renders nothing besides the header for an unknown slug while stations are loading', () => {
    useStore.setState({ stationsLoading: true });
    const { container } = renderCarApp('/car/unknown-slug');
    expect(screen.queryByText('התחנה לא נמצאה')).not.toBeInTheDocument();
    expect(container.querySelector('.car-mode')?.children).toHaveLength(1);
  });

  it('shows the exit button at /car and navigates home when clicked', () => {
    renderCarApp('/car');
    expect(screen.queryByLabelText('חזרה לרשימת התחנות')).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('יציאה ממצב רכב'));
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('shows the back button at /car/:slug and navigates to the list when clicked', () => {
    renderCarApp('/car/rock-fm');
    expect(screen.queryByLabelText('יציאה ממצב רכב')).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('חזרה לרשימת התחנות'));
    expect(screen.getByText('Jazz Club')).toBeInTheDocument();
  });

  it('applies dark mode styles', () => {
    const { container } = renderCarApp('/car');
    expect(container.querySelector('.car-mode')?.className).toContain('bg-[#0f0f0f]');
  });

  it('applies light mode styles', () => {
    useStore.setState({ isDarkMode: false });
    const { container } = renderCarApp('/car');
    expect(container.querySelector('.car-mode')?.className).toContain('bg-gray-50');
  });
});
