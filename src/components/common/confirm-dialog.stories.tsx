import { useState } from 'react'
import { fn } from 'storybook/test'

import { ConfirmDialog } from './confirm-dialog'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Common/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    isOpen: true,
    onConfirm: fn(),
    onCancel: fn(),
  },
}

export default meta
type Story = StoryObj<typeof ConfirmDialog>

export const Danger: Story = {
  args: {
    title: 'Limpar Mês',
    description: 'Deseja realmente limpar todas as escalas de outubro de 2026?',
    confirmLabel: 'Limpar Mês',
    variant: 'danger',
  },
}

export const Warning: Story = {
  args: {
    title: 'Substituir dados',
    description: 'Os dados atuais deste dispositivo serão substituídos.',
    confirmLabel: 'Confirmar',
    variant: 'warning',
  },
}

export const Busy: Story = {
  args: {
    ...Danger.args,
    isBusy: true,
  },
}

export const Interactive: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false)
    return (
      <div className="p-8">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-bold"
        >
          Abrir confirmação
        </button>
        <ConfirmDialog
          {...args}
          {...Danger.args}
          isOpen={isOpen}
          onConfirm={() => setIsOpen(false)}
          onCancel={() => setIsOpen(false)}
        />
      </div>
    )
  },
}
