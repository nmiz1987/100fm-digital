import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CarStationList } from './CarStationList'
import type { Station } from '../../../types'

const makeStation = (slug: string, name: string, overrides: Partial<Station> = {}): Station => ({
  name,
  audio: `http://stream/${slug}`,
  slug,
  logo: `${slug}-logo.png`,
  ...overrides,
})

const stations: Station[] = [
  makeStation('rock-fm', 'Rock FM', { cover: 'rock-cover.png' }),
  makeStation('jazz-club', 'Jazz Club'),
]

const defaultProps = {
  stations,
  loading: false,
  darkMode: true,
  activeSlug: null,
  onSelect: vi.fn(),
}

describe('CarStationList', () => {
  it('renders station names', () => {
    render(<CarStationList {...defaultProps} />)
    expect(screen.getByText('Rock FM')).toBeInTheDocument()
    expect(screen.getByText('Jazz Club')).toBeInTheDocument()
  })

  it('renders station cover images with fallback to logo', () => {
    render(<CarStationList {...defaultProps} />)
    expect(screen.getByAltText('Rock FM')).toHaveAttribute('src', 'rock-cover.png')
    expect(screen.getByAltText('Jazz Club')).toHaveAttribute('src', 'jazz-club-logo.png')
  })

  it('calls onSelect with the station when clicked', () => {
    const onSelect = vi.fn()
    render(<CarStationList {...defaultProps} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Rock FM'))
    expect(onSelect).toHaveBeenCalledWith(stations[0])
  })

  it('highlights the active station', () => {
    render(<CarStationList {...defaultProps} activeSlug="jazz-club" />)
    const button = screen.getByText('Jazz Club').closest('button')
    expect(button?.className).toContain('ring-2')
  })

  it('shows loading state', () => {
    render(<CarStationList {...defaultProps} loading={true} />)
    expect(screen.getByText('טוען תחנות...')).toBeInTheDocument()
  })

  it('shows empty state when no stations match', () => {
    render(<CarStationList {...defaultProps} stations={[]} />)
    expect(screen.getByText('לא נמצאו תחנות')).toBeInTheDocument()
  })

  it('renders station names with larger text size', () => {
    render(<CarStationList {...defaultProps} />)
    expect(screen.getByText('Rock FM').className).toContain('text-lg')
  })
})
