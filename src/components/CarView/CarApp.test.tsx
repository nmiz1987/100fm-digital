import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { CarApp } from './CarApp'
import type { Station } from '../../types'
import { useStore } from '../../store/store'

const makeStation = (slug: string, name: string, overrides: Partial<Station> = {}): Station => ({
  name,
  audio: `http://stream/${slug}`,
  slug,
  logo: `${slug}.png`,
  ...overrides,
})

const stations: Station[] = [makeStation('rock-fm', 'Rock FM'), makeStation('jazz-club', 'Jazz Club')]

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
  })
})

function renderCarApp(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/car" element={<CarApp />} />
        <Route path="/car/:slug" element={<CarApp />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('CarApp', () => {
  it('renders the station list at /car', () => {
    renderCarApp('/car')
    expect(screen.getByText('Rock FM')).toBeInTheDocument()
    expect(screen.getByText('Jazz Club')).toBeInTheDocument()
  })

  it('renders station info at /car/[slug]', () => {
    renderCarApp('/car/rock-fm')
    expect(screen.getByText('Rock FM')).toBeInTheDocument()
    expect(screen.queryByText('Jazz Club')).not.toBeInTheDocument()
  })

  it('shows a not-found message for an unknown slug', () => {
    renderCarApp('/car/unknown-slug')
    expect(screen.getByText('התחנה לא נמצאה')).toBeInTheDocument()
  })

  it('plays and navigates when a station is selected from the list', () => {
    renderCarApp('/car')

    fireEvent.click(screen.getByText('Rock FM'))

    expect(useStore.getState().currentStation).toEqual(stations[0])
    expect(screen.getByLabelText('חזרה לרשימת התחנות')).toBeInTheDocument()
    expect(screen.queryByText('Jazz Club')).not.toBeInTheDocument()
  })

  it('navigates to / when the exit button is clicked', () => {
    renderCarApp('/car')

    fireEvent.click(screen.getByLabelText('יציאה ממצב רכב'))

    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('navigates to /car when the back button is clicked from station info', () => {
    renderCarApp('/car/rock-fm')

    expect(screen.queryByLabelText('יציאה ממצב רכב')).not.toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('חזרה לרשימת התחנות'))

    expect(screen.getByText('Jazz Club')).toBeInTheDocument()
  })

  it('respects the active tab/search filter for the station list', () => {
    useStore.setState({ search: 'jazz' })
    renderCarApp('/car')
    expect(screen.queryByText('Rock FM')).not.toBeInTheDocument()
    expect(screen.getByText('Jazz Club')).toBeInTheDocument()
  })
})
