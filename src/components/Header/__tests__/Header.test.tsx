import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from '../Header'
import { useStore } from '../../../store/store'

beforeEach(() => {
  useStore.setState({ search: '', isDarkMode: true })
})

describe('Header', () => {
  it('renders the search input', () => {
    render(<Header onCarModeEnter={vi.fn()} />)
    expect(screen.getByPlaceholderText('חיפוש תחנה...')).toBeInTheDocument()
  })

  it('shows current search value in the input', () => {
    useStore.setState({ search: 'rock' })
    render(<Header onCarModeEnter={vi.fn()} />)
    expect(screen.getByDisplayValue('rock')).toBeInTheDocument()
  })

  it('updates store search when user types', () => {
    render(<Header onCarModeEnter={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('חיפוש תחנה...'), {
      target: { value: 'jazz' },
    })
    expect(useStore.getState().search).toBe('jazz')
  })

  it('shows clear button when search has content', () => {
    useStore.setState({ search: 'rock' })
    render(<Header onCarModeEnter={vi.fn()} />)
    expect(screen.getByLabelText('נקה חיפוש')).toBeInTheDocument()
  })

  it('hides clear button when search is empty', () => {
    render(<Header onCarModeEnter={vi.fn()} />)
    expect(screen.queryByLabelText('נקה חיפוש')).not.toBeInTheDocument()
  })

  it('clears search when clear button is clicked', () => {
    useStore.setState({ search: 'rock' })
    render(<Header onCarModeEnter={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('נקה חיפוש'))
    expect(useStore.getState().search).toBe('')
  })

  it('clears search on Escape key', () => {
    useStore.setState({ search: 'rock' })
    render(<Header onCarModeEnter={vi.fn()} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(useStore.getState().search).toBe('')
  })

  it('shows light-mode button label in dark mode', () => {
    useStore.setState({ isDarkMode: true })
    render(<Header onCarModeEnter={vi.fn()} />)
    expect(screen.getByLabelText('מצב בהיר')).toBeInTheDocument()
  })

  it('shows dark-mode button label in light mode', () => {
    useStore.setState({ isDarkMode: false })
    render(<Header onCarModeEnter={vi.fn()} />)
    expect(screen.getByLabelText('מצב כהה')).toBeInTheDocument()
  })

  it('toggles dark mode when toggle button is clicked', () => {
    useStore.setState({ isDarkMode: true })
    render(<Header onCarModeEnter={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('מצב בהיר'))
    expect(useStore.getState().isDarkMode).toBe(false)
  })

  it('renders a car mode button that is hidden on larger screens', () => {
    render(<Header onCarModeEnter={vi.fn()} />)
    const carButton = screen.getByLabelText('מצב רכב')
    expect(carButton).toBeInTheDocument()
    expect(carButton.className).toContain('sm:hidden')
  })

  it('calls onCarModeEnter when the car mode button is clicked', () => {
    const onCarModeEnter = vi.fn()
    render(<Header onCarModeEnter={onCarModeEnter} />)
    fireEvent.click(screen.getByLabelText('מצב רכב'))
    expect(onCarModeEnter).toHaveBeenCalledTimes(1)
  })
})
