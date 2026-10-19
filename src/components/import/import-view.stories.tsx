import { MemoryRouter } from 'react-router-dom';

import { ImportView } from './import-view';
import { useScheduleStore } from '../../store/use-schedule-store';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof ImportView> = {
  title: 'Import/ImportView',
  component: ImportView,
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
};

export default meta;
type Story = StoryObj<typeof ImportView>;

export const DefaultEmptyState: Story = {
  render: () => {
    useScheduleStore.setState({ currentView: 'import' });
    return <ImportView />;
  },
};

