import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { StationGrid } from './StationGrid'
import type { Station } from '../../types'
import type { Tab } from '../../utils/filterStations'
import type { ComponentProps } from 'react'

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

const defaultProps = {
  stations,
  loading: false,
  search: '',
  activeSlug: null,
  isPlaying: false,
  favorites: [],
  hidden: [],
  darkMode: true,
  onPlay: vi.fn(),
  onToggleFavorite: vi.fn(),
  onToggleHide: vi.fn(),
}

// StationGrid no longer owns tab state (it lives in useAppState); this harness
// supplies controlled tab state so tests can click tabs and see them change.
function StationGridHarness(props: Omit<ComponentProps<typeof StationGrid>, 'tab' | 'setTab'>) {
  const [tab, setTab] = useState<Tab>('all')
  return <StationGrid {...props} tab={tab} setTab={setTab} />
}

describe('StationGrid', () => {
  it('renders all stations on the "הכל" tab', () => {
    render(<StationGridHarness {...defaultProps} />)
    expect(screen.getByText('Rock FM')).toBeInTheDocument()
    expect(screen.getByText('Jazz Club')).toBeInTheDocument()
    expect(screen.getByText('Pop Hits')).toBeInTheDocument()
    expect(screen.getByText('Classical Radio')).toBeInTheDocument()
  })

  it('shows only popular stations on the "פופולרי" tab', () => {
    render(<StationGridHarness {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: 'פופולרי' }))
    expect(screen.getByText('Rock FM')).toBeInTheDocument()
    expect(screen.getByText('Pop Hits')).toBeInTheDocument()
    expect(screen.queryByText('Jazz Club')).not.toBeInTheDocument()
    expect(screen.queryByText('Classical Radio')).not.toBeInTheDocument()
  })

  it('shows only favorites on the "מועדפים" tab', () => {
    render(<StationGridHarness {...defaultProps} favorites={['jazz-club']} />)
    fireEvent.click(screen.getByText('מועדפים (1)'))
    expect(screen.getByText('Jazz Club')).toBeInTheDocument()
    expect(screen.queryByText('Rock FM')).not.toBeInTheDocument()
  })

  it('shows favorites count in tab label', () => {
    render(<StationGridHarness {...defaultProps} favorites={['rock-fm', 'jazz-club']} />)
    expect(screen.getByText('מועדפים (2)')).toBeInTheDocument()
  })

  it('filters stations by search query', () => {
    render(<StationGridHarness {...defaultProps} search="rock" />)
    expect(screen.getByText('Rock FM')).toBeInTheDocument()
    expect(screen.queryByText('Jazz Club')).not.toBeInTheDocument()
  })

  it('shows empty state when no stations match search', () => {
    render(<StationGridHarness {...defaultProps} search="zzznomatch" />)
    expect(screen.getByText('לא נמצאו תחנות')).toBeInTheDocument()
  })

  it('hides hidden stations by default', () => {
    render(<StationGridHarness {...defaultProps} hidden={['jazz-club']} />)
    expect(screen.queryByText('Jazz Club')).not.toBeInTheDocument()
  })

  it('shows מוסתרות tab when there are hidden stations', () => {
    render(<StationGridHarness {...defaultProps} hidden={['jazz-club']} />)
    expect(screen.getByRole('button', { name: 'מוסתרות (1)' })).toBeInTheDocument()
  })

  it('does not show מוסתרות tab when no stations are hidden', () => {
    render(<StationGridHarness {...defaultProps} hidden={[]} />)
    expect(screen.queryByRole('button', { name: /מוסתרות/ })).not.toBeInTheDocument()
  })

  it('shows only hidden stations on the מוסתרות tab', () => {
    render(<StationGridHarness {...defaultProps} hidden={['jazz-club']} />)
    fireEvent.click(screen.getByRole('button', { name: 'מוסתרות (1)' }))
    expect(screen.getByText('Jazz Club')).toBeInTheDocument()
    expect(screen.queryByText('Rock FM')).not.toBeInTheDocument()
  })

  it('calls onPlay when a station card is clicked', () => {
    const onPlay = vi.fn()
    render(<StationGridHarness {...defaultProps} onPlay={onPlay} />)
    fireEvent.click(screen.getByText('Rock FM'))
    expect(onPlay).toHaveBeenCalledWith(stations[0])
  })

  it('calls onToggleFavorite with station slug when heart clicked', () => {
    const onToggleFavorite = vi.fn()
    render(<StationGridHarness {...defaultProps} onToggleFavorite={onToggleFavorite} />)
    fireEvent.click(screen.getAllByTitle('הוסף למועדפים')[0])
    expect(onToggleFavorite).toHaveBeenCalledWith(stations[0].slug)
  })

  it('calls onToggleHide with station slug when hide clicked', () => {
    const onToggleHide = vi.fn()
    render(<StationGridHarness {...defaultProps} onToggleHide={onToggleHide} />)
    fireEvent.click(screen.getAllByTitle('הסתר תחנה')[0])
    expect(onToggleHide).toHaveBeenCalledWith(stations[0].slug)
  })

  it('shows active tab indicator on selected tab', () => {
    render(<StationGridHarness {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: 'פופולרי' }))
    const popularBtn = screen.getByRole('button', { name: 'פופולרי' })
    expect(popularBtn.querySelector('span')).toBeInTheDocument()
  })
})
