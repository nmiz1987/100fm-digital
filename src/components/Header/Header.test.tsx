import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from './Header'

const defaultProps = {
  search: '',
  onSearchChange: vi.fn(),
  darkMode: true,
  onDarkModeToggle: vi.fn(),
}

describe('Header', () => {
  it('renders the search input', () => {
    render(<Header {...defaultProps} />)
    expect(screen.getByPlaceholderText('חיפוש תחנה...')).toBeInTheDocument()
  })

  it('shows current search value in the input', () => {
    render(<Header {...defaultProps} search="rock" />)
    expect(screen.getByDisplayValue('rock')).toBeInTheDocument()
  })

  it('calls onSearchChange when user types', () => {
    const onSearchChange = vi.fn()
    render(<Header {...defaultProps} onSearchChange={onSearchChange} />)
    fireEvent.change(screen.getByPlaceholderText('חיפוש תחנה...'), {
      target: { value: 'jazz' },
    })
    expect(onSearchChange).toHaveBeenCalledWith('jazz')
  })

  it('shows clear button when search has content', () => {
    render(<Header {...defaultProps} search="rock" />)
    expect(screen.getByLabelText('נקה חיפוש')).toBeInTheDocument()
  })

  it('hides clear button when search is empty', () => {
    render(<Header {...defaultProps} search="" />)
    expect(screen.queryByLabelText('נקה חיפוש')).not.toBeInTheDocument()
  })

  it('clears search when clear button is clicked', () => {
    const onSearchChange = vi.fn()
    render(<Header {...defaultProps} search="rock" onSearchChange={onSearchChange} />)
    fireEvent.click(screen.getByLabelText('נקה חיפוש'))
    expect(onSearchChange).toHaveBeenCalledWith('')
  })

  it('clears search on Escape key', () => {
    const onSearchChange = vi.fn()
    render(<Header {...defaultProps} onSearchChange={onSearchChange} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onSearchChange).toHaveBeenCalledWith('')
  })

  it('shows light-mode button label in dark mode', () => {
    render(<Header {...defaultProps} darkMode={true} />)
    expect(screen.getByLabelText('מצב בהיר')).toBeInTheDocument()
  })

  it('shows dark-mode button label in light mode', () => {
    render(<Header {...defaultProps} darkMode={false} />)
    expect(screen.getByLabelText('מצב כהה')).toBeInTheDocument()
  })

  it('calls onDarkModeToggle when toggle button is clicked', () => {
    const onDarkModeToggle = vi.fn()
    render(<Header {...defaultProps} onDarkModeToggle={onDarkModeToggle} />)
    fireEvent.click(screen.getByLabelText('מצב בהיר'))
    expect(onDarkModeToggle).toHaveBeenCalledTimes(1)
  })
})
