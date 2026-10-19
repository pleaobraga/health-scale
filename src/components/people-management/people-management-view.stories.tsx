import { MemoryRouter } from 'react-router-dom'

import { PeopleManagementView } from './people-management-view'
import { useScheduleStore } from '../../store/use-schedule-store'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof PeopleManagementView> = {
  title: 'PeopleManagement/PeopleManagementView',
  component: PeopleManagementView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="h-screen flex bg-slate-50 dark:bg-slate-950">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof PeopleManagementView>;

export const DefaultView: Story = {
  render: () => {
    useScheduleStore.setState({
      persons: [
        { id: '1', name: 'Dr. Lucas Ferreira', color: '#3b82f6', active: true },
        { id: '2', name: 'Dra. Camila Santos', color: '#10b981', active: true },
        { id: '3', name: 'Enf. Roberto Souza', color: '#f59e0b', active: false },
      ],
      currentMonth: '2026-10',
    })
    return <PeopleManagementView />
  },
}
