import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StationCard } from '../StationCard'
import type { Station } from '../../../types'
import { useStore } from '../../../store/store'

const station: Station = {
  name: 'Rock FM',
  audio: 'http://stream',
  slug: 'rock-fm',
  logo: 'logo.png',
  description: 'Best rock music',
}

beforeEach(() => {
  useStore.setState({
    isDarkMode: true,
    currentStation: null,
    isPlaying: false,
    favorites: [],
    hidden: [],
  })
})

describe('StationCard', () => {
  it('renders station name and description', () => {
    render(<StationCard station={station} />)
    expect(screen.getByText('Rock FM')).toBeInTheDocument()
    expect(screen.getByText('Best rock music')).toBeInTheDocument()
  })

  it('calls handlePlay when card is clicked', () => {
    render(<StationCard station={station} />)
    fireEvent.click(screen.getByText('Rock FM'))
    expect(useStore.getState().currentStation).toEqual(station)
  })

  it('shows playing indicator when active and playing', () => {
    useStore.setState({ currentStation: station, isPlaying: true })
    render(<StationCard station={station} />)
    const bars = document.querySelectorAll('.animate-pulse')
    expect(bars.length).toBe(4)
  })

  it('shows popular badge for popular stations', () => {
    const popularStation = { ...station, popular: 'true' }
    render(<StationCard station={popularStation} />)
    expect(screen.getByText('פופולרי')).toBeInTheDocument()
  })

  it('does not show popular badge for non-popular stations', () => {
    render(<StationCard station={station} />)
    expect(screen.queryByText('פופולרי')).not.toBeInTheDocument()
  })

  it('shows filled heart when favorite', () => {
    useStore.setState({ favorites: [station.slug] })
    render(<StationCard station={station} />)
    expect(screen.getByTitle('הסר ממועדפים')).toBeInTheDocument()
  })

  it('shows empty heart when not favorite', () => {
    render(<StationCard station={station} />)
    expect(screen.getByTitle('הוסף למועדפים')).toBeInTheDocument()
  })

  it('toggles favorite when favorite button is clicked', () => {
    render(<StationCard station={station} />)
    fireEvent.click(screen.getByTitle('הוסף למועדפים'))
    expect(useStore.getState().favorites).toEqual([station.slug])
  })

  it('toggles hidden when hide button is clicked', () => {
    render(<StationCard station={station} />)
    fireEvent.click(screen.getByTitle('הסתר תחנה'))
    expect(useStore.getState().hidden).toEqual([station.slug])
  })

  it('does not call handlePlay when action buttons are clicked', () => {
    render(<StationCard station={station} />)
    fireEvent.click(screen.getByTitle('הוסף למועדפים'))
    expect(useStore.getState().currentStation).toBeNull()
  })

  it('hides favorite button when station is hidden', () => {
    useStore.setState({ hidden: [station.slug] })
    render(<StationCard station={station} />)
    expect(screen.queryByTitle('הוסף למועדפים')).not.toBeInTheDocument()
    expect(screen.queryByTitle('הסר ממועדפים')).not.toBeInTheDocument()
  })

  it('shows unhide button when station is hidden', () => {
    useStore.setState({ hidden: [station.slug] })
    render(<StationCard station={station} />)
    expect(screen.getByTitle('הצג תחנה')).toBeInTheDocument()
  })

  it('shows paused overlay (play button) when active but not playing', () => {
    useStore.setState({ currentStation: station, isPlaying: false })
    render(<StationCard station={station} />)
    const plays = screen.getAllByText('▶')
    expect(plays.length).toBeGreaterThan(0)
  })

  it('renders in list view mode', () => {
    render(<StationCard station={station} viewMode="list" />)
    expect(screen.getByText('Rock FM')).toBeInTheDocument()
    expect(screen.getByText('Best rock music')).toBeInTheDocument()
  })
})
