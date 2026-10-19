import { MemoryRouter } from 'react-router-dom';

import { SettingsView } from './settings-view';
import { AuthContext } from '../../context/auth-context';
import { useScheduleStore } from '../../store/use-schedule-store';

import type { AuthContextType } from '../../context/auth-context';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof SettingsView> = {
  title: 'Settings/SettingsView',
  component: SettingsView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => {
      const mockAuth: AuthContextType = {
        user: {
          uid: 'admin-1',
          email: 'admin@healthscale.com',
        } as unknown as AuthContextType['user'],
        role: 'admin',
        isAdmin: true,
        isGuest: false,
        loading: false,
        login: async () => {},
        loginAsGuest: async () => {},
        logout: async () => {},
        guestProfiles: [],
        deleteGuestProfile: () => {},
      };

      return (
        <AuthContext value={mockAuth}>
          <MemoryRouter>
            <div className="h-screen flex bg-slate-50 dark:bg-slate-950">
              <Story />
            </div>
          </MemoryRouter>
        </AuthContext>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof SettingsView>;

export const DefaultSettings: Story = {
  render: () => {
    useScheduleStore.setState({
      persons: [
        { id: '1', name: 'Dr. Lucas Ferreira', color: '#3b82f6', active: true },
      ],
      assignments: {},
      events: [],
    });
    return <SettingsView />;
  },
};
