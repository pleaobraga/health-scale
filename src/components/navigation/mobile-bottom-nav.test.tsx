import { fireEvent, render, screen } from '@testing-library/react'
import { CalendarDays, Users } from 'lucide-react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { MobileBottomNav } from './mobile-bottom-nav'

import type { MobileBottomNavItem } from './mobile-bottom-nav'

const items: MobileBottomNavItem[] = [
  { id: 'calendar', path: '/', label: 'Escala', icon: CalendarDays, end: true },
  { id: 'people', path: '/pessoas', label: 'Pessoas', icon: Users },
]

describe('MobileBottomNav', () => {
  it('renders the items and marks the active route', () => {
    render(
      <MemoryRouter initialEntries={['/pessoas']}>
        <MobileBottomNav
          items={items}
          currentView="people"
          onNavigate={vi.fn()}
          onOpenMenu={vi.fn()}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Pessoas' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Escala' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('calls onNavigate and onOpenMenu on click', () => {
    const onNavigate = vi.fn()
    const onOpenMenu = vi.fn()
    render(
      <MemoryRouter>
        <MobileBottomNav
          items={items}
          currentView="calendar"
          onNavigate={onNavigate}
          onOpenMenu={onOpenMenu}
        />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('link', { name: 'Pessoas' }))
    expect(onNavigate).toHaveBeenCalledWith('people')

    fireEvent.click(screen.getByTestId('mobile-bottom-nav-more'))
    expect(onOpenMenu).toHaveBeenCalledTimes(1)
  })

  it('shows the sync indicator only when a status is given', () => {
    const { rerender } = render(
      <MemoryRouter>
        <MobileBottomNav
          items={items}
          currentView="calendar"
          onNavigate={vi.fn()}
          onOpenMenu={vi.fn()}
        />
      </MemoryRouter>,
    )
    expect(
      screen.queryByTestId('mobile-bottom-nav-sync-dot'),
    ).not.toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <MobileBottomNav
          items={items}
          currentView="calendar"
          syncStatus="cloud"
          onNavigate={vi.fn()}
          onOpenMenu={vi.fn()}
        />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('mobile-bottom-nav-sync-dot')).toBeInTheDocument()
  })

})
