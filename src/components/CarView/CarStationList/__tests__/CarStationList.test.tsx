import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CarStationList } from '../CarStationList'
import type { Station } from '../../../../types'
import { useStore } from '../../../../store/store'

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
  it('renders an item for each station', () => {
    render(<MemoryRouter><CarStationList /></MemoryRouter>)
    expect(screen.getByText('Rock FM')).toBeInTheDocument()
    expect(screen.getByText('Jazz Club')).toBeInTheDocument()
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

  it('respects the active tab/search filter', () => {
    useStore.setState({ search: 'jazz' })
    render(<MemoryRouter><CarStationList /></MemoryRouter>)
    expect(screen.queryByText('Rock FM')).not.toBeInTheDocument()
    expect(screen.getByText('Jazz Club')).toBeInTheDocument()
  })
})
