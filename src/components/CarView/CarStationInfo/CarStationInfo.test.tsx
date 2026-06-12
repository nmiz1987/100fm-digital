import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CarStationInfo } from './CarStationInfo'
import type { Station, Slider } from '../../../types'
import type { usePlayer } from '../../../hooks/usePlayer'

const slider1: Slider = { audio: 'http://slider1' }

const makeStation = (slug: string, name: string, overrides: Partial<Station> = {}): Station => ({
  name,
  audio: `http://stream/${slug}`,
  slug,
  logo: `${slug}.png`,
  ...overrides,
})

const stationA = makeStation('a', 'Rock FM')
const stationB = makeStation('b', 'Jazz Club')
const stationWithSliders = makeStation('a', 'Rock FM', { sliders: [slider1] })

const filteredList = [stationA, stationB]

function makePlayer(overrides: Partial<ReturnType<typeof usePlayer>> = {}): ReturnType<typeof usePlayer> {
  return {
    currentStation: stationA,
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
  station: stationA,
  filteredList,
  darkMode: true,
  player: makePlayer(),
  nowPlaying: null,
  sliderLabels: [] as string[],
  favorites: [] as string[],
  handlePlay: vi.fn(),
  handlePlayPause: vi.fn(),
  handleSelectSlider: vi.fn(),
  handleSelectLive: vi.fn(),
  handleToggleFavorite: vi.fn(),
  onNavigate: vi.fn(),
}

describe('CarStationInfo', () => {
  it('renders the station name', () => {
    render(<CarStationInfo {...defaultProps} />)
    expect(screen.getByText('Rock FM')).toBeInTheDocument()
  })

  it('renders now playing info when active', () => {
    render(<CarStationInfo {...defaultProps} nowPlaying={{ artist: 'Radiohead', name: 'Creep', timestamp: 0, before: 0 }} />)
    expect(screen.getByText('Radiohead — Creep')).toBeInTheDocument()
  })

  it('shows play icon when paused', () => {
    render(<CarStationInfo {...defaultProps} player={makePlayer({ isPlaying: false })} />)
    expect(screen.getByLabelText('נגן')).toBeInTheDocument()
  })

  it('shows pause icon when playing', () => {
    render(<CarStationInfo {...defaultProps} player={makePlayer({ isPlaying: true })} />)
    expect(screen.getByLabelText('השהה')).toBeInTheDocument()
  })

  it('calls handlePlayPause when play/pause clicked for the active station', () => {
    const handlePlayPause = vi.fn()
    render(<CarStationInfo {...defaultProps} player={makePlayer({ isPlaying: true })} handlePlayPause={handlePlayPause} />)
    fireEvent.click(screen.getByLabelText('השהה'))
    expect(handlePlayPause).toHaveBeenCalledTimes(1)
  })

  it('calls handlePlay when play clicked for a non-active station', () => {
    const handlePlay = vi.fn()
    render(<CarStationInfo {...defaultProps} player={makePlayer({ currentStation: stationB })} handlePlay={handlePlay} />)
    fireEvent.click(screen.getByLabelText('נגן'))
    expect(handlePlay).toHaveBeenCalledWith(stationA)
  })

  it('shows filled heart and toggles favorite', () => {
    const handleToggleFavorite = vi.fn()
    render(<CarStationInfo {...defaultProps} favorites={['a']} handleToggleFavorite={handleToggleFavorite} />)
    const favButton = screen.getByLabelText('הסר ממועדפים')
    expect(favButton).toHaveTextContent('♥')
    fireEvent.click(favButton)
    expect(handleToggleFavorite).toHaveBeenCalledWith('a')
  })

  it('shows empty heart when not favorite', () => {
    render(<CarStationInfo {...defaultProps} favorites={[]} />)
    expect(screen.getByLabelText('הוסף למועדפים')).toHaveTextContent('♡')
  })

  it('calls goNext/goPrev (play + navigate) when next/prev clicked', () => {
    const handlePlay = vi.fn()
    const onNavigate = vi.fn()
    render(<CarStationInfo {...defaultProps} handlePlay={handlePlay} onNavigate={onNavigate} />)

    fireEvent.click(screen.getByLabelText('תחנה הבאה'))
    expect(handlePlay).toHaveBeenCalledWith(stationB)
    expect(onNavigate).toHaveBeenCalledWith(stationB)
  })

  it('disables next/prev when there is only one station', () => {
    render(<CarStationInfo {...defaultProps} filteredList={[stationA]} />)
    expect(screen.getByLabelText('תחנה הבאה')).toBeDisabled()
    expect(screen.getByLabelText('תחנה קודמת')).toBeDisabled()
  })

  it('renders the slider list when the station has sliders', () => {
    render(<CarStationInfo {...defaultProps} station={stationWithSliders} sliderLabels={['Live', 'Slider 1']} />)
    expect(screen.getByRole('button', { name: 'Live' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Slider 1' })).toBeInTheDocument()
  })

  it('does not render the slider list when the station has no sliders', () => {
    render(<CarStationInfo {...defaultProps} />)
    expect(screen.queryByRole('button', { name: 'Rock FM #1' })).not.toBeInTheDocument()
  })

  it('calls handleSelectSlider when a slider is selected for the active station', () => {
    const handleSelectSlider = vi.fn()
    render(
      <CarStationInfo
        {...defaultProps}
        station={stationWithSliders}
        sliderLabels={['Live', 'Slider 1']}
        handleSelectSlider={handleSelectSlider}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Slider 1' }))
    expect(handleSelectSlider).toHaveBeenCalledWith(slider1)
  })
})
