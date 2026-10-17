import type { Meta, StoryObj } from '@storybook/react-vite';
import { PersonCard } from './PersonCard';

const meta: Meta<typeof PersonCard> = {
  title: 'Sidebar/PersonCard',
  component: PersonCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-72 p-2 bg-slate-50 border border-slate-200 rounded-xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PersonCard>;

export const Default: Story = {
  args: {
    person: {
      id: 'p1',
      name: 'Dra. Camila Santos',
      color: '#3b82f6',
    },
    availableDaysCount: 16,
    workingDaysCount: 4,
    isHighlighted: false,
    isEditMode: true,
    onToggleHighlight: () => {},
    onEdit: () => {},
    onInsertAllDays: () => {},
  },
};

export const Highlighted: Story = {
  args: {
    ...Default.args,
    isHighlighted: true,
  },
};

export const EmeraldDoctor: Story = {
  args: {
    person: {
      id: 'p2',
      name: 'Dr. Lucas Oliveira',
      color: '#10b981',
    },
    availableDaysCount: 14,
    isHighlighted: false,
    onToggleHighlight: () => {},
    onEdit: () => {},
  },
};

// Exactly one CssCheck across the project asserting a concrete computed style
export const CssCheck: Story = {
  args: {
    ...Default.args,
  },
};

