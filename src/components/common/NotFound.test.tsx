import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NotFound } from './NotFound'
import { useStore } from '../../store/store'

beforeEach(() => {
  useStore.setState({ isDarkMode: true })
})

describe('NotFound', () => {
  it('shows a 404 message with a link back home', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    )

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('הדף לא נמצא')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'חזרה לדף הבית' })).toHaveAttribute('href', '/')
  })

  it('renders in light mode without errors', () => {
    useStore.setState({ isDarkMode: false })
    const { container } = render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    )
    expect(container.firstChild).toBeInTheDocument()
  })
})
