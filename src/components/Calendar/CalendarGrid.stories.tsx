import { CalendarGrid } from './CalendarGrid';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof CalendarGrid> = {
  title: 'Calendar/CalendarGrid',
  component: CalendarGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-6xl mx-auto min-h-[600px] flex flex-col">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CalendarGrid>;

export const Default: Story = {};

