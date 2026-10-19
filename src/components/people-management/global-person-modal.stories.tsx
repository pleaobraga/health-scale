import { GlobalPersonModal } from './global-person-modal'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof GlobalPersonModal> = {
  title: 'PeopleManagement/GlobalPersonModal',
  component: GlobalPersonModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof GlobalPersonModal>;

export const AddNew: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Closed modal'),
    personToEdit: null,
    onSave: (name, color) => console.log('Save person:', { name, color }),
  },
}

export const EditExisting: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Closed modal'),
    personToEdit: {
      id: 'p-1',
      name: 'Dra. Beatriz Lima',
      color: '#10b981',
    },
    onSave: (name, color) => console.log('Save person:', { name, color }),
  },
}

