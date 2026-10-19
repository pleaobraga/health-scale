import { createContext, use } from 'react'

import type { GuestProfile } from '../types'
import type { User } from 'firebase/auth'

export type UserRole = 'admin' | 'user';

export interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAdmin: boolean;
  isGuest: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsGuest: (name: string, existingId?: string) => Promise<void>;
  logout: () => Promise<void>;
  guestProfiles: GuestProfile[];
  deleteGuestProfile: (id: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const context = use(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
