import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CarSliderList } from '../CarSliderList'
import type { Station, Slider } from '../../../../types'
import { useStore } from '../../../../store/store'

const slider1: Slider = { audio: 'http://slider1' }
const slider2: Slider = { audio: 'http://slider2' }

const station: Station = {
  name: 'Rock FM',
  audio: 'http://stream',
  slug: 'rock-fm',
  logo: 'logo.png',
  sliders: [slider1, slider2],
}

beforeEach(() => {
  useStore.setState({
    isDarkMode: true,
    currentStation: station,
    currentSlider: null,
    sliderLabels: [],
  })
})

describe('CarSliderList', () => {
  it('renders the live label and one button per slider', () => {
    useStore.setState({ sliderLabels: ['Live Now', 'S1', 'S2'] })
    render(<CarSliderList station={station} />)
    expect(screen.getByRole('button', { name: 'Live Now' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'S1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'S2' })).toBeInTheDocument()
  })

  it('uses fallback labels when sliderLabels is empty', () => {
    render(<CarSliderList station={station} />)
    expect(screen.getByRole('button', { name: 'Rock FM #1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rock FM #2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rock FM #3' })).toBeInTheDocument()
  })

  it('returns to live playback when the live button is clicked', () => {
    useStore.setState({ sliderLabels: ['Live Now', 'S1', 'S2'], currentSlider: slider1 })
    render(<CarSliderList station={station} />)
    fireEvent.click(screen.getByRole('button', { name: 'Live Now' }))
    expect(useStore.getState().currentSlider).toBeNull()
  })

  it('selects the slider when a slider button is clicked', () => {
    useStore.setState({ sliderLabels: ['Live Now', 'S1', 'S2'] })
    render(<CarSliderList station={station} />)
    fireEvent.click(screen.getByRole('button', { name: 'S1' }))
    expect(useStore.getState().currentSlider).toEqual(slider1)
  })

  it('marks the live button active when there is no current slider', () => {
    useStore.setState({ sliderLabels: ['Live Now', 'S1', 'S2'], currentSlider: null })
    render(<CarSliderList station={station} />)
    expect(screen.getByRole('button', { name: 'Live Now' }).className).toContain('bg-[#e8192c]')
  })

  it('marks the matching slider button active when currentSlider matches', () => {
    useStore.setState({ sliderLabels: ['Live Now', 'S1', 'S2'], currentSlider: slider1 })
    render(<CarSliderList station={station} />)
    expect(screen.getByRole('button', { name: 'S1' }).className).toContain('bg-[#e8192c]')
    expect(screen.getByRole('button', { name: 'Live Now' }).className).not.toContain('bg-[#e8192c]')
  })

  it('renders slider names with larger text size', () => {
    useStore.setState({ sliderLabels: ['Live Now', 'S1', 'S2'] })
    render(<CarSliderList station={station} />)
    expect(screen.getByRole('button', { name: 'Live Now' }).className).toContain('text-lg')
  })

  it('plays the station when not active and live button clicked', () => {
    useStore.setState({ currentStation: null, sliderLabels: ['Live Now', 'S1', 'S2'] })
    render(<CarSliderList station={station} />)
    fireEvent.click(screen.getByRole('button', { name: 'Live Now' }))
    expect(useStore.getState().currentStation).toEqual(station)
  })
})
