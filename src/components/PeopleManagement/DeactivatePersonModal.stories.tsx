import type { Meta, StoryObj } from '@storybook/react-vite';
import { DeactivatePersonModal } from './DeactivatePersonModal';

const meta: Meta<typeof DeactivatePersonModal> = {
  title: 'PeopleManagement/DeactivatePersonModal',
  component: DeactivatePersonModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DeactivatePersonModal>;

export const Default: Story = {
  args: {
    isOpen: true,
    person: {
      id: 'p-1',
      name: 'Dr. Lucas Medeiros',
      color: '#10b981',
      active: true,
    },
    onClose: () => {},
    onConfirm: () => {},
  },
};

