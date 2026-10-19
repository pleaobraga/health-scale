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
      events: [
        {
          id: 'ev-1',
          date: '2026-10-12',
          title: 'Feriado Nacional - Plantão Especial',
          time: '07:00',
          description: 'Protocolo de atendimento com equipe dobrada.',
        },
        {
          id: 'ev-2',
          date: '2026-10-12',
          title: 'Reunião com Direção Hospitalar',
          time: '14:30',
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

