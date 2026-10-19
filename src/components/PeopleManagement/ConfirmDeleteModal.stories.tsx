import { ConfirmDeleteModal } from './ConfirmDeleteModal';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof ConfirmDeleteModal> = {
  title: 'PeopleManagement/ConfirmDeleteModal',
  component: ConfirmDeleteModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ConfirmDeleteModal>;

export const DefaultOpen: Story = {
  args: {
    isOpen: true,
    person: {
      id: 'person-1',
      name: 'Dr. Lucas Ferreira',
      color: '#3b82f6',
    },
    onClose: () => console.log('Closed modal'),
    onConfirm: () => console.log('Confirmed delete'),
  },
};

