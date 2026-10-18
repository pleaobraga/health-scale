import { ConfirmOverwriteModal } from './ConfirmOverwriteModal';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof ConfirmOverwriteModal> = {
  title: 'Import/ConfirmOverwriteModal',
  component: ConfirmOverwriteModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    isOpen: true,
    isRestoring: false,
    onConfirm: () => alert('Confirmado!'),
    onCancel: () => alert('Cancelado!'),
  },
};

export default meta;
type Story = StoryObj<typeof ConfirmOverwriteModal>;

export const DefaultOpen: Story = {};

export const RestoringState: Story = {
  args: {
    isRestoring: true,
  },
};

