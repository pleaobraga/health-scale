import type { Meta, StoryObj } from '@storybook/react-vite';
import { FullScreenCalendarModal } from './FullScreenCalendarModal';
import { useScheduleStore } from '../../store/useScheduleStore';

const meta: Meta<typeof FullScreenCalendarModal> = {
  title: 'Modals/FullScreenCalendarModal',
  component: FullScreenCalendarModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof FullScreenCalendarModal>;

export const DefaultOpen: Story = {
  render: () => {
    useScheduleStore.setState({
      isFullScreenModalOpen: true,
      currentMonth: '2026-10',
      persons: [
        { id: '1', name: 'Dr. Lucas Silva', color: '#3B82F6' },
        { id: '2', name: 'Dra. Camila Santos', color: '#10B981' },
        { id: '3', name: 'Dr. Rafael Costa', color: '#F59E0B' },
      ],
      assignments: {
        '2026-10-01': ['1'],
        '2026-10-02': ['2'],
        '2026-10-03': ['3'],
        '2026-10-12': ['1', '2'], // conflict
      },
      events: [
        {
          id: 'ev-1',
          date: '2026-10-12',
          title: 'Feriado de Nossa Senhora Aparecida',
        },
      ],
    });
    return <FullScreenCalendarModal />;
  },
};

