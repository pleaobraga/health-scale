import { fn } from 'storybook/test'

import { MonthPaymentsModal } from './month-payments-modal'
import { useScheduleStore } from '../../store/use-schedule-store'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof MonthPaymentsModal> = {
  title: 'Modals/MonthPaymentsModal',
  component: MonthPaymentsModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof MonthPaymentsModal>;

export const WithScheduledPayments: Story = {
  render: () => {
    useScheduleStore.setState({
      persons: [
        { id: 'p1', name: 'Dr. Lucas Ferreira', color: '#3b82f6', active: true },
        { id: 'p2', name: 'Dra. Beatriz Santos', color: '#ec4899', active: true },
        { id: 'p3', name: 'Dr. Carlos Eduardo', color: '#10b981', active: true },
      ],
      shiftDefinitions: [
        {
          id: 'shift_d12',
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
          id: 'shift_n12',
          name: 'Plantão Noturno 12h',
          code: 'N12',
          startTime: '19:00',
          durationHours: 12,
          color: '#8B5CF6',
          enabledByDefault: true,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      ],
      availabilities: [
        {
          personId: 'p1',
          month: '2026-10',
          availableDays: [1, 2, 3, 4, 5],
          shiftAvailability: {
            shift_d12: [1, 2, 3, 4, 5],
          },
          shiftRates: {
            shift_d12: { 1: 350, 2: 350, 3: 350, 4: 350, 5: 350 },
          },
        },
        {
          personId: 'p2',
          month: '2026-10',
          availableDays: [6, 7, 13, 14],
          shiftAvailability: {
            shift_n12: [6, 7, 13, 14],
          },
          shiftRates: {
            shift_n12: { 6: 500, 7: 500, 13: 500, 14: 500 },
          },
        },
      ],
      dayShiftAssignments: {
        '2026-10-01': { shift_d12: 'p1' },
        '2026-10-02': { shift_d12: 'p1' },
        '2026-10-03': { shift_d12: 'p1' },
        '2026-10-06': { shift_n12: 'p2' },
        '2026-10-07': { shift_n12: 'p2' },
      },
    })

    return (
      <MonthPaymentsModal
        isOpen={true}
        onClose={fn()}
        currentMonth="2026-10"
      />
    )
  },
}

export const EmptyMonth: Story = {
  render: () => {
    useScheduleStore.setState({
      persons: [],
      availabilities: [],
      dayShiftAssignments: {},
      assignments: {},
    })

    return (
      <MonthPaymentsModal
        isOpen={true}
        onClose={fn()}
        currentMonth="2026-10"
      />
    )
  },
}

