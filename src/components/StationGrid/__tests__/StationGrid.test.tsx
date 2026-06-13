import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StationGrid } from '../StationGrid'
import type { Station } from '../../../types'
import { useStore } from '../../../store/store'

const makeStation = (slug: string, name: string, overrides: Partial<Station> = {}): Station => ({
  name,
  audio: `http://stream/${slug}`,
  slug,
  logo: `${slug}.png`,
  ...overrides,
})

const stations: Station[] = [
  makeStation('rock-fm', 'Rock FM', { popular: 'true' }),
  makeStation('jazz-club', 'Jazz Club'),
  makeStation('pop-hits', 'Pop Hits', { popular: 'true' }),
  makeStation('classical', 'Classical Radio'),
]

beforeEach(() => {
  useStore.setState({
    isDarkMode: true,
    stations,
    tab: 'all',
    search: '',
    viewMode: 'grid',
    favorites: [],
    hidden: [],
    currentStation: null,
    isPlaying: false,
  })
})

describe('StationGrid', () => {
  it('renders all stations on the "הכל" tab', () => {
    render(<StationGrid />)
    expect(screen.getByText('Rock FM')).toBeInTheDocument()
    expect(screen.getByText('Jazz Club')).toBeInTheDocument()
    expect(screen.getByText('Pop Hits')).toBeInTheDocument()
    expect(screen.getByText('Classical Radio')).toBeInTheDocument()
  })

  it('shows only popular stations on the "פופולרי" tab', () => {
    render(<StationGrid />)
    fireEvent.click(screen.getByRole('button', { name: 'פופולרי' }))
    expect(screen.getByText('Rock FM')).toBeInTheDocument()
    expect(screen.getByText('Pop Hits')).toBeInTheDocument()
    expect(screen.queryByText('Jazz Club')).not.toBeInTheDocument()
    expect(screen.queryByText('Classical Radio')).not.toBeInTheDocument()
  })

  it('shows only favorites on the "מועדפים" tab', () => {
    useStore.setState({ favorites: ['jazz-club'] })
    render(<StationGrid />)
    fireEvent.click(screen.getByText('מועדפים (1)'))
    expect(screen.getByText('Jazz Club')).toBeInTheDocument()
    expect(screen.queryByText('Rock FM')).not.toBeInTheDocument()
  })

  it('shows favorites count in tab label', () => {
    useStore.setState({ favorites: ['rock-fm', 'jazz-club'] })
    render(<StationGrid />)
    expect(screen.getByText('מועדפים (2)')).toBeInTheDocument()
  })

  it('filters stations by search query', () => {
    useStore.setState({ search: 'rock' })
    render(<StationGrid />)
    expect(screen.getByText('Rock FM')).toBeInTheDocument()
    expect(screen.queryByText('Jazz Club')).not.toBeInTheDocument()
  })

  it('shows empty state when no stations match search', () => {
    useStore.setState({ search: 'zzznomatch' })
    render(<StationGrid />)
    expect(screen.getByText('לא נמצאו תחנות')).toBeInTheDocument()
  })

  it('hides hidden stations by default', () => {
    useStore.setState({ hidden: ['jazz-club'] })
    render(<StationGrid />)
    expect(screen.queryByText('Jazz Club')).not.toBeInTheDocument()
  })

  it('shows מוסתרות tab when there are hidden stations', () => {
    useStore.setState({ hidden: ['jazz-club'] })
    render(<StationGrid />)
    expect(screen.getByRole('button', { name: 'מוסתרות (1)' })).toBeInTheDocument()
  })

  it('does not show מוסתרות tab when no stations are hidden', () => {
    render(<StationGrid />)
    expect(screen.queryByRole('button', { name: /מוסתרות/ })).not.toBeInTheDocument()
  })

  it('shows only hidden stations on the מוסתרות tab', () => {
    useStore.setState({ hidden: ['jazz-club'] })
    render(<StationGrid />)
    fireEvent.click(screen.getByRole('button', { name: 'מוסתרות (1)' }))
    expect(screen.getByText('Jazz Club')).toBeInTheDocument()
    expect(screen.queryByText('Rock FM')).not.toBeInTheDocument()
  })

  it('plays a station when its card is clicked', () => {
    render(<StationGrid />)
    fireEvent.click(screen.getByText('Rock FM'))
    expect(useStore.getState().currentStation).toEqual(stations[0])
  })

  it('toggles favorite when heart is clicked', () => {
    render(<StationGrid />)
    fireEvent.click(screen.getAllByTitle('הוסף למועדפים')[0])
    expect(useStore.getState().favorites).toEqual([stations[0].slug])
  })

  it('toggles hidden when hide button is clicked', () => {
    render(<StationGrid />)
    fireEvent.click(screen.getAllByTitle('הסתר תחנה')[0])
    expect(useStore.getState().hidden).toEqual([stations[0].slug])
  })

  it('shows active tab indicator on selected tab', () => {
    render(<StationGrid />)
    fireEvent.click(screen.getByRole('button', { name: 'פופולרי' }))
    const popularBtn = screen.getByRole('button', { name: 'פופולרי' })
    expect(popularBtn.querySelector('span')).toBeInTheDocument()
  })

  it('toggles between grid and list view modes', () => {
    render(<StationGrid />)
    expect(useStore.getState().viewMode).toBe('grid')
    fireEvent.click(screen.getByTitle('תצוגת רשימה'))
    expect(useStore.getState().viewMode).toBe('list')
  })
})
