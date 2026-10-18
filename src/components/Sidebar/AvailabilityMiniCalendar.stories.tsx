import { AvailabilityMiniCalendar } from './AvailabilityMiniCalendar';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof AvailabilityMiniCalendar> = {
  title: 'Sidebar/AvailabilityMiniCalendar',
  component: AvailabilityMiniCalendar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AvailabilityMiniCalendar>;

export const DefaultOddDays: Story = {
  args: {
    month: '2026-10',
    selectedDays: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31],
    onChange: (days) => console.log('Days changed:', days),
    accentColor: '#3b82f6',
  },
};

export const EvenDaysEmerald: Story = {
  args: {
    month: '2026-10',
    selectedDays: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
    onChange: (days) => console.log('Days changed:', days),
    accentColor: '#10b981',
  },
};

export const EmptySelection: Story = {
  args: {
    month: '2026-10',
    selectedDays: [],
    onChange: (days) => console.log('Days changed:', days),
    accentColor: '#8b5cf6',
  },
};

