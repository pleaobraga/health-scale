import { PersonManagementCard } from './person-management-card';

import type { Person } from '../../types';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof PersonManagementCard> = {
  title: 'PeopleManagement/PersonManagementCard',
  component: PersonManagementCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-80 p-2">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PersonManagementCard>;

const mockActivePerson: Person = {
  id: 'p-1',
  name: 'Dra. Ana Paula Carvalho',
  color: '#3b82f6',
  active: true,
};

const mockInactivePerson: Person = {
  id: 'p-2',
  name: 'Dr. Roberto Souza',
  color: '#8b5cf6',
  active: false,
};

export const ActiveState: Story = {
  args: {
    person: mockActivePerson,
    monthsCount: 3,
    isInCurrentMonth: true,
    canDelete: false, // Has schedule history
    onEdit: () => {},
    onDeactivate: () => {},
    onDeleteRequest: () => {},
    onReactivate: () => {},
  },
};

export const InactiveStateWithHistory: Story = {
  args: {
    person: mockInactivePerson,
    monthsCount: 2,
    isInCurrentMonth: false,
    canDelete: false, // Inactive with historical assignments: permanent delete blocked
    onEdit: () => {},
    onDeactivate: () => {},
    onDeleteRequest: () => {},
    onReactivate: () => {},
  },
};

export const InactiveStateWithoutHistory: Story = {
  args: {
    person: { ...mockInactivePerson, name: 'Enf. Juliana Ramos' },
    monthsCount: 0,
    isInCurrentMonth: false,
    canDelete: true, // Inactive and 0 assignments: can be permanently deleted
    onEdit: () => {},
    onDeactivate: () => {},
    onDeleteRequest: () => {},
    onReactivate: () => {},
  },
};

