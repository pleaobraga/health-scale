import { MemoryRouter } from 'react-router-dom'

import { UserManagementView } from './user-management-view'
import { AuthContext } from '../context/auth-context'

import type { AuthContextType } from '../context/auth-context'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof UserManagementView> = {
  title: 'Pages/UserManagementView',
  component: UserManagementView,
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
      }

      return (
        <AuthContext value={mockAuth}>
          <MemoryRouter>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
              <Story />
            </div>
          </MemoryRouter>
        </AuthContext>
      )
    },
  ],
}

export default meta
type Story = StoryObj<typeof UserManagementView>;

export const DefaultView: Story = {}

