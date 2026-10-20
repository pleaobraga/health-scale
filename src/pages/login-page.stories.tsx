import { MemoryRouter } from 'react-router-dom'
import { fn } from 'storybook/test'

import { LoginPage } from './login-page'
import { AuthContext } from '../context/auth-context'

import type { AuthContextType } from '../context/auth-context'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof LoginPage> = {
  title: 'Pages/LoginPage',
  component: LoginPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof LoginPage>;

export const DefaultLogin: Story = {
  decorators: [
    (Story) => {
      const mockAuth: AuthContextType = {
        user: null,
        role: null,
        isAdmin: false,
        isGuest: false,
        loading: false,
        login: fn(async () => {}),
        loginAsGuest: fn(async () => {}),
        logout: fn(async () => {}),
        guestProfiles: [],
        deleteGuestProfile: fn(),
      }

      return (
        <AuthContext value={mockAuth}>
          <MemoryRouter>
            <Story />
          </MemoryRouter>
        </AuthContext>
      )
    },
  ],
}

export const WithGuestProfiles: Story = {
  decorators: [
    (Story) => {
      const mockAuth: AuthContextType = {
        user: null,
        role: null,
        isAdmin: false,
        isGuest: false,
        loading: false,
        login: fn(async () => {}),
        loginAsGuest: fn(async () => {}),
        logout: fn(async () => {}),
        guestProfiles: [
          {
            id: 'guest-1',
            name: 'Dr. Lucas Ferreira',
            createdAt: '2026-10-01T10:00:00Z',
            lastActiveAt: '2026-10-18T14:30:00Z',
          },
          {
            id: 'guest-2',
            name: 'Enf. Mariana Silva',
            createdAt: '2026-10-05T08:00:00Z',
            lastActiveAt: '2026-10-19T09:15:00Z',
          },
        ],
        deleteGuestProfile: fn(),
      }

      return (
        <AuthContext value={mockAuth}>
          <MemoryRouter>
            <Story />
          </MemoryRouter>
        </AuthContext>
      )
    },
  ],
}

