import { useState } from 'react'

import { ConfirmClearLocalDataModal } from './confirm-clear-local-data-modal'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof ConfirmClearLocalDataModal> = {
  title: 'Settings/ConfirmClearLocalDataModal',
  component: ConfirmClearLocalDataModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof ConfirmClearLocalDataModal>

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true)
    return (
      <div className="p-8">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-bold"
        >
          Abrir Modal de Limpeza
        </button>
        <ConfirmClearLocalDataModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onConfirm={() => setIsOpen(false)}
        />
      </div>
    )
  },
}

export const ClearingState: Story = {
  args: {
    isOpen: true,
    isClearing: true,
    onClose: () => {},
    onConfirm: () => {},
  },
}

