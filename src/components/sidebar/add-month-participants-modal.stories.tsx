import { AddMonthParticipantsModal } from './add-month-participants-modal';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof AddMonthParticipantsModal> = {
  title: 'Sidebar/AddMonthParticipantsModal',
  component: AddMonthParticipantsModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof AddMonthParticipantsModal>;

export const DefaultOpen: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Closed modal'),
    currentMonth: '2026-10',
    allPersons: [
      { id: '1', name: 'Dr. Lucas Ferreira', color: '#3b82f6', active: true },
      { id: '2', name: 'Dra. Camila Santos', color: '#10b981', active: true },
      { id: '3', name: 'Enf. Roberto Souza', color: '#f59e0b', active: true },
    ],
    currentParticipantIds: ['1'],
    onAddParticipants: (ids) => console.log('Added participants:', ids),
  },
};

