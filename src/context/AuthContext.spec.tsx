import { act, renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it } from 'vitest'

import { AuthProvider, useAuth } from './AuthContext'
import { StorageService } from '../services/storageService'

describe('AuthContext - Suporte a Múltiplos Convidados com Isolamento Local', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )

  it('deve inicializar com estado de convidado inativo quando não houver sessão', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isGuest).toBe(false)
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.guestProfiles).toEqual([])
  })


  it('deve criar um novo perfil de convidado com privilégios não-admin', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.loginAsGuest('Dr. Lucas')
    })

    expect(result.current.user).not.toBeNull()
    expect(result.current.user?.displayName).toBe('Dr. Lucas')
    expect(result.current.isGuest).toBe(true)
    expect(result.current.role).toBe('user')
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.guestProfiles).toHaveLength(1)
    expect(result.current.guestProfiles[0].name).toBe('Dr. Lucas')
    expect(StorageService.getActiveGuestId()).toBe(result.current.guestProfiles[0].id)
  })

  it('deve alternar entre contas de convidados restaurando os dados isolados', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    // 1. Convidado 1 entra e salva dados
    await act(async () => {
      await result.current.loginAsGuest('Dr. Primeiro')
    })

    const guest1Id = result.current.guestProfiles[0].id
    StorageService.savePersons([
      { id: 'p-1', name: 'Paciente A', color: '#3b82f6', active: true },
    ])

    // 2. Convidado 1 desloga
    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isGuest).toBe(false)
    expect(StorageService.getActiveGuestId()).toBeNull()
    // Dados ativos são limpos para evitar vazamento
    expect(StorageService.getPersons()).toEqual([])

    // 3. Convidado 2 entra e salva outros dados
    await act(async () => {
      await result.current.loginAsGuest('Dra. Segunda')
    })

    expect(result.current.user?.displayName).toBe('Dra. Segunda')
    expect(result.current.guestProfiles).toHaveLength(2)
    StorageService.savePersons([
      { id: 'p-2', name: 'Paciente B', color: '#10b981', active: true },
    ])

    // 4. Convidado 2 desloga
    await act(async () => {
      await result.current.logout()
    })

    expect(StorageService.getPersons()).toEqual([])

    // 5. Convidado 1 é selecionado novamente da lista
    await act(async () => {
      await result.current.loginAsGuest('', guest1Id)
    })

    expect(result.current.user?.displayName).toBe('Dr. Primeiro')
    expect(result.current.isGuest).toBe(true)
    // Dados do Convidado 1 foram restaurados com sucesso!
    const restoredPersons = StorageService.getPersons()
    expect(restoredPersons).toHaveLength(1)
    expect(restoredPersons[0].name).toBe('Paciente A')
  })

  it('deve excluir perfil de convidado e seu dataset associado', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.loginAsGuest('Dr. Temporario')
    })

    const guestId = result.current.guestProfiles[0].id
    expect(StorageService.getGuestProfiles()).toHaveLength(1)
    expect(StorageService.getGuestDataset(guestId)).not.toBeNull()

    act(() => {
      result.current.deleteGuestProfile(guestId)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.guestProfiles).toHaveLength(0)
    expect(StorageService.getGuestProfiles()).toHaveLength(0)
    expect(StorageService.getGuestDataset(guestId)).toBeNull()
  })
})
