import { LanguageSelector } from './language-selector'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof LanguageSelector> = {
  title: 'Common/LanguageSelector',
  component: LanguageSelector,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof LanguageSelector>

export const FullVariant: Story = {
  render: () => (
    <div className="w-64 p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl">
      <LanguageSelector variant="full" align="top" />
    </div>
  ),
}

export const CompactVariant: Story = {
  render: () => (
    <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl flex justify-center">
      <LanguageSelector variant="compact" align="top" />
    </div>
  ),
}

