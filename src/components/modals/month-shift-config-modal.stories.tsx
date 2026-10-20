import { MonthShiftConfigModal } from './month-shift-config-modal'
import { useScheduleStore } from '../../store/use-schedule-store'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof MonthShiftConfigModal> = {
  title: 'Modals/MonthShiftConfigModal',
  component: MonthShiftConfigModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof MonthShiftConfigModal>;

export const DefaultOpen: Story = {
  render: () => {
    useScheduleStore.setState({
      shiftDefinitions: [
        {
          id: 'shift_d12',
          name: 'Plantão Diurno 12h',
          code: 'D12',
          startTime: '07:00',
          durationHours: 12,
          color: '#3b82f6',
          enabledByDefault: true,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
        {
          id: 'shift_n12',
          name: 'Plantão Noturno 12h',
          code: 'N12',
          startTime: '19:00',
          durationHours: 12,
          color: '#8b5cf6',
          enabledByDefault: true,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
        {
          id: 'shift_p24',
          name: 'Plantão 24h',
          code: '24H',
          startTime: '07:00',
          durationHours: 24,
          color: '#10b981',
          enabledByDefault: true,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      ],
      monthDailyShifts: {
        '2026-10': {
          shift_d12: [1, 2, 3, 4, 5],
          shift_n12: [1, 2, 3, 4, 5],
          shift_p24: [6, 7, 13, 14],
        },
      },
    })

    return (
      <MonthShiftConfigModal
        isOpen={true}
        onClose={() => console.log('Closed modal')}
        currentMonth="2026-10"
      />
    )
  },
}

export const EmptyConfiguration: Story = {
  render: () => {
    useScheduleStore.setState({
      shiftDefinitions: [
        {
          id: 'shift_d12',
          name: 'Plantão Diurno 12h',
          code: 'D12',
          startTime: '07:00',
          durationHours: 12,
          color: '#3b82f6',
          enabledByDefault: true,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      ],
      monthDailyShifts: {
        '2026-10': {},
      },
    })

    return (
      <MonthShiftConfigModal
        isOpen={true}
        onClose={() => console.log('Closed modal')}
        currentMonth="2026-10"
      />
    )
  },
}
