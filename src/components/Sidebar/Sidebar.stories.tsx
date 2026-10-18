import { Sidebar } from './Sidebar';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Sidebar> = {
  title: 'Sidebar/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="h-[600px] w-80 border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {};

