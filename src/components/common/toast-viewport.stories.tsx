import { useEffect } from 'react'

import { ToastViewport } from './toast-viewport'
import { useToastStore } from '../../store/use-toast-store'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof ToastViewport> = {
  title: 'Common/ToastViewport',
  component: ToastViewport,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof ToastViewport>

export const AllTypes: Story = {
  render: () => {
    useEffect(() => {
      useToastStore.setState({
        toasts: [
          { id: 'success', type: 'success', message: 'Escala salva e sincronizada com a nuvem.' },
          { id: 'error', type: 'error', message: 'Sem conexão com a internet. Os dados locais não foram alterados.' },
          { id: 'info', type: 'info', message: 'Sincronizando dados...' },
        ],
      })
    }, [])
    return (
      <div className="min-h-[320px] bg-slate-100 dark:bg-slate-950">
        <ToastViewport />
      </div>
    )
  },
}

export const Interactive: Story = {
  render: () => {
    const { showToast } = useToastStore()
    return (
      <div className="min-h-[320px] p-8 flex gap-2 bg-slate-100 dark:bg-slate-950">
        <button
          type="button"
          onClick={() => showToast('success', 'Dados da nuvem carregados neste dispositivo.')}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold"
        >
          Sucesso
        </button>
        <button
          type="button"
          onClick={() => showToast('error', 'Não foi possível enviar os dados para a nuvem.')}
          className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-bold"
        >
          Erro
        </button>
        <ToastViewport />
      </div>
    )
  },
}
