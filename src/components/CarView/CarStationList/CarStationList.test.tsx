import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CarStationList } from './CarStationList'
import type { Station } from '../../../types'
import { useStore } from '../../../store/store'

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
  })
})

describe('CarStationList', () => {
  it('renders station names', () => {
    render(<MemoryRouter><CarStationList /></MemoryRouter>)
    expect(screen.getByText('Rock FM')).toBeInTheDocument()
    expect(screen.getByText('Jazz Club')).toBeInTheDocument()
  })

  it('renders station cover images with fallback to logo', () => {
    render(<MemoryRouter><CarStationList /></MemoryRouter>)
    expect(screen.getByAltText('Rock FM')).toHaveAttribute('src', 'rock-cover.png')
    expect(screen.getByAltText('Jazz Club')).toHaveAttribute('src', 'jazz-club-logo.png')
  })

  it('plays the station and navigates when clicked', () => {
    render(<MemoryRouter><CarStationList /></MemoryRouter>)
    fireEvent.click(screen.getByText('Rock FM'))
    expect(useStore.getState().currentStation).toEqual(stations[0])
  })

  it('highlights the active station', () => {
    useStore.setState({ currentStation: stations[1] })
    render(<MemoryRouter><CarStationList /></MemoryRouter>)
    const button = screen.getByText('Jazz Club').closest('button')
    expect(button?.className).toContain('ring-2')
  })

  it('shows loading state', () => {
    useStore.setState({ stationsLoading: true })
    render(<MemoryRouter><CarStationList /></MemoryRouter>)
    expect(screen.getByText('טוען תחנות...')).toBeInTheDocument()
  })

  it('shows empty state when no stations match', () => {
    useStore.setState({ stations: [] })
    render(<MemoryRouter><CarStationList /></MemoryRouter>)
    expect(screen.getByText('לא נמצאו תחנות')).toBeInTheDocument()
  })

  it('renders station names with larger text size', () => {
    render(<MemoryRouter><CarStationList /></MemoryRouter>)
    expect(screen.getByText('Rock FM').className).toContain('text-lg')
  })
})
