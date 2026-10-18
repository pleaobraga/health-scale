/* eslint-disable react-refresh/only-export-components */
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'

import {
  AuthContext,
  useAuth,
} from './authContextBase'
import { auth, db } from '../services/firebase'
import { StorageService } from '../services/storageService'
import { useScheduleStore } from '../store/useScheduleStore'

import type {
  AuthContextType,
  UserRole,
} from './authContextBase'
import type { GuestProfile } from '../types'
import type { User } from 'firebase/auth'

export { AuthContext, useAuth }
export type { AuthContextType, UserRole }

const createGuestUser = (profile: GuestProfile): User => {
  return {
    uid: profile.id,
    displayName: profile.name,
    email: null,
    isAnonymous: true,
  } as unknown as User
}

export interface AuthProviderProps {
  children: React.ReactNode
  /**
   * Optional context override for testing and storybook isolation.
   */
  value?: Partial<AuthContextType>
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  value,
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [isGuest, setIsGuest] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [guestProfiles, setGuestProfiles] = useState<GuestProfile[]>(() =>
    StorageService.getGuestProfiles()
  )

  useEffect(() => {
    // If an external value override is provided (e.g. in unit tests), bypass auth listener
    if (value && value.user !== undefined) {
      setUser(value.user)
      setRole(value.role ?? 'user')
      setIsGuest(value.isGuest ?? false)
      setLoading(value.loading ?? false)
      return
    }

    // Check if an active guest session exists in localStorage
    const activeGuestId = StorageService.getActiveGuestId()
    const profiles = StorageService.getGuestProfiles()
    setGuestProfiles(profiles)

    if (activeGuestId) {
      const activeProfile = profiles.find((p) => p.id === activeGuestId)
      if (activeProfile) {
        setUser(createGuestUser(activeProfile))
        setRole('user')
        setIsGuest(true)
        setLoading(false)
        return
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (!currentUser) {
          if (!StorageService.getActiveGuestId()) {
            setUser(null)
            setRole(null)
            setIsGuest(false)
          }
          setLoading(false)
          return
        }

        if (StorageService.getActiveGuestId()) {
          StorageService.setActiveGuestId(null)
        }
        setIsGuest(false)
        setUser(currentUser)

        // Retrieve user role dynamically from Firestore 'users' collection
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid))

          if (userDoc.exists()) {
            setRole(userDoc.data()?.role === 'admin' ? 'admin' : 'user')
          } else {
            // Se o documento ainda não existir, cria o registro inicial com role 'user'
            try {
              await setDoc(doc(db, 'users', currentUser.uid), {
                email: currentUser.email,
                role: 'user',
                displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuário',
                createdAt: new Date().toISOString(),
              })
            } catch {
              // Se falhar a criação por regras ou offline, mantém como 'user'
            }
            setRole('user')
          }
        } catch (err) {
          console.error('Failed to load user document from Firestore:', err)
          setRole('user')
        }
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [value])

  const login = async (email: string, password: string): Promise<void> => {
    if (StorageService.getActiveGuestId()) {
      StorageService.snapshotActiveGuest()
      StorageService.setActiveGuestId(null)
      StorageService.resetToDefault()
      useScheduleStore.getState().reloadFromStorage()
    }
    setIsGuest(false)
    await signInWithEmailAndPassword(auth, email, password)
  }

  const loginAsGuest = async (
    name: string,
    existingId?: string
  ): Promise<void> => {
    if (StorageService.getActiveGuestId()) {
      StorageService.snapshotActiveGuest()
    }

    const profiles = StorageService.getGuestProfiles()

    if (existingId) {
      const existing = profiles.find((p) => p.id === existingId)
      if (!existing) {
        throw new Error('Perfil de convidado não encontrado.')
      }

      const updatedProfile: GuestProfile = {
        ...existing,
        lastActiveAt: new Date().toISOString(),
      }
      const updatedProfiles = profiles.map((p) =>
        p.id === existingId ? updatedProfile : p
      )

      StorageService.saveGuestProfiles(updatedProfiles)
      StorageService.setActiveGuestId(existingId)

      const savedDataset = StorageService.getGuestDataset(existingId)
      if (savedDataset) {
        StorageService.restoreDataset(savedDataset)
      } else {
        StorageService.resetToDefault()
      }
      useScheduleStore.getState().reloadFromStorage()

      setGuestProfiles(updatedProfiles)
      setUser(createGuestUser(updatedProfile))
      setRole('user')
      setIsGuest(true)
      setLoading(false)
      return
    }

    const trimmed = name.trim()
    if (!trimmed) {
      throw new Error('Por favor, informe um nome para o convidado.')
    }

    const newId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const newProfile: GuestProfile = {
      id: newId,
      name: trimmed,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    }

    const updatedProfiles = [newProfile, ...profiles]
    StorageService.saveGuestProfiles(updatedProfiles)
    StorageService.setActiveGuestId(newId)
    StorageService.resetToDefault()
    StorageService.saveGuestDataset(newId, {
      persons: [],
      availabilities: [],
      assignments: {},
      events: [],
      monthParticipants: {},
    })
    useScheduleStore.getState().reloadFromStorage()

    setGuestProfiles(updatedProfiles)
    setUser(createGuestUser(newProfile))
    setRole('user')
    setIsGuest(true)
    setLoading(false)
  }

  const logout = async (): Promise<void> => {
    if (isGuest || StorageService.getActiveGuestId()) {
      StorageService.snapshotActiveGuest()
      StorageService.setActiveGuestId(null)
      StorageService.resetToDefault()
      useScheduleStore.getState().reloadFromStorage()
      setUser(null)
      setRole(null)
      setIsGuest(false)
      setGuestProfiles(StorageService.getGuestProfiles())
      return
    }
    await signOut(auth)
    setUser(null)
    setRole(null)
    setIsGuest(false)
  }

  const deleteGuestProfile = (id: string): void => {
    const profiles = StorageService.getGuestProfiles()
    const updatedProfiles = profiles.filter((p) => p.id !== id)
    StorageService.saveGuestProfiles(updatedProfiles)
    StorageService.deleteGuestDataset(id)
    setGuestProfiles(updatedProfiles)

    if (StorageService.getActiveGuestId() === id) {
      StorageService.setActiveGuestId(null)
      StorageService.resetToDefault()
      useScheduleStore.getState().reloadFromStorage()
      setUser(null)
      setRole(null)
      setIsGuest(false)
    }
  }

  const isAdmin = role === 'admin'

  const contextValue: AuthContextType = {
    user: value?.user !== undefined ? value.user : user,
    role: value?.role !== undefined ? value.role : role,
    isAdmin: value?.isAdmin !== undefined ? value.isAdmin : isAdmin,
    isGuest: value?.isGuest !== undefined ? value.isGuest : isGuest,
    loading: value?.loading !== undefined ? value.loading : loading,
    login: value?.login || login,
    loginAsGuest: value?.loginAsGuest || loginAsGuest,
    logout: value?.logout || logout,
    guestProfiles:
      value?.guestProfiles !== undefined ? value.guestProfiles : guestProfiles,
    deleteGuestProfile: value?.deleteGuestProfile || deleteGuestProfile,
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

