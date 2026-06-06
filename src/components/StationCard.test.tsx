import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StationCard } from './StationCard'
import type { Station } from '../types'

const station: Station = {
  name: 'Rock FM',
  audio: 'http://stream',
  slug: 'rock-fm',
  logo: 'logo.png',
  description: 'Best rock music',
}

const defaultProps = {
  station,
  isPlaying: false,
  isActive: false,
  isFavorite: false,
  isHidden: false,
  darkMode: true,
  onPlay: vi.fn(),
  onToggleFavorite: vi.fn(),
  onToggleHide: vi.fn(),
}

describe('StationCard', () => {
  it('renders station name and description', () => {
    render(<StationCard {...defaultProps} />)
    expect(screen.getByText('Rock FM')).toBeInTheDocument()
    expect(screen.getByText('Best rock music')).toBeInTheDocument()
  })

  it('calls onPlay when card is clicked', () => {
    const onPlay = vi.fn()
    render(<StationCard {...defaultProps} onPlay={onPlay} />)
    fireEvent.click(screen.getByText('Rock FM'))
    expect(onPlay).toHaveBeenCalledTimes(1)
  })

  it('shows playing indicator when isActive and isPlaying', () => {
    render(<StationCard {...defaultProps} isActive isPlaying />)
    // Playing animation bars (4 divs with animate-pulse)
    const bars = document.querySelectorAll('.animate-pulse')
    expect(bars.length).toBe(4)
  })

  it('shows popular badge for popular stations', () => {
    const popularStation = { ...station, popular: 'true' }
    render(<StationCard {...defaultProps} station={popularStation} />)
    expect(screen.getByText('פופולרי')).toBeInTheDocument()
  })

  it('does not show popular badge for non-popular stations', () => {
    render(<StationCard {...defaultProps} />)
    expect(screen.queryByText('פופולרי')).not.toBeInTheDocument()
  })

  it('shows filled heart when isFavorite', () => {
    render(<StationCard {...defaultProps} isFavorite />)
    expect(screen.getByTitle('הסר ממועדפים')).toBeInTheDocument()
  })

  it('shows empty heart when not isFavorite', () => {
    render(<StationCard {...defaultProps} isFavorite={false} />)
    expect(screen.getByTitle('הוסף למועדפים')).toBeInTheDocument()
  })

  it('calls onToggleFavorite when favorite button is clicked', () => {
    const onToggleFavorite = vi.fn()
    render(<StationCard {...defaultProps} onToggleFavorite={onToggleFavorite} />)
    fireEvent.click(screen.getByTitle('הוסף למועדפים'))
    expect(onToggleFavorite).toHaveBeenCalledTimes(1)
  })

  it('calls onToggleHide when hide button is clicked', () => {
    const onToggleHide = vi.fn()
    render(<StationCard {...defaultProps} onToggleHide={onToggleHide} />)
    fireEvent.click(screen.getByTitle('הסתר תחנה'))
    expect(onToggleHide).toHaveBeenCalledTimes(1)
  })

  it('does not call onPlay when action buttons are clicked', () => {
    const onPlay = vi.fn()
    const onToggleFavorite = vi.fn()
    render(<StationCard {...defaultProps} onPlay={onPlay} onToggleFavorite={onToggleFavorite} />)
    fireEvent.click(screen.getByTitle('הוסף למועדפים'))
    expect(onPlay).not.toHaveBeenCalled()
  })
})
