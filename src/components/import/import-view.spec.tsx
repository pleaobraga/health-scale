import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import { ImportView } from './import-view'
import { AuthContext } from '../../context/auth-context-base'
import * as backupService from '../../services/backup-service'
import { useScheduleStore } from '../../store/use-schedule-store'

import type { AuthContextType } from '../../context/auth-context-base'
import type { AppDataSnapshot } from '../../types'

const renderWithRouter = (authValue?: Partial<AuthContextType>) => {
  const contextValue: AuthContextType = {
    user: null,
    role: 'user',
    isAdmin: false,
    isGuest: false,
    loading: false,
    login: vi.fn(),
    loginAsGuest: vi.fn(),
    logout: vi.fn(),
    guestProfiles: [],
    deleteGuestProfile: vi.fn(),
    ...authValue,
  }

  return render(
    <AuthContext value={contextValue}>
      <MemoryRouter>
        <ImportView />
      </MemoryRouter>
    </AuthContext>,
  )
}

describe('ImportView Component', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    useScheduleStore.setState({ currentView: 'import' })
  })

  it('renders the welcome banner and the dropzone', async () => {
    renderWithRouter()

    expect(await screen.findByText('Configuração Inicial / Boas-vindas')).toBeInTheDocument()
    expect(screen.getByText(/Gerenciador de Escalas Mensais/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /começar do zero/i })).toBeInTheDocument()
    expect(screen.getByText(/Selecione o arquivo de backup/i)).toBeInTheDocument()
    expect(screen.getByText(/Clique para selecionar/i)).toBeInTheDocument()
  })

  it('starts from scratch (clears data and opens the calendar) when nothing is saved', async () => {
    renderWithRouter()

    expect(await screen.findByText('Configuração Inicial / Boas-vindas')).toBeInTheDocument()
    const startZeroBtn = screen.getByTestId('start-zero-button')
    fireEvent.click(startZeroBtn)

    expect(useScheduleStore.getState().currentView).toBe('calendar')
    expect(useScheduleStore.getState().persons).toEqual([])
  })

  it('hides "Começar do zero" when local data already exists', async () => {
    vi.spyOn(backupService, 'hasExistingLocalData').mockResolvedValue(true)

    renderWithRouter()

    expect(await screen.findByText('Restauração de Backup')).toBeInTheDocument()
    expect(screen.queryByTestId('start-zero-button')).not.toBeInTheDocument()
  })

  it('shows an error when an invalid file is selected', async () => {
    renderWithRouter()

    expect(await screen.findByText('Configuração Inicial / Boas-vindas')).toBeInTheDocument()

    const invalidFile = new File(['corrupt-data'], 'bad.json', { type: 'application/json' })
    const input = screen.getByTestId('backup-file-input')

    fireEvent.change(input, { target: { files: [invalidFile] } })

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/Erro ao validar arquivo/i)).toBeInTheDocument()
    })
  })

  it('parses a valid file and shows the preview counters', async () => {
    const validSnapshot: AppDataSnapshot = {
      exportedAt: '2026-10-17T12:00:00.000Z',
      people: [
        { id: 'p1', name: 'Dr. Lucas', color: '#10b981' },
        { id: 'p2', name: 'Dra. Camila', color: '#3b82f6' },
      ],
      monthParticipants: { '2026-10': ['p1', 'p2'] },
      availabilities: [],
      assignments: { '2026-10-01': ['p1'] },
      events: [{ id: 'e1', date: '2026-10-01', title: 'Plantão' }],
    }

    const validFile = new File([JSON.stringify(validSnapshot)], 'backup.json', {
      type: 'application/json',
    })

    renderWithRouter()

    const input = screen.getByTestId('backup-file-input')
    fireEvent.change(input, { target: { files: [validFile] } })

    await waitFor(() => {
      expect(screen.getByText(/Prévia do Backup Válido/i)).toBeInTheDocument()
      expect(screen.getByText('Dr. Lucas')).toBeInTheDocument()
      expect(screen.getByText('Dra. Camila')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /restaurar backup/i })).toBeInTheDocument()
    })
  })

  it('restores right away, without the overwrite modal, when the app is empty', async () => {
    vi.spyOn(backupService, 'hasExistingLocalData').mockResolvedValue(false)
    const restoreSpy = vi.spyOn(backupService, 'restoreAppData').mockResolvedValue()

    const validSnapshot: AppDataSnapshot = {
      exportedAt: '2026-10-17T12:00:00.000Z',
      people: [{ id: 'p1', name: 'Dr. Lucas', color: '#10b981' }],
      monthParticipants: {},
      availabilities: [],
      assignments: {},
      events: [],
    }

    const validFile = new File([JSON.stringify(validSnapshot)], 'backup.json', {
      type: 'application/json',
    })

    renderWithRouter()

    const input = screen.getByTestId('backup-file-input')
    fireEvent.change(input, { target: { files: [validFile] } })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /restaurar backup/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /restaurar backup/i }))

    await waitFor(() => {
      expect(restoreSpy).toHaveBeenCalledTimes(1)
      expect(screen.queryByText(/Atenção: Sobrescrita de Dados/i)).not.toBeInTheDocument()
    })
  })

  it('asks for overwrite confirmation when local data already exists', async () => {
    vi.spyOn(backupService, 'hasExistingLocalData').mockResolvedValue(true)
    const restoreSpy = vi.spyOn(backupService, 'restoreAppData').mockResolvedValue()

    const validSnapshot: AppDataSnapshot = {
      exportedAt: '2026-10-17T12:00:00.000Z',
      people: [{ id: 'p1', name: 'Dr. Lucas', color: '#10b981' }],
      monthParticipants: {},
      availabilities: [],
      assignments: {},
      events: [],
    }

    const validFile = new File([JSON.stringify(validSnapshot)], 'backup.json', {
      type: 'application/json',
    })

    renderWithRouter()

    const input = screen.getByTestId('backup-file-input')
    fireEvent.change(input, { target: { files: [validFile] } })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /restaurar backup/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /restaurar backup/i }))

    // Confirmation modal should be opened
    await waitFor(() => {
      expect(screen.getByText(/Atenção: Sobrescrita de Dados/i)).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /sim, sobrescrever dados/i })
      ).toBeInTheDocument()
    })

    // Clicking destructive confirm executes restore
    fireEvent.click(screen.getByRole('button', { name: /sim, sobrescrever dados/i }))

    await waitFor(() => {
      expect(restoreSpy).toHaveBeenCalledTimes(1)
    })
  })

  it('offers the merge option and calls mergeAppData when local data already exists', async () => {
    vi.spyOn(backupService, 'hasExistingLocalData').mockResolvedValue(true)
    const mergeSpy = vi.spyOn(backupService, 'mergeAppData').mockResolvedValue()

    const validSnapshot: AppDataSnapshot = {
      exportedAt: '2026-10-17T12:00:00.000Z',
      people: [{ id: 'p1', name: 'Dr. Lucas', color: '#10b981' }],
      monthParticipants: {},
      availabilities: [],
      assignments: {},
      events: [],
    }

    const validFile = new File([JSON.stringify(validSnapshot)], 'backup.json', {
      type: 'application/json',
    })

    renderWithRouter()

    const input = screen.getByTestId('backup-file-input')
    fireEvent.change(input, { target: { files: [validFile] } })

    await waitFor(() => {
      expect(screen.getByTestId('overwrite-restore-button')).toBeInTheDocument()
      expect(screen.getByTestId('merge-restore-button')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('merge-restore-button'))

    await waitFor(() => {
      expect(mergeSpy).toHaveBeenCalledTimes(1)
      expect(mergeSpy).toHaveBeenCalledWith(expect.objectContaining({ people: validSnapshot.people }))
    })
  })

  it('hides the cloud pull buttons for non-admin users', async () => {
    renderWithRouter({ isAdmin: false })

    expect(await screen.findByText('Configuração Inicial / Boas-vindas')).toBeInTheDocument()
    expect(screen.queryByTestId('admin-cloud-pull-card')).not.toBeInTheDocument()
    expect(screen.queryByTestId('banner-pull-cloud-button')).not.toBeInTheDocument()
  })

  it('shows the cloud pull buttons to admins and pulls the data', async () => {
    const pullCloudDataMock = vi.fn().mockResolvedValue({
      success: true,
      message: 'Dados da nuvem sincronizados com sucesso!',
    })

    useScheduleStore.setState({
      pullCloudData: pullCloudDataMock,
    })

    renderWithRouter({ isAdmin: true, role: 'admin' })

    expect(await screen.findByText('Configuração Inicial / Boas-vindas')).toBeInTheDocument()
    expect(screen.getByTestId('admin-cloud-pull-card')).toBeInTheDocument()
    expect(screen.getByTestId('banner-pull-cloud-button')).toBeInTheDocument()

    const pullBtn = screen.getByTestId('import-pull-cloud-button')
    fireEvent.click(pullBtn)

    await waitFor(() => {
      expect(pullCloudDataMock).toHaveBeenCalledTimes(1)
      expect(screen.getByTestId('cloud-feedback-banner')).toBeInTheDocument()
      expect(
        screen.getByText(/Dados da nuvem sincronizados com sucesso!/i),
      ).toBeInTheDocument()
    })
  })
})

