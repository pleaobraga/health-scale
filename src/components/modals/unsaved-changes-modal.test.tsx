import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import { UnsavedChangesModal } from './unsaved-changes-modal'
import { useScheduleStore } from '../../store/use-schedule-store'

describe('UnsavedChangesModal', () => {
  beforeEach(() => {
    useScheduleStore.setState({
      isEditMode: true,
      hasUnsavedChanges: true,
      isUnsavedModalOpen: false,
      assignments: { '2026-10-01': ['p1'] },
      savedAssignments: {},
    })
  })

  it('renders nothing when isUnsavedModalOpen is false', () => {
    render(<UnsavedChangesModal />)
    expect(screen.queryByText('Alterações Não Salvas')).not.toBeInTheDocument()
  })

  it('shows the title, message and actions when open', () => {
    useScheduleStore.setState({ isUnsavedModalOpen: true })
    render(<UnsavedChangesModal />)

    expect(screen.getByText('Alterações Não Salvas')).toBeInTheDocument()
    expect(screen.getByText(/Se você alternar para o modo de/i)).toBeInTheDocument()
    expect(screen.getByText('Salvar e Sair')).toBeInTheDocument()
    expect(screen.getByText('Descartar Alterações')).toBeInTheDocument()
    expect(screen.getByText('Continuar Editando')).toBeInTheDocument()
  })

  it('saves, leaves edit mode and closes on "Salvar e Sair"', () => {
    const saveSpy = vi.spyOn(useScheduleStore.getState(), 'saveSchedule')
    useScheduleStore.setState({ isUnsavedModalOpen: true })
    render(<UnsavedChangesModal />)

    const saveBtn = screen.getByText('Salvar e Sair')
    fireEvent.click(saveBtn)

    expect(saveSpy).toHaveBeenCalledTimes(1)
    expect(useScheduleStore.getState().isEditMode).toBe(false)
    expect(useScheduleStore.getState().isUnsavedModalOpen).toBe(false)
  })

  it('discards changes, leaves edit mode and closes on "Descartar Alterações"', () => {
    useScheduleStore.setState({ isUnsavedModalOpen: true })
    render(<UnsavedChangesModal />)

    const discardBtn = screen.getByText('Descartar Alterações')
    fireEvent.click(discardBtn)

    expect(useScheduleStore.getState().isEditMode).toBe(false)
    expect(useScheduleStore.getState().isUnsavedModalOpen).toBe(false)
    expect(useScheduleStore.getState().assignments['2026-10-01']).toBeUndefined()
  })

  it('closes and stays in edit mode on "Continuar Editando"', () => {
    useScheduleStore.setState({ isUnsavedModalOpen: true })
    render(<UnsavedChangesModal />)

    const cancelBtn = screen.getByText('Continuar Editando')
    fireEvent.click(cancelBtn)

    expect(useScheduleStore.getState().isEditMode).toBe(true)
    expect(useScheduleStore.getState().isUnsavedModalOpen).toBe(false)
    expect(useScheduleStore.getState().hasUnsavedChanges).toBe(true)
  })

  it('closes on Escape', () => {
    useScheduleStore.setState({ isUnsavedModalOpen: true })
    render(<UnsavedChangesModal />)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(useScheduleStore.getState().isUnsavedModalOpen).toBe(false)
    expect(useScheduleStore.getState().isEditMode).toBe(true)
  })
  it('uses the shared modal layout so the actions stay at the bottom on small screens', () => {
    useScheduleStore.setState({ isUnsavedModalOpen: true })
    render(<UnsavedChangesModal />)

    expect(screen.getByRole('dialog')).toHaveClass('modal-overlay')
    const body = screen.getByTestId('unsaved-modal-body')
    expect(body).toHaveClass('modal-body')
    expect(body.parentElement).toHaveClass('modal-panel')
    expect(body.nextElementSibling).toHaveClass('modal-footer')
  })
})

