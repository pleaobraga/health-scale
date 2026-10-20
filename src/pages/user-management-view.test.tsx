import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import * as firestore from 'firebase/firestore'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import { UserManagementView } from './user-management-view'

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual<typeof firestore>('firebase/firestore')
  return {
    ...actual,
    collection: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn(),
    orderBy: vi.fn(),
  }
})

describe('UserManagementView Component', () => {
  const mockUsers = [
    {
      id: 'usr-1',
      data: () => ({
        name: 'Dr. Roberto Admin',
        email: 'roberto@saude.gov.br',
        role: 'admin',
        createdAt: '2026-01-01',
      }),
    },
    {
      id: 'usr-2',
      data: () => ({
        name: 'Enf. Juliana',
        email: 'juliana@saude.gov.br',
        role: 'user',
        createdAt: '2026-01-02',
      }),
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(firestore.getDocs).mockResolvedValue({
      forEach: (cb: (doc: (typeof mockUsers)[0]) => void) => mockUsers.forEach(cb),
    } as unknown as firestore.QuerySnapshot)
  })

  it('deve renderizar o header padrão, botões de ação e lista de usuários', async () => {
    render(<UserManagementView />)

    expect(screen.getByTestId('user-management-view')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Dr. Roberto Admin')).toBeInTheDocument()
      expect(screen.getByText('roberto@saude.gov.br')).toBeInTheDocument()
      expect(screen.getByText('Enf. Juliana')).toBeInTheDocument()
      expect(screen.getByText('juliana@saude.gov.br')).toBeInTheDocument()
    })

    expect(screen.getByRole('heading', { name: /Gestão de Usuários do Sistema/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Novo Usuário/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Recarregar lista/i })).toBeInTheDocument()
  })

  it('deve filtrar os usuários através do campo de busca', async () => {
    render(<UserManagementView />)

    await waitFor(() => {
      expect(screen.getByText('Dr. Roberto Admin')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/buscar por nome, e-mail ou perfil/i)
    fireEvent.change(searchInput, { target: { value: 'Juliana' } })

    expect(screen.queryByText('Dr. Roberto Admin')).not.toBeInTheDocument()
    expect(screen.getByText('Enf. Juliana')).toBeInTheDocument()
  })

  it('deve exibir mensagem de nenhum usuário encontrado quando a busca não tiver resultados', async () => {
    render(<UserManagementView />)

    await waitFor(() => {
      expect(screen.getByText('Dr. Roberto Admin')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/buscar por nome, e-mail ou perfil/i)
    fireEvent.change(searchInput, { target: { value: 'Inexistente' } })

    expect(screen.getByText(/Nenhum usuário encontrado/i)).toBeInTheDocument()
  })

  it('deve abrir o modal de criação de usuário ao clicar no botão "Novo Usuário"', async () => {
    render(<UserManagementView />)

    await waitFor(() => {
      expect(screen.getByText('Dr. Roberto Admin')).toBeInTheDocument()
    })

    const newUserBtn = screen.getByRole('button', { name: /Novo Usuário/i })
    fireEvent.click(newUserBtn)

    expect(screen.getByRole('heading', { name: /Novo Usuário do Sistema/i })).toBeInTheDocument()
  })
})
