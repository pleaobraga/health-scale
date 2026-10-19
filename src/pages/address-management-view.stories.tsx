import { MemoryRouter } from 'react-router-dom'

import { AddressManagementView } from './address-management-view'
import { useScheduleStore } from '../store/use-schedule-store'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof AddressManagementView> = {
  title: 'Pages/AddressManagementView',
  component: AddressManagementView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="h-screen flex bg-slate-50 dark:bg-slate-950">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof AddressManagementView>;

export const WithRegisteredAddresses: Story = {
  render: () => {
    useScheduleStore.setState({
      addresses: [
        {
          id: 'addr-1',
          name: 'Residência Principal Dona Maria',
          street: 'Rua das Flores',
          number: '123',
          complement: 'Apto 45, Bloco B',
          neighborhood: 'Jardim Paulista',
          city: 'São Paulo',
        },
        {
          id: 'addr-2',
          name: 'Clínica de Cuidados Integrados Sul',
          street: 'Avenida Santo Amaro',
          number: '2500',
          neighborhood: 'Moema',
          city: 'São Paulo',
        },
        {
          id: 'addr-3',
          name: 'Hospital São Lucas - Plantão Externo',
          street: 'Rua Bela Cintra',
          number: '800',
          city: 'São Paulo',
        },
      ],
    })
    return <AddressManagementView />
  },
}

export const EmptyState: Story = {
  render: () => {
    useScheduleStore.setState({
      addresses: [],
    })
    return <AddressManagementView />
  },
}

