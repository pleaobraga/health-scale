import { DayEventsModal } from './day-events-modal'
import { useScheduleStore } from '../../store/use-schedule-store'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof DayEventsModal> = {
  title: 'Modals/DayEventsModal',
  component: DayEventsModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof DayEventsModal>;

export const WithEvents: Story = {
  render: () => {
    useScheduleStore.setState({
      selectedDateForEvents: '2026-10-12',
      currentMonth: '2026-10',
      persons: [
        { id: 'p1', name: 'Dra. Camila Santos', color: '#10B981', active: true },
        { id: 'p2', name: 'Dr. Lucas Silva', color: '#3B82F6', active: true },
        { id: 'p3', name: 'Enf. Mariana Lima', color: '#F59E0B', active: true },
      ],
      monthParticipants: { '2026-10': ['p1', 'p2', 'p3'] },
      addresses: [
        {
          id: 'addr-1',
          name: 'Residência Dona Maria',
          street: 'Rua das Flores',
          number: '123',
          complement: 'Apto 45',
          neighborhood: 'Jardins',
          city: 'São Paulo',
        },
        {
          id: 'addr-2',
          name: 'Clínica de Cuidados Integrados Sul',
          street: 'Av. Santo Amaro',
          number: '2500',
          neighborhood: 'Moema',
          city: 'São Paulo',
        },
      ],
      assignments: {
        '2026-10-12': ['p1'],
      },
      events: [
        {
          id: 'ev-1',
          date: '2026-10-12',
          title: 'Plantão Especial de Enfermagem',
          time: '07:00',
          address: 'Residência Dona Maria\nRua das Flores, 123\nApto 45 - Jardins - São Paulo',
          personId: 'p1',
        },
        {
          id: 'ev-2',
          date: '2026-10-12',
          title: 'Reunião com Direção Hospitalar',
          time: '14:30',
          personId: 'p2',
        },
      ],
    })
    return <DayEventsModal />
  },
}

export const WithoutEvents: Story = {
  render: () => {
    useScheduleStore.setState({
      selectedDateForEvents: '2026-10-15',
      events: [],
    })
    return <DayEventsModal />
  },
}

