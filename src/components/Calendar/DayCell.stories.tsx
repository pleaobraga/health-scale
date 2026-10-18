import { DayCell } from './DayCell';

import type { Person } from '../../types';
import type { CalendarDayInfo } from '../../utils/dateUtils';
import type { Meta, StoryObj } from '@storybook/react-vite';

const mockPersons: Person[] = [
  { id: 'p1', name: 'Dra. Camila Santos', color: '#3b82f6' },
  { id: 'p2', name: 'Dr. Lucas Oliveira', color: '#10b981' },
  { id: 'p3', name: 'Enf. Beatriz Lima', color: '#8b5cf6' },
];

const baseDayInfo: CalendarDayInfo = {
  date: new Date(2026, 9, 15),
  dateStr: '2026-10-15',
  dayNumber: 15,
  isCurrentMonth: true,
  isToday: false,
  dayOfWeek: 4,
};

const meta: Meta<typeof DayCell> = {
  title: 'Calendar/DayCell',
  component: DayCell,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-52 border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DayCell>;

export const ReadingModeAssigned: Story = {
  args: {
    dayInfo: baseDayInfo,
    currentMonth: '2026-10',
    isEditMode: false,
    assignedPersonIds: ['p1'],
    allPersons: mockPersons,
    events: [],
    highlightedPerson: null,
    isHighlightedPersonAvailable: false,
    isPersonAvailable: () => true,
    onOpenEvents: () => {},
    onRemovePerson: () => {},
    onAddPerson: () => {},
  },
};

export const WithEventsRedDayNumber: Story = {
  args: {
    ...ReadingModeAssigned.args,
    dayInfo: { ...baseDayInfo, dayNumber: 12 },
    events: [
      { id: 'ev-1', date: '2026-10-12', title: 'Feriado Nacional - Plantão Especial' },
      { id: 'ev-2', date: '2026-10-12', title: 'Reunião de Alinhamento', time: '14:00' },
    ],
  },
};

export const EmptyDay: Story = {
  args: {
    ...ReadingModeAssigned.args,
    assignedPersonIds: [],
  },
};

export const AllocationConflict: Story = {
  args: {
    ...ReadingModeAssigned.args,
    assignedPersonIds: ['p1', 'p2'],
  },
};

export const EditModeWithCandidates: Story = {
  args: {
    ...ReadingModeAssigned.args,
    isEditMode: true,
    assignedPersonIds: ['p1', 'p2', 'p3'],
  },
};

export const HighlightedAvailability: Story = {
  args: {
    ...ReadingModeAssigned.args,
    assignedPersonIds: [],
    highlightedPerson: mockPersons[0],
    isHighlightedPersonAvailable: true,
  },
};

export const TodayHighlighted: Story = {
  args: {
    ...ReadingModeAssigned.args,
    dayInfo: {
      ...baseDayInfo,
      isToday: true,
    },
  },
};

