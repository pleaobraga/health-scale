import { CalendarDays, Clock, Settings, Users } from 'lucide-react'
import { MemoryRouter } from 'react-router-dom'

import { MobileBottomNav } from './mobile-bottom-nav'

import type { MobileBottomNavItem } from './mobile-bottom-nav'
import type { Meta, StoryObj } from '@storybook/react-vite'

const items: MobileBottomNavItem[] = [
  { id: 'calendar', path: '/', label: 'Escala', icon: CalendarDays, end: true },
  { id: 'people', path: '/pessoas', label: 'Pessoas', icon: Users },
  { id: 'shifts', path: '/turnos', label: 'Turnos', icon: Clock },
  { id: 'settings', path: '/configuracoes', label: 'Ajustes', icon: Settings },
]

const meta: Meta<typeof MobileBottomNav> = {
  title: 'Navigation/MobileBottomNav',
  component: MobileBottomNav,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'mobile1' },
  },
  args: {
    items,
    currentView: 'calendar',
    onNavigate: () => {},
    onOpenMenu: () => {},
  },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/']}>
        <div className="h-screen bg-slate-100 dark:bg-slate-950">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof MobileBottomNav>

export const CalendarActive: Story = {}

export const AdminCloudSync: Story = {
  args: { syncStatus: 'cloud' },
}

export const AdminLocalOnly: Story = {
  args: { syncStatus: 'local' },
}

export const MenuOpen: Story = {
  args: { isMenuOpen: true },
}
