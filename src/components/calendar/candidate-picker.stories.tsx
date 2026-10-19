import { CandidatePicker } from './candidate-picker';

import type { Person } from '../../types';
import type { Meta, StoryObj } from '@storybook/react-vite';

const mockPersons: Person[] = [
  { id: 'p1', name: 'Dra. Camila Santos', color: '#3b82f6' },
  { id: 'p2', name: 'Dr. Lucas Oliveira', color: '#10b981' },
  { id: 'p3', name: 'Enf. Beatriz Lima', color: '#8b5cf6' },
  { id: 'p4', name: 'Dr. Rodrigo Souza', color: '#f97316' },
];

const meta: Meta<typeof CandidatePicker> = {
  title: 'Calendar/CandidatePicker',
  component: CandidatePicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="pt-40 pb-8 flex justify-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CandidatePicker>;

export const Default: Story = {
  args: {
    dateStr: '2026-10-15',
    dayNumber: 15,
    month: '2026-10',
    assignedPersonIds: ['p1'],
    allPersons: mockPersons,
    isPersonAvailable: (id) => id === 'p2' || id === 'p3',
    onSelectPerson: (id) => console.log('Selected person:', id),
  },
};

