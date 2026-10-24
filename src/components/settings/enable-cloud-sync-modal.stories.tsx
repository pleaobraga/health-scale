import { useState } from 'react'

import { EnableCloudSyncModal } from './enable-cloud-sync-modal'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof EnableCloudSyncModal> = {
  title: 'Settings/EnableCloudSyncModal',
  component: EnableCloudSyncModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof EnableCloudSyncModal>

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true)
    return (
      <div className="p-8">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold"
        >
          Ativar Sincronização
        </button>
        <EnableCloudSyncModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onChoose={() => setIsOpen(false)}
        />
      </div>
    )
  },
}

export const Pulling: Story = {
  args: {
    isOpen: true,
    pendingChoice: 'pull',
    onClose: () => {},
    onChoose: () => {},
  },
}
