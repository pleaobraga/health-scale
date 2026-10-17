import type { Meta, StoryObj } from '@storybook/react-vite';
import { ImportView } from './ImportView';
import { useScheduleStore } from '../../store/useScheduleStore';

const meta: Meta<typeof ImportView> = {
  title: 'Import/ImportView',
  component: ImportView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="h-screen flex bg-slate-50 dark:bg-slate-950">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ImportView>;

export const DefaultEmptyState: Story = {
  render: () => {
    useScheduleStore.setState({ currentView: 'import' });
    return <ImportView />;
  },
};

