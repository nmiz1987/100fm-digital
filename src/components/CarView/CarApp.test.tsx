import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CarApp } from './CarApp'
import type { Station } from '../../types'
import type { usePlayer } from '../../hooks/usePlayer'

const makeStation = (slug: string, name: string, overrides: Partial<Station> = {}): Station => ({
  name,
  audio: `http://stream/${slug}`,
  slug,
  logo: `${slug}.png`,
  ...overrides,
})

const stations: Station[] = [makeStation('rock-fm', 'Rock FM'), makeStation('jazz-club', 'Jazz Club')]

function makePlayer(overrides: Partial<ReturnType<typeof usePlayer>> = {}): ReturnType<typeof usePlayer> {
  return {
    currentStation: null,
    currentSlider: null,
    isPlaying: false,
    isLoading: false,
    volume: 0.8,
    play: vi.fn(),
    playSlider: vi.fn(),
    playLive: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    stop: vi.fn(),
    setVolume: vi.fn(),
    ...overrides,
  }
}

const defaultProps = {
  pathname: '/car',
  navigate: vi.fn(),
  darkMode: true,
  stations,
  loading: false,
  tab: 'all' as const,
  search: '',
  favorites: [] as string[],
  hidden: [] as string[],
  player: makePlayer(),
  nowPlaying: null,
  sliderLabels: [] as string[],
  handlePlay: vi.fn(),
  handlePlayPause: vi.fn(),
  handleSelectSlider: vi.fn(),
  handleSelectLive: vi.fn(),
  handleToggleFavorite: vi.fn(),
}

describe('CarApp', () => {
  it('renders the station list at /car', () => {
    render(<CarApp {...defaultProps} pathname="/car" />)
    expect(screen.getByText('Rock FM')).toBeInTheDocument()
    expect(screen.getByText('Jazz Club')).toBeInTheDocument()
  })

  it('renders station info at /car/[slug]', () => {
    render(<CarApp {...defaultProps} pathname="/car/rock-fm" />)
    expect(screen.getByText('Rock FM')).toBeInTheDocument()
    expect(screen.queryByText('Jazz Club')).not.toBeInTheDocument()
  })

  it('shows a not-found message for an unknown slug', () => {
    render(<CarApp {...defaultProps} pathname="/car/unknown-slug" />)
    expect(screen.getByText('התחנה לא נמצאה')).toBeInTheDocument()
  })

  it('plays and navigates when a station is selected from the list', () => {
    const handlePlay = vi.fn()
    const navigate = vi.fn()
    render(<CarApp {...defaultProps} pathname="/car" handlePlay={handlePlay} navigate={navigate} />)

    fireEvent.click(screen.getByText('Rock FM'))

    expect(handlePlay).toHaveBeenCalledWith(stations[0])
    expect(navigate).toHaveBeenCalledWith('/car/rock-fm')
  })

  it('navigates to / when the exit button is clicked', () => {
    const navigate = vi.fn()
    render(<CarApp {...defaultProps} pathname="/car" navigate={navigate} />)

    fireEvent.click(screen.getByLabelText('יציאה ממצב רכב'))

    expect(navigate).toHaveBeenCalledWith('/')
  })

  it('navigates to /car when the back button is clicked from station info', () => {
    const navigate = vi.fn()
    render(<CarApp {...defaultProps} pathname="/car/rock-fm" navigate={navigate} />)

    expect(screen.queryByLabelText('יציאה ממצב רכב')).not.toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('חזרה לרשימת התחנות'))

    expect(navigate).toHaveBeenCalledWith('/car')
  })

  it('respects the active tab/search filter for the station list', () => {
    render(<CarApp {...defaultProps} pathname="/car" search="jazz" />)
    expect(screen.queryByText('Rock FM')).not.toBeInTheDocument()
    expect(screen.getByText('Jazz Club')).toBeInTheDocument()
  })
})
