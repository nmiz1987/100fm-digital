import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CarStationListItem } from './CarStationListItem'
import type { Station } from '../../../../types'
import { useStore } from '../../../../store/store'

const station: Station = {
  name: 'Rock FM',
  audio: 'http://stream/rock-fm',
  slug: 'rock-fm',
  logo: 'rock-fm-logo.png',
  cover: 'rock-cover.png',
}

function renderItem(s: Station = station) {
  return render(
    <MemoryRouter>
      <ul>
        <CarStationListItem station={s} />
      </ul>
    </MemoryRouter>
  )
}

beforeEach(() => {
  useStore.setState({
    isDarkMode: true,
    currentStation: null,
  })
})

describe('CarStationListItem', () => {
  it('renders the station name', () => {
    renderItem()
    expect(screen.getByText('Rock FM')).toBeInTheDocument()
  })

  it('renders the cover image with fallback to logo', () => {
    renderItem()
    expect(screen.getByAltText('Rock FM')).toHaveAttribute('src', 'rock-cover.png')
  })

  it('falls back to the logo when no cover is set', () => {
    renderItem({ ...station, cover: undefined })
    expect(screen.getByAltText('Rock FM')).toHaveAttribute('src', 'rock-fm-logo.png')
  })

  it('plays the station and navigates when clicked', () => {
    renderItem()
    fireEvent.click(screen.getByText('Rock FM'))
    expect(useStore.getState().currentStation).toEqual(station)
  })

  it('highlights the station when it is active', () => {
    useStore.setState({ currentStation: station })
    renderItem()
    const button = screen.getByText('Rock FM').closest('button')
    expect(button?.className).toContain('ring-2')
  })

  it('does not highlight the station when it is not active', () => {
    renderItem()
    const button = screen.getByText('Rock FM').closest('button')
    expect(button?.className).not.toContain('ring-2')
  })

  it('renders the station name with larger text size', () => {
    renderItem()
    expect(screen.getByText('Rock FM').className).toContain('text-lg')
  })

  it('renders in light mode without errors', () => {
    useStore.setState({ isDarkMode: false })
    const { container } = renderItem()
    expect(container.firstChild).toBeInTheDocument()
  })
})
