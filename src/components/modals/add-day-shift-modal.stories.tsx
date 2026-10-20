import { fn } from 'storybook/test'

import { AddDayShiftModal } from './add-day-shift-modal'

import type { Person, ShiftDefinition } from '../../types'
import type { Meta, StoryObj } from '@storybook/react-vite'

const mockPersons: Person[] = [
  { id: 'p1', name: 'Dr. Lucas Ferreira', color: '#3b82f6', active: true },
  { id: 'p2', name: 'Dra. Beatriz Santos', color: '#ec4899', active: true },
  { id: 'p3', name: 'Dr. Carlos Eduardo', color: '#10b981', active: true },
]

const mockShifts: ShiftDefinition[] = [
  {
    id: 'shift-d12',
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
    id: 'shift-n12',
    name: 'Plantão Noturno 12h',
    code: 'N12',
    startTime: '19:00',
    durationHours: 12,
    color: '#8B5CF6',
    enabledByDefault: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
]

const meta: Meta<typeof AddDayShiftModal> = {
  title: 'Modals/AddDayShiftModal',
  component: AddDayShiftModal,
  tags: ['autodocs'],
  args: {
    isOpen: true,
    onClose: fn(),
    dateStr: '2026-10-15',
    formattedDate: '15 de Outubro de 2026',
    dayNumber: 15,
    activeShifts: mockShifts,
    allPersons: mockPersons,
    monthPersons: mockPersons,
    isPersonAvailable: () => true,
    onAssignPersonToShift: fn(),
  },
}

export default meta
type Story = StoryObj<typeof AddDayShiftModal>;

export const VacantAndAssignedShifts: Story = {
  args: {
    dayShiftMap: {
      'shift-d12': 'p1',
    },
  },
}

export const AllShiftsVacant: Story = {
  args: {
    dayShiftMap: {},
  },
}

