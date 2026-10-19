import { CreateUserModal } from './CreateUserModal';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof CreateUserModal> = {
  title: 'Users/CreateUserModal',
  component: CreateUserModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CreateUserModal>;

export const DefaultOpen: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close CreateUserModal'),
    onUserCreated: () => console.log('User created callback'),
  },
};

