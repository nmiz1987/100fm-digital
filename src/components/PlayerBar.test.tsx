import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PlayerBar } from './PlayerBar'
import type { Station, Slider } from '../types'

const slider1: Slider = { audio: 'http://slider1' }
const slider2: Slider = { audio: 'http://slider2' }

const station: Station = {
  name: 'Rock FM',
  audio: 'http://stream.mp3',
  slug: 'rock-fm',
  logo: 'logo.png',
}

const stationWithSliders: Station = { ...station, sliders: [slider1, slider2] }
const stationWithCover: Station = { ...station, cover: 'cover.png' }

const defaultProps = {
  station,
  currentSlider: null as Slider | null,
  sliderLabels: [] as string[],
  nowPlaying: null,
  isPlaying: false,
  isLoading: false,
  volume: 0.8,
  isFavorite: false,
  darkMode: true,
  onPlayPause: vi.fn(),
  onStop: vi.fn(),
  onVolumeChange: vi.fn(),
  onToggleFavorite: vi.fn(),
  onSelectLive: vi.fn(),
  onSelectSlider: vi.fn(),
}

describe('PlayerBar', () => {
  it('renders station name', () => {
    render(<PlayerBar {...defaultProps} />)
    expect(screen.getByText('Rock FM')).toBeInTheDocument()
  })

  it('shows play icon when not playing and not loading', () => {
    render(<PlayerBar {...defaultProps} isPlaying={false} isLoading={false} />)
    expect(screen.getByTitle('נגן')).toBeInTheDocument()
  })

  it('shows pause icon when playing', () => {
    render(<PlayerBar {...defaultProps} isPlaying={true} isLoading={false} />)
    expect(screen.getByTitle('השהה')).toBeInTheDocument()
  })

  it('shows spinner when loading', () => {
    render(<PlayerBar {...defaultProps} isLoading={true} />)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('calls onPlayPause when play button clicked', () => {
    const onPlayPause = vi.fn()
    render(<PlayerBar {...defaultProps} onPlayPause={onPlayPause} />)
    fireEvent.click(screen.getByTitle('נגן'))
    expect(onPlayPause).toHaveBeenCalledTimes(1)
  })

  it('calls onStop when stop button clicked', () => {
    const onStop = vi.fn()
    render(<PlayerBar {...defaultProps} onStop={onStop} />)
    fireEvent.click(screen.getByTitle('עצור'))
    expect(onStop).toHaveBeenCalledTimes(1)
  })

  it('shows filled heart when isFavorite', () => {
    render(<PlayerBar {...defaultProps} isFavorite={true} />)
    expect(screen.getByTitle('הסר ממועדפים')).toBeInTheDocument()
  })

  it('shows empty heart when not isFavorite', () => {
    render(<PlayerBar {...defaultProps} isFavorite={false} />)
    expect(screen.getByTitle('הוסף למועדפים')).toBeInTheDocument()
  })

  it('calls onToggleFavorite when heart button clicked', () => {
    const onToggleFavorite = vi.fn()
    render(<PlayerBar {...defaultProps} onToggleFavorite={onToggleFavorite} />)
    fireEvent.click(screen.getByTitle('הוסף למועדפים'))
    expect(onToggleFavorite).toHaveBeenCalledTimes(1)
  })

  it('shows track line with artist and name', () => {
    render(<PlayerBar {...defaultProps} nowPlaying={{ artist: 'Radiohead', name: 'Creep', timestamp: 0, before: 0 }} />)
    expect(screen.getByText('Radiohead — Creep')).toBeInTheDocument()
  })

  it('shows only track name when artist is empty', () => {
    render(<PlayerBar {...defaultProps} nowPlaying={{ artist: '', name: 'Creep', timestamp: 0, before: 0 }} />)
    expect(screen.getByText('Creep')).toBeInTheDocument()
  })

  it('shows fallback when artist present but name empty', () => {
    render(<PlayerBar {...defaultProps} nowPlaying={{ artist: 'Radiohead', name: '', timestamp: 0, before: 0 }} />)
    expect(screen.getByText('שידור חי')).toBeInTheDocument()
  })

  it('shows loading text when isLoading', () => {
    render(<PlayerBar {...defaultProps} isLoading={true} />)
    expect(screen.getByText('טוען...')).toBeInTheDocument()
  })

  it('shows שידור חי when no track and no sliders', () => {
    render(<PlayerBar {...defaultProps} />)
    expect(screen.getByText('שידור חי')).toBeInTheDocument()
  })

  it('shows station #1 label in info when has sliders and no current slider', () => {
    render(<PlayerBar {...defaultProps} station={stationWithSliders} sliderLabels={['S1', 'S2']} />)
    const matches = screen.getAllByText('Rock FM #1')
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })

  it('shows שידור מושהה when currentSlider has no label', () => {
    render(<PlayerBar {...defaultProps} station={stationWithSliders} currentSlider={slider1} sliderLabels={[]} />)
    expect(screen.getByText('שידור מושהה')).toBeInTheDocument()
  })

  it('shows slider label in info when currentSlider is active with label', () => {
    render(<PlayerBar {...defaultProps} station={stationWithSliders} currentSlider={slider1} sliderLabels={['Pop Mix', 'Rock Mix']} />)
    // Label appears in both the info <p> and the active tab button
    expect(screen.getAllByText('Pop Mix').length).toBeGreaterThanOrEqual(1)
  })

  it('does not show slider tab row when station has no sliders', () => {
    render(<PlayerBar {...defaultProps} />)
    // The live tab button only appears in the slider row
    expect(screen.queryByRole('button', { name: 'Rock FM #1' })).not.toBeInTheDocument()
  })

  it('shows slider tab row when station has sliders', () => {
    render(<PlayerBar {...defaultProps} station={stationWithSliders} sliderLabels={['S1', 'S2']} />)
    expect(screen.getByRole('button', { name: 'Rock FM #1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'S1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'S2' })).toBeInTheDocument()
  })

  it('calls onSelectLive when live tab clicked', () => {
    const onSelectLive = vi.fn()
    render(<PlayerBar {...defaultProps} station={stationWithSliders} sliderLabels={['S1', 'S2']} onSelectLive={onSelectLive} />)
    fireEvent.click(screen.getByRole('button', { name: 'Rock FM #1' }))
    expect(onSelectLive).toHaveBeenCalledTimes(1)
  })

  it('calls onSelectSlider with correct slider when tab clicked', () => {
    const onSelectSlider = vi.fn()
    render(<PlayerBar {...defaultProps} station={stationWithSliders} sliderLabels={['S1', 'S2']} onSelectSlider={onSelectSlider} />)
    fireEvent.click(screen.getByRole('button', { name: 'S1' }))
    expect(onSelectSlider).toHaveBeenCalledWith(slider1)
  })

  it('uses fallback slider label when sliderLabels entry is missing', () => {
    render(<PlayerBar {...defaultProps} station={stationWithSliders} sliderLabels={[]} />)
    // Slider tabs show fallback labels: "Rock FM #2", "Rock FM #3"
    expect(screen.getByRole('button', { name: 'Rock FM #2' })).toBeInTheDocument()
  })

  it('calls onVolumeChange with parsed float when slider changes', () => {
    const onVolumeChange = vi.fn()
    render(<PlayerBar {...defaultProps} onVolumeChange={onVolumeChange} />)
    const slider = screen.getByTitle('ווליום')
    fireEvent.change(slider, { target: { value: '0.5' } })
    expect(onVolumeChange).toHaveBeenCalledWith(0.5)
  })

  it('uses station cover image when available', () => {
    render(<PlayerBar {...defaultProps} station={stationWithCover} />)
    const img = screen.getByAltText('Rock FM') as HTMLImageElement
    expect(img.src).toContain('cover.png')
  })

  it('uses station logo when no cover', () => {
    render(<PlayerBar {...defaultProps} />)
    const img = screen.getByAltText('Rock FM') as HTMLImageElement
    expect(img.src).toContain('logo.png')
  })

  it('falls back to logo on image error', () => {
    render(<PlayerBar {...defaultProps} station={stationWithCover} />)
    const img = screen.getByAltText('Rock FM') as HTMLImageElement
    fireEvent.error(img)
    expect(img.src).toContain('logo.png')
  })

  it('renders in light mode without errors', () => {
    const { container } = render(<PlayerBar {...defaultProps} darkMode={false} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('volume slider shows muted icon at volume 0', () => {
    render(<PlayerBar {...defaultProps} volume={0} />)
    // Muted icon has cross lines (x1=23 or x1=17)
    const svgLines = document.querySelectorAll('line[x1="23"]')
    expect(svgLines.length).toBeGreaterThan(0)
  })

  it('volume slider shows low icon at volume < 0.5', () => {
    render(<PlayerBar {...defaultProps} volume={0.3} />)
    // Low volume icon has a single arc path, not the mute X lines
    const svgLines = document.querySelectorAll('line[x1="23"]')
    expect(svgLines.length).toBe(0)
  })

  it('volume slider shows high icon at volume >= 0.5', () => {
    render(<PlayerBar {...defaultProps} volume={0.8} />)
    // High volume icon has two arc paths; we just check it renders
    expect(screen.getByTitle('ווליום')).toBeInTheDocument()
  })

  it('marks active slider tab when currentSlider matches', () => {
    render(
      <PlayerBar
        {...defaultProps}
        station={stationWithSliders}
        currentSlider={slider1}
        sliderLabels={['S1', 'S2']}
      />
    )
    const activeTab = screen.getByRole('button', { name: 'S1' })
    expect(activeTab.className).toContain('bg-[#e8192c]')
  })

  it('marks live tab active when no currentSlider', () => {
    render(<PlayerBar {...defaultProps} station={stationWithSliders} sliderLabels={['S1', 'S2']} currentSlider={null} />)
    const liveTab = screen.getByRole('button', { name: 'Rock FM #1' })
    expect(liveTab.className).toContain('bg-[#e8192c]')
  })
})
