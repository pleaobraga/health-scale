import { MemoryRouter } from 'react-router-dom'

import { HoverSidebar } from './hover-sidebar'
import { AuthProvider } from '../../context/auth-context'
import { useScheduleStore } from '../../store/use-schedule-store'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { User } from 'firebase/auth'

const meta: Meta<typeof HoverSidebar> = {
  title: 'Navigation/HoverSidebar',
  component: HoverSidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/']}>
        <div className="h-screen flex bg-slate-100 dark:bg-slate-950">
          <Story />
          <div className="flex-1 p-6 text-slate-600 dark:text-slate-400">
            <p className="text-sm">Passe o mouse sobre a barra lateral à esquerda para expandir.</p>
          </div>
        </div>
      </MemoryRouter>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof HoverSidebar>;

export const CalendarViewActive: Story = {
  render: () => {
    useScheduleStore.setState({ currentView: 'calendar', isDarkMode: false })
    return <HoverSidebar />
  },
}

export const PeopleViewActive: Story = {
  render: () => {
    useScheduleStore.setState({ currentView: 'people', isDarkMode: false })
    return <HoverSidebar />
  },
}

export const ImportViewActive: Story = {
  render: () => {
    useScheduleStore.setState({ currentView: 'import', isDarkMode: false })
    return <HoverSidebar />
  },
}

export const DarkMode: Story = {
  render: () => {
    useScheduleStore.setState({ currentView: 'calendar', isDarkMode: true })
    return <HoverSidebar />
  },
}

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => {
    useScheduleStore.setState({ currentView: 'calendar', isDarkMode: false })
    return <HoverSidebar />
  },
}

export const AdminInProduction: Story = {
  render: () => {
    useScheduleStore.setState({ currentView: 'calendar', isDarkMode: false })
    return (
      <AuthProvider
        value={{
          user: {
            uid: 'admin_demo',
            email: 'admin@healthscale.com',
            displayName: 'Admin User',
          } as unknown as User,
          role: 'admin',
          isAdmin: true,
          isGuest: false,
        }}
      >
        <HoverSidebar isProdOverride={true} />
      </AuthProvider>
    )
  },
}

