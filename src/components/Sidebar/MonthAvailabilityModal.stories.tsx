import { MonthAvailabilityModal } from './MonthAvailabilityModal';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof MonthAvailabilityModal> = {
  title: 'Sidebar/MonthAvailabilityModal',
  component: MonthAvailabilityModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof MonthAvailabilityModal>;

export const DefaultOpen: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Closed modal'),
    person: {
      id: 'person-1',
      name: 'Dra. Camila Santos',
      color: '#3b82f6',
    },
    currentMonth: '2026-10',
    initialAvailableDays: [2, 4, 6, 8, 10, 12, 14, 16],
    onSave: (personId, days) => console.log('Saved availability:', { personId, days }),
  },
};

