import { CalendarHeader } from './calendar-header'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof CalendarHeader> = {
  title: 'Calendar/CalendarHeader',
  component: CalendarHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-4xl mx-auto border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof CalendarHeader>;

export const Default: Story = {}

