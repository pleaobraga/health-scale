import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { AddDayShiftModal } from './add-day-shift-modal'

import type { Person, ShiftDefinition } from '../../types'

describe('AddDayShiftModal Component', () => {
  const mockPersons: Person[] = [
    { id: 'p1', name: 'Dra. Camila', color: '#3B82F6' },
    { id: 'p2', name: 'Dr. Lucas', color: '#10B981' },
    { id: 'p3', name: 'Enf. Beatriz', color: '#8B5CF6' },
  ]

  const mockActiveShifts: ShiftDefinition[] = [
    {
      id: 'shift_d12',
      name: 'Plantão Diurno 12h',
      code: 'D12',
      startTime: '07:00',
      durationHours: 12,
      color: '#3B82F6',
      enabledByDefault: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 'shift_n12',
      name: 'Plantão Noturno 12h',
      code: 'N12',
      startTime: '19:00',
      durationHours: 12,
      color: '#6366F1',
      enabledByDefault: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ]

  it('permite escolher o plantão e selecionar o profissional disponível para confirmar alocação', () => {
    const handleAssign = vi.fn()
    // p1 available for d12, p2 available for n12
    const isPersonAvailable = (personId: string, _day: number, shiftId?: string) => {
      if (shiftId === 'shift_d12') return personId === 'p1'
      if (shiftId === 'shift_n12') return personId === 'p2'
      return false
    }

    render(
      <AddDayShiftModal
        isOpen={true}
        onClose={vi.fn()}
        dateStr="2026-10-15"
        formattedDate="15 de Outubro de 2026"
        dayNumber={15}
        activeShifts={mockActiveShifts}
        dayShiftMap={{}}
        allPersons={mockPersons}
        isPersonAvailable={isPersonAvailable}
        onAssignPersonToShift={handleAssign}
      />
    )

    // Displays both shifts in step 1
    expect(screen.getByText('Plantão Diurno 12h')).toBeInTheDocument()
    expect(screen.getByText('Plantão Noturno 12h')).toBeInTheDocument()

    // Initially D12 is selected -> Dra. Camila should be in available candidates
    expect(screen.getByText('Dra. Camila')).toBeInTheDocument()

    // Switch to N12
    const n12ShiftCard = screen.getByText('Plantão Noturno 12h')
    fireEvent.click(n12ShiftCard)

    // For N12, Dr. Lucas is available
    const lucasOption = screen.getByText('Dr. Lucas')
    fireEvent.click(lucasOption)

    // Confirm button is now active
    const confirmBtn = screen.getByRole('button', { name: /confirmar/i })
    expect(confirmBtn).not.toBeDisabled()
    fireEvent.click(confirmBtn)

    expect(handleAssign).toHaveBeenCalledWith('shift_n12', 'p2')
  })
})

