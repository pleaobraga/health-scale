import { fn } from 'storybook/test'

import { ConfirmOverwriteModal } from './confirm-overwrite-modal'

import type { Meta, StoryObj } from '@storybook/react-vite'

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
    onConfirm: fn(),
    onCancel: fn(),
  },
}

export default meta
type Story = StoryObj<typeof ConfirmOverwriteModal>;

export const DefaultOpen: Story = {}

export const RestoringState: Story = {
  args: {
    isRestoring: true,
  },
}

