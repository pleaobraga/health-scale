import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { AddMonthParticipantsModal } from './add-month-participants-modal'

import type { Person } from '../../types'

describe('AddMonthParticipantsModal', () => {
  const mockPersons: Person[] = [
    { id: 'p1', name: 'Dra. Camila Santos', color: '#3b82f6', active: true },
    { id: 'p2', name: 'Dr. Lucas Oliveira (Inativo)', color: '#10b981', active: false },
    { id: 'p3', name: 'Enf. Beatriz Lima', color: '#8b5cf6', active: true },
  ]

  it('lists only active professionals', () => {
    render(
      <AddMonthParticipantsModal
        isOpen={true}
        onClose={vi.fn()}
        currentMonth="2026-10"
        allPersons={mockPersons}
        currentParticipantIds={[]}
        onAddParticipants={vi.fn()}
      />
    )

    expect(screen.getByText('Dra. Camila Santos')).toBeInTheDocument()
    expect(screen.getByText('Enf. Beatriz Lima')).toBeInTheDocument()
    // The inactive professional must not appear in the month candidate list
    expect(screen.queryByText('Dr. Lucas Oliveira (Inativo)')).not.toBeInTheDocument()
  })

  it('selects active professionals and links them to the month', () => {
    const handleAdd = vi.fn()
    const handleClose = vi.fn()

    render(
      <AddMonthParticipantsModal
        isOpen={true}
        onClose={handleClose}
        currentMonth="2026-10"
        allPersons={mockPersons}
        currentParticipantIds={['p1']} // Camila is already linked
        onAddParticipants={handleAdd}
      />
    )

    // Since Camila is already in the month and Lucas is inactive, only Beatriz is eligible
    expect(screen.queryByText('Dra. Camila Santos')).not.toBeInTheDocument()
    expect(screen.queryByText('Dr. Lucas Oliveira (Inativo)')).not.toBeInTheDocument()
    expect(screen.getByText('Enf. Beatriz Lima')).toBeInTheDocument()

    const beatrizCheckbox = screen.getByText('Enf. Beatriz Lima')
    fireEvent.click(beatrizCheckbox)

    const confirmBtn = screen.getByRole('button', { name: /Adicionar Selecionados/i })
    fireEvent.click(confirmBtn)

    expect(handleAdd).toHaveBeenCalledWith(['p3'])
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('calls onGoToGlobalManagement and closes from the empty state button', () => {
    const handleClose = vi.fn()
    const handleGoToPeople = vi.fn()

    render(
      <AddMonthParticipantsModal
        isOpen={true}
        onClose={handleClose}
        currentMonth="2026-10"
        allPersons={[]}
        currentParticipantIds={[]}
        onAddParticipants={vi.fn()}
        onGoToGlobalManagement={handleGoToPeople}
      />
    )

    const btn = screen.getByRole('button', { name: /Ir para Gerenciar Pessoas/i })
    fireEvent.click(btn)

    expect(handleClose).toHaveBeenCalledTimes(1)
    expect(handleGoToPeople).toHaveBeenCalledTimes(1)
  })

  it('calls onGoToGlobalManagement and closes from the footer when there are candidates', () => {
    const handleClose = vi.fn()
    const handleGoToPeople = vi.fn()

    render(
      <AddMonthParticipantsModal
        isOpen={true}
        onClose={handleClose}
        currentMonth="2026-10"
        allPersons={mockPersons}
        currentParticipantIds={[]}
        onAddParticipants={vi.fn()}
        onGoToGlobalManagement={handleGoToPeople}
      />
    )

    const btn = screen.getByRole('button', { name: /Gerenciar Pessoas/i })
    fireEvent.click(btn)

    expect(handleClose).toHaveBeenCalledTimes(1)
    expect(handleGoToPeople).toHaveBeenCalledTimes(1)
  })
})
