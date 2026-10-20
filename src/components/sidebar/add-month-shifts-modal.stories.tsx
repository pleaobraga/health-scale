import { AddMonthShiftsModal } from './add-month-shifts-modal'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof AddMonthShiftsModal> = {
  title: 'Sidebar/AddMonthShiftsModal',
  component: AddMonthShiftsModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof AddMonthShiftsModal>;

export const DefaultOpen: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Closed modal'),
    currentMonth: '2026-10',
    allShifts: [
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
    currentShiftIds: ['shift_d12'],
    onAddShifts: (ids) => console.log('Added shifts:', ids),
    onGoToGlobalManagement: () => console.log('Go to global management'),
  },
}

export const AllAlreadyLinked: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Closed modal'),
    currentMonth: '2026-10',
    allShifts: [
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
    currentShiftIds: ['shift_d12'],
    onAddShifts: (ids) => console.log('Added shifts:', ids),
  },
}
