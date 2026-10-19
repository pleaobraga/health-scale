import { MemoryRouter } from 'react-router-dom'

import { CalendarView } from './calendar-view'
import { useScheduleStore } from '../../store/use-schedule-store'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof CalendarView> = {
  title: 'Calendar/CalendarView',
  component: CalendarView,
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
type Story = StoryObj<typeof CalendarView>;

export const DefaultCalendar: Story = {
  render: () => {
    useScheduleStore.setState({
      currentMonth: '2026-10',
      persons: [
        { id: '1', name: 'Dr. Lucas Ferreira', color: '#3b82f6', active: true },
        { id: '2', name: 'Dra. Camila Santos', color: '#10b981', active: true },
      ],
      monthParticipants: {
        '2026-10': ['1', '2'],
      },
      assignments: {
        '2026-10-01': ['1'],
        '2026-10-02': ['2'],
      },
    })
    return <CalendarView />
  },
}
