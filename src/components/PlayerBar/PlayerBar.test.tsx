import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PlayerBar } from './PlayerBar'
import type { Station, Slider } from '../../types'
import { useStore } from '../../store/store'

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

beforeEach(() => {
  useStore.setState({
    currentStation: station,
    currentSlider: null,
    sliderLabels: [],
    nowPlaying: null,
    isPlaying: false,
    isLoading: false,
    volume: 0.8,
    favorites: [],
    isDarkMode: true,
  })
})

describe('PlayerBar', () => {
  it('renders nothing when there is no current station', () => {
    useStore.setState({ currentStation: null })
    const { container } = render(<PlayerBar />)
    expect(container.firstChild).toBeNull()
  })

  it('renders station name', () => {
    render(<PlayerBar />)
    expect(screen.getByText('Rock FM')).toBeInTheDocument()
  })

  it('shows play icon when not playing and not loading', () => {
    render(<PlayerBar />)
    expect(screen.getByTitle('נגן')).toBeInTheDocument()
  })

  it('shows pause icon when playing', () => {
    useStore.setState({ isPlaying: true })
    render(<PlayerBar />)
    expect(screen.getByTitle('השהה')).toBeInTheDocument()
  })

  it('shows spinner when loading', () => {
    useStore.setState({ isLoading: true })
    render(<PlayerBar />)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('calls pause when playing and play/pause button clicked', () => {
    useStore.setState({ isPlaying: true })
    const pauseSpy = vi.spyOn(useStore.getState(), 'pause')
    render(<PlayerBar />)
    fireEvent.click(screen.getByTitle('השהה'))
    expect(pauseSpy).toHaveBeenCalled()
  })

  it('calls resume when paused and play/pause button clicked', () => {
    const resumeSpy = vi.spyOn(useStore.getState(), 'resume')
    render(<PlayerBar />)
    fireEvent.click(screen.getByTitle('נגן'))
    expect(resumeSpy).toHaveBeenCalled()
  })

  it('clears the current station when stop button clicked', () => {
    render(<PlayerBar />)
    fireEvent.click(screen.getByTitle('עצור'))
    expect(useStore.getState().currentStation).toBeNull()
  })

  it('shows filled heart when isFavorite', () => {
    useStore.setState({ favorites: [station.slug] })
    render(<PlayerBar />)
    expect(screen.getByTitle('הסר ממועדפים')).toBeInTheDocument()
  })

  it('shows empty heart when not isFavorite', () => {
    render(<PlayerBar />)
    expect(screen.getByTitle('הוסף למועדפים')).toBeInTheDocument()
  })

  it('toggles favorite when heart button clicked', () => {
    render(<PlayerBar />)
    fireEvent.click(screen.getByTitle('הוסף למועדפים'))
    expect(useStore.getState().favorites).toEqual([station.slug])
  })

  it('shows track line with artist and name', () => {
    useStore.setState({ nowPlaying: { artist: 'Radiohead', name: 'Creep', timestamp: 0, before: 0 } })
    render(<PlayerBar />)
    expect(screen.getByText('Radiohead — Creep')).toBeInTheDocument()
  })

  it('shows only track name when artist is empty', () => {
    useStore.setState({ nowPlaying: { artist: '', name: 'Creep', timestamp: 0, before: 0 } })
    render(<PlayerBar />)
    expect(screen.getByText('Creep')).toBeInTheDocument()
  })

  it('shows fallback when artist present but name empty', () => {
    useStore.setState({ nowPlaying: { artist: 'Radiohead', name: '', timestamp: 0, before: 0 } })
    render(<PlayerBar />)
    expect(screen.getByText('שידור חי')).toBeInTheDocument()
  })

  it('shows loading text when isLoading', () => {
    useStore.setState({ isLoading: true })
    render(<PlayerBar />)
    expect(screen.getByText('טוען...')).toBeInTheDocument()
  })

  it('shows שידור חי when no track and no sliders', () => {
    render(<PlayerBar />)
    expect(screen.getByText('שידור חי')).toBeInTheDocument()
  })

  it('shows live label from sliderLabels[0] in info when has sliders and no current slider', () => {
    useStore.setState({ currentStation: stationWithSliders, sliderLabels: ['Live Now', 'S1', 'S2'] })
    render(<PlayerBar />)
    const matches = screen.getAllByText('Live Now')
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })

  it('shows שידור מושהה when currentSlider has no label', () => {
    useStore.setState({ currentStation: stationWithSliders, currentSlider: slider1, sliderLabels: [] })
    render(<PlayerBar />)
    expect(screen.getByText('שידור מושהה')).toBeInTheDocument()
  })

  it('shows slider label in info when currentSlider is active with label', () => {
    useStore.setState({
      currentStation: stationWithSliders,
      currentSlider: slider1,
      sliderLabels: ['Live Now', 'Pop Mix', 'Rock Mix'],
    })
    render(<PlayerBar />)
    expect(screen.getAllByText('Pop Mix').length).toBeGreaterThanOrEqual(1)
  })

  it('does not show slider tab row when station has no sliders', () => {
    render(<PlayerBar />)
    expect(screen.queryByRole('button', { name: 'Rock FM #1' })).not.toBeInTheDocument()
  })

  it('shows slider tab row when station has sliders', () => {
    useStore.setState({ currentStation: stationWithSliders, sliderLabels: ['Live Now', 'S1', 'S2'] })
    render(<PlayerBar />)
    expect(screen.getByRole('button', { name: 'Live Now' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'S1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'S2' })).toBeInTheDocument()
  })

  it('returns to live playback when live tab clicked', () => {
    useStore.setState({ currentStation: stationWithSliders, currentSlider: slider1, sliderLabels: ['Live Now', 'S1', 'S2'] })
    render(<PlayerBar />)
    fireEvent.click(screen.getByRole('button', { name: 'Live Now' }))
    expect(useStore.getState().currentSlider).toBeNull()
  })

  it('selects the correct slider when tab clicked', () => {
    useStore.setState({ currentStation: stationWithSliders, sliderLabels: ['Live Now', 'S1', 'S2'] })
    render(<PlayerBar />)
    fireEvent.click(screen.getByRole('button', { name: 'S1' }))
    expect(useStore.getState().currentSlider).toEqual(slider1)
  })

  it('uses fallback slider label when sliderLabels entry is missing', () => {
    useStore.setState({ currentStation: stationWithSliders, sliderLabels: [] })
    render(<PlayerBar />)
    expect(screen.getByRole('button', { name: 'Rock FM #2' })).toBeInTheDocument()
  })

  it('updates volume when slider changes', () => {
    render(<PlayerBar />)
    const slider = screen.getByTitle('ווליום')
    fireEvent.change(slider, { target: { value: '0.5' } })
    expect(useStore.getState().volume).toBe(0.5)
  })

  it('uses station cover image when available', () => {
    useStore.setState({ currentStation: stationWithCover })
    render(<PlayerBar />)
    const img = screen.getByAltText('Rock FM') as HTMLImageElement
    expect(img.src).toContain('cover.png')
  })

  it('uses station logo when no cover', () => {
    render(<PlayerBar />)
    const img = screen.getByAltText('Rock FM') as HTMLImageElement
    expect(img.src).toContain('logo.png')
  })

  it('falls back to logo on image error', () => {
    useStore.setState({ currentStation: stationWithCover })
    render(<PlayerBar />)
    const img = screen.getByAltText('Rock FM') as HTMLImageElement
    fireEvent.error(img)
    expect(img.src).toContain('logo.png')
  })

  it('renders in light mode without errors', () => {
    useStore.setState({ isDarkMode: false })
    const { container } = render(<PlayerBar />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('volume slider shows muted icon at volume 0', () => {
    useStore.setState({ volume: 0 })
    render(<PlayerBar />)
    const svgLines = document.querySelectorAll('line[x1="23"]')
    expect(svgLines.length).toBeGreaterThan(0)
  })

  it('volume slider shows low icon at volume < 0.5', () => {
    useStore.setState({ volume: 0.3 })
    render(<PlayerBar />)
    const svgLines = document.querySelectorAll('line[x1="23"]')
    expect(svgLines.length).toBe(0)
  })

  it('volume slider shows high icon at volume >= 0.5', () => {
    useStore.setState({ volume: 0.8 })
    render(<PlayerBar />)
    expect(screen.getByTitle('ווליום')).toBeInTheDocument()
  })

  it('marks active slider tab when currentSlider matches', () => {
    useStore.setState({ currentStation: stationWithSliders, currentSlider: slider1, sliderLabels: ['Live Now', 'S1', 'S2'] })
    render(<PlayerBar />)
    const activeTab = screen.getByRole('button', { name: 'S1' })
    expect(activeTab.className).toContain('bg-[#e8192c]')
  })

  it('marks live tab active when no currentSlider', () => {
    useStore.setState({ currentStation: stationWithSliders, currentSlider: null, sliderLabels: ['Live Now', 'S1', 'S2'] })
    render(<PlayerBar />)
    const liveTab = screen.getByRole('button', { name: 'Live Now' })
    expect(liveTab.className).toContain('bg-[#e8192c]')
  })
})
