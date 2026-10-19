import { PersonModal } from './person-modal'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof PersonModal> = {
  title: 'Sidebar/PersonModal',
  component: PersonModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof PersonModal>;

export const AddNewPerson: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Closed modal'),
    personToEdit: null,
    currentMonth: '2026-10',
    initialAvailableDays: [],
    onSave: (name, color, days) => console.log('Save person:', { name, color, days }),
  },
}

export const EditExistingPerson: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Closed modal'),
    personToEdit: {
      id: 'p1',
      name: 'Dra. Camila Santos',
      color: '#3b82f6',
    },
    currentMonth: '2026-10',
    initialAvailableDays: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31],
    onSave: (name, color, days) => console.log('Save person:', { name, color, days }),
    onDelete: (id) => console.log('Delete person:', id),
  },
}

