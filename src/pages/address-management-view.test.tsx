import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import { AddressManagementView } from './address-management-view'
import { useScheduleStore } from '../store/use-schedule-store'

import type { Address } from '../types'

describe('AddressManagementView', () => {
  const mockAddresses: Address[] = [
    {
      id: 'addr-1',
      name: 'Residência Flores',
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apto 45',
      neighborhood: 'Jardins',
      city: 'São Paulo',
    },
    {
      id: 'addr-2',
      name: 'Clínica Paulista',
      street: 'Avenida Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
    },
  ]

  beforeEach(() => {
    useScheduleStore.setState({
      addresses: [...mockAddresses],
    })
  })

  it('deve renderizar o título, nomes e listagem de endereços cadastrados', () => {
    render(<AddressManagementView />)

    expect(screen.getByRole('heading', { name: /Gerenciar Endereços/i })).toBeInTheDocument()
    expect(screen.getByText('Residência Flores')).toBeInTheDocument()
    expect(screen.getByText('Clínica Paulista')).toBeInTheDocument()
    expect(screen.getByText('Rua das Flores, 123')).toBeInTheDocument()
    expect(screen.getByText('Avenida Paulista, 1000')).toBeInTheDocument()
    expect(screen.getByText('Apto 45')).toBeInTheDocument()
    expect(screen.getByText('Jardins - São Paulo')).toBeInTheDocument()
  })

  it('não deve conter nenhum campo de CEP no formulário nem na tela', () => {
    render(<AddressManagementView />)

    // Open Add Modal
    fireEvent.click(screen.getByRole('button', { name: /Novo Endereço/i }))

    expect(screen.getByLabelText(/Nome do Local \/ Identificação \*/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Logradouro \*/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Número \*/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Complemento/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Bairro/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Cidade/i)).toBeInTheDocument()

    // Assert strictly no CEP
    expect(screen.queryByLabelText(/cep/i)).not.toBeInTheDocument()
    expect(screen.queryByPlaceholderText(/cep/i)).not.toBeInTheDocument()
  })

  it('deve filtrar endereços pela busca de texto por nome ou logradouro', () => {
    render(<AddressManagementView />)

    const searchInput = screen.getByPlaceholderText(/Buscar por nome, logradouro, bairro.../i)
    fireEvent.change(searchInput, { target: { value: 'Clínica' } })

    expect(screen.queryByText('Residência Flores')).not.toBeInTheDocument()
    expect(screen.getByText('Clínica Paulista')).toBeInTheDocument()
  })

  it('deve cadastrar um novo endereço com nome e dados completos com sucesso', () => {
    render(<AddressManagementView />)

    fireEvent.click(screen.getByRole('button', { name: /Novo Endereço/i }))

    fireEvent.change(screen.getByLabelText(/Nome do Local \/ Identificação \*/i), {
      target: { value: 'Consultório Augusta' },
    })
    fireEvent.change(screen.getByLabelText(/Logradouro \*/i), {
      target: { value: 'Rua Augusta' },
    })
    fireEvent.change(screen.getByLabelText(/Número \*/i), {
      target: { value: '500' },
    })
    fireEvent.change(screen.getByLabelText(/Complemento/i), {
      target: { value: 'Sala 10' },
    })
    fireEvent.change(screen.getByLabelText(/Bairro/i), {
      target: { value: 'Consolação' },
    })
    fireEvent.change(screen.getByLabelText(/Cidade/i), {
      target: { value: 'São Paulo' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Cadastrar Endereço/i }))

    const storeAddresses = useScheduleStore.getState().addresses
    expect(storeAddresses).toHaveLength(3)
    expect(
      storeAddresses.some(
        (a) => a.name === 'Consultório Augusta' && a.street === 'Rua Augusta' && a.number === '500'
      )
    ).toBe(true)
  })

  it('deve validar obrigatoriedade do nome do local ao tentar cadastrar', () => {
    render(<AddressManagementView />)

    fireEvent.click(screen.getByRole('button', { name: /Novo Endereço/i }))

    fireEvent.change(screen.getByLabelText(/Logradouro \*/i), {
      target: { value: 'Rua Sem Nome' },
    })
    fireEvent.change(screen.getByLabelText(/Número \*/i), {
      target: { value: '10' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Cadastrar Endereço/i }))

    expect(screen.getByText('O nome do local é obrigatório.')).toBeInTheDocument()
    expect(useScheduleStore.getState().addresses).toHaveLength(2)
  })

  it('deve editar um endereço existente incluindo o nome', () => {
    render(<AddressManagementView />)

    const editBtn = screen.getByRole('button', { name: /Editar endereço Residência Flores/i })
    fireEvent.click(editBtn)

    const nameInput = screen.getByLabelText(/Nome do Local \/ Identificação \*/i)
    expect(nameInput).toHaveValue('Residência Flores')

    const streetInput = screen.getByLabelText(/Logradouro \*/i)
    expect(streetInput).toHaveValue('Rua das Flores')

    fireEvent.change(nameInput, { target: { value: 'Residência Orquídeas' } })
    fireEvent.change(streetInput, { target: { value: 'Rua das Orquídeas' } })
    fireEvent.click(screen.getByRole('button', { name: /Salvar Alterações/i }))

    const storeAddresses = useScheduleStore.getState().addresses
    const edited = storeAddresses.find((a) => a.id === 'addr-1')
    expect(edited?.name).toBe('Residência Orquídeas')
    expect(edited?.street).toBe('Rua das Orquídeas')
  })

  it('deve excluir um endereço após confirmação no modal', () => {
    render(<AddressManagementView />)

    const deleteBtn = screen.getByRole('button', { name: /Excluir endereço Residência Flores/i })
    fireEvent.click(deleteBtn)

    // Confirm modal should appear
    expect(screen.getByText('Excluir Endereço')).toBeInTheDocument()
    expect(screen.getAllByText(/Residência Flores/i).length).toBeGreaterThanOrEqual(1)

    const confirmBtn = screen.getByRole('button', { name: /Excluir Definitivamente/i })
    fireEvent.click(confirmBtn)

    const storeAddresses = useScheduleStore.getState().addresses
    expect(storeAddresses).toHaveLength(1)
    expect(storeAddresses.find((a) => a.id === 'addr-1')).toBeUndefined()
  })

  it('deve exibir estado vazio quando não houver endereços', () => {
    useScheduleStore.setState({ addresses: [] })
    render(<AddressManagementView />)

    expect(screen.getByText('Nenhum endereço cadastrado.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Adicionar Primeiro Endereço/i })).toBeInTheDocument()
  })

  it('deve copiar o endereço para a área de transferência ao clicar em Copiar', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    })

    render(<AddressManagementView />)

    const copyBtn = screen.getByRole('button', { name: /Copiar endereço Residência Flores/i })
    expect(copyBtn).toHaveTextContent('Copiar')

    fireEvent.click(copyBtn)

    expect(writeTextMock).toHaveBeenCalledWith('Residência Flores - Rua das Flores, 123 - Apto 45 - Jardins - São Paulo')
    expect(await screen.findByText('Copiado!')).toBeInTheDocument()
  })
})
