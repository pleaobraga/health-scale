import type { Meta, StoryObj } from '@storybook/react-vite';
import { HoverSidebar } from './HoverSidebar';
import { useScheduleStore } from '../../store/useScheduleStore';

const meta: Meta<typeof HoverSidebar> = {
  title: 'Navigation/HoverSidebar',
  component: HoverSidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="h-screen flex bg-slate-100 dark:bg-slate-950">
        <Story />
        <div className="flex-1 p-6 text-slate-600 dark:text-slate-400">
          <p className="text-sm">Passe o mouse sobre a barra lateral à esquerda para expandir.</p>
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HoverSidebar>;

export const CalendarViewActive: Story = {
  render: () => {
    useScheduleStore.setState({ currentView: 'calendar', isDarkMode: false });
    return <HoverSidebar />;
  },
};

export const PeopleViewActive: Story = {
  render: () => {
    useScheduleStore.setState({ currentView: 'people', isDarkMode: false });
    return <HoverSidebar />;
  },
};

export const ImportViewActive: Story = {
  render: () => {
    useScheduleStore.setState({ currentView: 'import', isDarkMode: false });
    return <HoverSidebar />;
  },
};

export const DarkMode: Story = {
  render: () => {
    useScheduleStore.setState({ currentView: 'calendar', isDarkMode: true });
    return <HoverSidebar />;
  },
};

