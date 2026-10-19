import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import { TestAppRouter } from './router'
import * as backupService from './services/backup-service'
import { useScheduleStore } from './store/use-schedule-store'

describe('App Root Component - Onboarding & Navigation', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('deve redirecionar automaticamente para a tela de importação quando não houver dados locais persistidos', async () => {
    vi.spyOn(backupService, 'hasExistingLocalData').mockResolvedValue(false)
    useScheduleStore.setState({ currentView: 'calendar' })

    render(<TestAppRouter initialEntries={['/']} />)

    await waitFor(() => {
      expect(useScheduleStore.getState().currentView).toBe('import')
      expect(screen.getByText(/Selecione o arquivo de backup/i)).toBeInTheDocument()
    })
  })

  it('deve manter a tela de calendário quando houver dados locais persistidos', async () => {
    vi.spyOn(backupService, 'hasExistingLocalData').mockResolvedValue(true)
    useScheduleStore.setState({ currentView: 'calendar' })

    render(<TestAppRouter initialEntries={['/']} />)

    await waitFor(() => {
      expect(useScheduleStore.getState().currentView).toBe('calendar')
      expect(screen.getByTestId('calendar-view')).toBeInTheDocument()
    })
  })

  it('deve renderizar a tela de pessoas quando a rota for "/pessoas"', () => {
    vi.spyOn(backupService, 'hasExistingLocalData').mockResolvedValue(true)

    render(<TestAppRouter initialEntries={['/pessoas']} />)

    expect(screen.getByText(/Cadastro Geral de Funcionários/i)).toBeInTheDocument()
    expect(useScheduleStore.getState().currentView).toBe('people')
  })

  it('deve renderizar a tela de configurações quando a rota for "/configuracoes"', () => {
    vi.spyOn(backupService, 'hasExistingLocalData').mockResolvedValue(true)

    render(<TestAppRouter initialEntries={['/configuracoes']} />)

    expect(screen.getByText(/Configurações Gerais/i)).toBeInTheDocument()
  })

  it('deve redirecionar rotas inválidas (*) para a rota raiz', async () => {
    vi.spyOn(backupService, 'hasExistingLocalData').mockResolvedValue(true)

    render(<TestAppRouter initialEntries={['/rota-desconhecida']} />)

    await waitFor(() => {
      expect(screen.getByTestId('calendar-view')).toBeInTheDocument()
    })
  })
})
