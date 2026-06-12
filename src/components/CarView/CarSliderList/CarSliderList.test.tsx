import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CarSliderList } from './CarSliderList'
import type { Station, Slider } from '../../../types'

const slider1: Slider = { audio: 'http://slider1' }
const slider2: Slider = { audio: 'http://slider2' }

const station: Station = {
  name: 'Rock FM',
  audio: 'http://stream',
  slug: 'rock-fm',
  logo: 'logo.png',
  sliders: [slider1, slider2],
}

const defaultProps = {
  station,
  currentSlider: null as Slider | null,
  sliderLabels: [] as string[],
  darkMode: true,
  onSelectLive: vi.fn(),
  onSelectSlider: vi.fn(),
}

describe('CarSliderList', () => {
  it('renders the live label and one button per slider', () => {
    render(<CarSliderList {...defaultProps} sliderLabels={['Live Now', 'S1', 'S2']} />)
    expect(screen.getByRole('button', { name: 'Live Now' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'S1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'S2' })).toBeInTheDocument()
  })

  it('uses fallback labels when sliderLabels is empty', () => {
    render(<CarSliderList {...defaultProps} sliderLabels={[]} />)
    expect(screen.getByRole('button', { name: 'Rock FM #1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rock FM #2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rock FM #3' })).toBeInTheDocument()
  })

  it('calls onSelectLive when the live button is clicked', () => {
    const onSelectLive = vi.fn()
    render(<CarSliderList {...defaultProps} sliderLabels={['Live Now', 'S1', 'S2']} onSelectLive={onSelectLive} />)
    fireEvent.click(screen.getByRole('button', { name: 'Live Now' }))
    expect(onSelectLive).toHaveBeenCalledTimes(1)
  })

  it('calls onSelectSlider with the correct slider when clicked', () => {
    const onSelectSlider = vi.fn()
    render(<CarSliderList {...defaultProps} sliderLabels={['Live Now', 'S1', 'S2']} onSelectSlider={onSelectSlider} />)
    fireEvent.click(screen.getByRole('button', { name: 'S1' }))
    expect(onSelectSlider).toHaveBeenCalledWith(slider1)
  })

  it('marks the live button active when there is no current slider', () => {
    render(<CarSliderList {...defaultProps} sliderLabels={['Live Now', 'S1', 'S2']} currentSlider={null} />)
    expect(screen.getByRole('button', { name: 'Live Now' }).className).toContain('bg-[#e8192c]')
  })

  it('marks the matching slider button active when currentSlider matches', () => {
    render(<CarSliderList {...defaultProps} sliderLabels={['Live Now', 'S1', 'S2']} currentSlider={slider1} />)
    expect(screen.getByRole('button', { name: 'S1' }).className).toContain('bg-[#e8192c]')
    expect(screen.getByRole('button', { name: 'Live Now' }).className).not.toContain('bg-[#e8192c]')
  })

  it('renders slider names with larger text size', () => {
    render(<CarSliderList {...defaultProps} sliderLabels={['Live Now', 'S1', 'S2']} />)
    expect(screen.getByRole('button', { name: 'Live Now' }).className).toContain('text-lg')
  })
})
