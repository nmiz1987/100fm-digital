import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CarStationInfo } from './CarStationInfo'
import type { Station, Slider } from '../../../types'
import { useStore } from '../../../store/store'

const slider1: Slider = { audio: 'http://slider1' }

const makeStation = (slug: string, name: string, overrides: Partial<Station> = {}): Station => ({
  name,
  audio: `http://stream/${slug}`,
  slug,
  logo: `${slug}.png`,
  ...overrides,
})

const stationA = makeStation('a', 'Rock FM')
const stationB = makeStation('b', 'Jazz Club')
const stationWithSliders = makeStation('a', 'Rock FM', { sliders: [slider1] })

const stations = [stationA, stationB]

beforeEach(() => {
  useStore.setState({
    isDarkMode: true,
    stations,
    tab: 'all',
    search: '',
    favorites: [],
    hidden: [],
    currentStation: stationA,
    currentSlider: null,
    isPlaying: false,
    isLoading: false,
    nowPlaying: null,
    sliderLabels: [],
  })
})

describe('CarStationInfo', () => {
  it('renders the station name', () => {
    render(<CarStationInfo station={stationA} />, { wrapper: MemoryRouter })
    expect(screen.getByText('Rock FM')).toBeInTheDocument()
  })

  it('renders now playing info when active', () => {
    useStore.setState({ nowPlaying: { artist: 'Radiohead', name: 'Creep', timestamp: 0, before: 0 } })
    render(<CarStationInfo station={stationA} />, { wrapper: MemoryRouter })
    expect(screen.getByText('Radiohead — Creep')).toBeInTheDocument()
  })

  it('shows play icon when paused', () => {
    render(<CarStationInfo station={stationA} />, { wrapper: MemoryRouter })
    expect(screen.getByLabelText('נגן')).toBeInTheDocument()
  })

  it('shows pause icon when playing', () => {
    useStore.setState({ isPlaying: true })
    render(<CarStationInfo station={stationA} />, { wrapper: MemoryRouter })
    expect(screen.getByLabelText('השהה')).toBeInTheDocument()
  })

  it('calls pause when playing and play/pause clicked for the active station', () => {
    useStore.setState({ isPlaying: true })
    const pauseSpy = vi.spyOn(useStore.getState(), 'pause')
    render(<CarStationInfo station={stationA} />, { wrapper: MemoryRouter })
    fireEvent.click(screen.getByLabelText('השהה'))
    expect(pauseSpy).toHaveBeenCalled()
  })

  it('plays the station when play clicked for a non-active station', () => {
    useStore.setState({ currentStation: stationB })
    render(<CarStationInfo station={stationA} />, { wrapper: MemoryRouter })
    fireEvent.click(screen.getByLabelText('נגן'))
    expect(useStore.getState().currentStation).toEqual(stationA)
  })

  it('shows filled heart and toggles favorite', () => {
    useStore.setState({ favorites: ['a'] })
    render(<CarStationInfo station={stationA} />, { wrapper: MemoryRouter })
    const favButton = screen.getByLabelText('הסר ממועדפים')
    expect(favButton).toHaveTextContent('♥')
    fireEvent.click(favButton)
    expect(useStore.getState().favorites).toEqual([])
  })

  it('shows empty heart when not favorite', () => {
    render(<CarStationInfo station={stationA} />, { wrapper: MemoryRouter })
    expect(screen.getByLabelText('הוסף למועדפים')).toHaveTextContent('♡')
  })

  it('goes to the next station when next clicked', () => {
    render(<CarStationInfo station={stationA} />, { wrapper: MemoryRouter })
    fireEvent.click(screen.getByLabelText('תחנה הבאה'))
    expect(useStore.getState().currentStation).toEqual(stationB)
  })

  it('disables next/prev when there is only one station', () => {
    useStore.setState({ stations: [stationA] })
    render(<CarStationInfo station={stationA} />, { wrapper: MemoryRouter })
    expect(screen.getByLabelText('תחנה הבאה')).toBeDisabled()
    expect(screen.getByLabelText('תחנה קודמת')).toBeDisabled()
  })

  it('renders the slider list when the station has sliders', () => {
    useStore.setState({ sliderLabels: ['Live', 'Slider 1'], currentStation: stationWithSliders })
    render(<CarStationInfo station={stationWithSliders} />, { wrapper: MemoryRouter })
    expect(screen.getByRole('button', { name: 'Live' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Slider 1' })).toBeInTheDocument()
  })

  it('does not render the slider list when the station has no sliders', () => {
    render(<CarStationInfo station={stationA} />, { wrapper: MemoryRouter })
    expect(screen.queryByRole('button', { name: 'Rock FM #1' })).not.toBeInTheDocument()
  })

  it('selects a slider when clicked for the active station', () => {
    useStore.setState({ sliderLabels: ['Live', 'Slider 1'], currentStation: stationWithSliders })
    render(<CarStationInfo station={stationWithSliders} />, { wrapper: MemoryRouter })
    fireEvent.click(screen.getByRole('button', { name: 'Slider 1' }))
    expect(useStore.getState().currentSlider).toEqual(slider1)
  })
})
