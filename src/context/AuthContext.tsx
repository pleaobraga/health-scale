/* eslint-disable react-refresh/only-export-components */
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { auth, db } from '../services/firebase'
import {
  AuthContext,
  AuthContextType,
  UserRole,
  useAuth,
} from './authContextBase'

export { AuthContext, useAuth }
export type { AuthContextType, UserRole }

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
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    console.log(`value`, value)

    // If an external value override is provided (e.g. in unit tests), bypass auth listener
    if (value && value.user !== undefined) {
      setUser(value.user)
      setRole(value.role ?? 'user')
      setLoading(value.loading ?? false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (!currentUser) {
          setUser(null)
          setRole(null)
          setLoading(false)
          return
        }

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
    await signInWithEmailAndPassword(auth, email, password)
  }

  const logout = async (): Promise<void> => {
    await signOut(auth)
    setUser(null)
    setRole(null)
  }

  const isAdmin = role === 'admin'

  const contextValue: AuthContextType = {
    user: value?.user !== undefined ? value.user : user,
    role: value?.role !== undefined ? value.role : role,
    isAdmin: value?.isAdmin !== undefined ? value.isAdmin : isAdmin,
    loading: value?.loading !== undefined ? value.loading : loading,
    login: value?.login || login,
    logout: value?.logout || logout,
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}
