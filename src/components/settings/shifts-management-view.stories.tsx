import { ShiftsManagementView } from './shifts-management-view'
import { useScheduleStore } from '../../store/use-schedule-store'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof ShiftsManagementView> = {
  title: 'Settings/ShiftsManagementView',
  component: ShiftsManagementView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-6xl mx-auto">
          <Story />
        </div>
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ShiftsManagementView>;

export const WithShiftDefinitions: Story = {
  render: () => {
    useScheduleStore.setState({
      shiftDefinitions: [
        {
          id: 'shift-1',
          name: 'Plantão Diurno 12h',
          code: 'D12',
          startTime: '07:00',
          durationHours: 12,
          color: '#3B82F6',
          enabledByDefault: true,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
        {
          id: 'shift-2',
          name: 'Plantão Noturno 12h',
          code: 'N12',
          startTime: '19:00',
          durationHours: 12,
          color: '#8B5CF6',
          enabledByDefault: true,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
        {
          id: 'shift-3',
          name: 'Plantão Integral 24h',
          code: 'P24',
          startTime: '07:00',
          durationHours: 24,
          color: '#10B981',
          enabledByDefault: false,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      ],
    })
    return <ShiftsManagementView />
  },
}

export const EmptyState: Story = {
  render: () => {
    useScheduleStore.setState({
      shiftDefinitions: [],
    })
    return <ShiftsManagementView />
  },
}

