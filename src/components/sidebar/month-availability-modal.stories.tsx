import { fn } from 'storybook/test'

import { MonthAvailabilityModal } from './month-availability-modal'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof MonthAvailabilityModal> = {
  title: 'Sidebar/MonthAvailabilityModal',
  component: MonthAvailabilityModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof MonthAvailabilityModal>;

export const DefaultOpen: Story = {
  args: {
    isOpen: true,
    onClose: fn(),
    person: {
      id: 'person-1',
      name: 'Dra. Camila Santos',
      color: '#3b82f6',
    },
    currentMonth: '2026-10',
    initialAvailableDays: [2, 4, 6, 8, 10, 12, 14, 16],
    onSave: fn(),
  },
}

export const MultiShiftWithRates: Story = {
  args: {
    isOpen: true,
    onClose: fn(),
    person: {
      id: 'person-2',
      name: 'Dr. Lucas Ferreira',
      color: '#10b981',
    },
    currentMonth: '2026-10',
    initialAvailableDays: [1, 2, 3, 4, 5, 6, 7],
    activeShifts: [
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
    initialShiftAvailability: {
      shift_d12: [1, 2, 3, 4, 5],
      shift_n12: [6, 7],
    },
    initialShiftRates: {
      shift_d12: {
        1: 300,
        2: 300,
        3: 300,
        4: 300,
        5: 300,
      },
      shift_n12: {
        6: 450,
        7: 450,
      },
    },
    onSave: fn(),
  },
}
