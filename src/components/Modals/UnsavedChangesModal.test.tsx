import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnsavedChangesModal } from './UnsavedChangesModal';
import { useScheduleStore } from '../../store/useScheduleStore';

describe('UnsavedChangesModal', () => {
  beforeEach(() => {
    useScheduleStore.setState({
      isEditMode: true,
      hasUnsavedChanges: true,
      isUnsavedModalOpen: false,
      assignments: { '2026-10-01': ['p1'] },
      savedAssignments: {},
    });
  });

  it('não deve renderizar quando isUnsavedModalOpen for false', () => {
    render(<UnsavedChangesModal />);
    expect(screen.queryByText('Alterações Não Salvas')).not.toBeInTheDocument();
  });

  it('deve exibir título, mensagem e opções de ação quando aberto', () => {
    useScheduleStore.setState({ isUnsavedModalOpen: true });
    render(<UnsavedChangesModal />);

    expect(screen.getByText('Alterações Não Salvas')).toBeInTheDocument();
    expect(screen.getByText(/Se você alternar para o modo de/i)).toBeInTheDocument();
    expect(screen.getByText('Salvar e Sair')).toBeInTheDocument();
    expect(screen.getByText('Descartar Alterações')).toBeInTheDocument();
    expect(screen.getByText('Continuar Editando')).toBeInTheDocument();
  });

  it('deve salvar, sair do modo de edição e fechar o modal ao clicar em "Salvar e Sair"', () => {
    const saveSpy = vi.spyOn(useScheduleStore.getState(), 'saveSchedule');
    useScheduleStore.setState({ isUnsavedModalOpen: true });
    render(<UnsavedChangesModal />);

    const saveBtn = screen.getByText('Salvar e Sair');
    fireEvent.click(saveBtn);

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(useScheduleStore.getState().isEditMode).toBe(false);
    expect(useScheduleStore.getState().isUnsavedModalOpen).toBe(false);
  });

  it('deve descartar alterações, sair do modo de edição e fechar o modal ao clicar em "Descartar Alterações"', () => {
    useScheduleStore.setState({ isUnsavedModalOpen: true });
    render(<UnsavedChangesModal />);

    const discardBtn = screen.getByText('Descartar Alterações');
    fireEvent.click(discardBtn);

    expect(useScheduleStore.getState().isEditMode).toBe(false);
    expect(useScheduleStore.getState().isUnsavedModalOpen).toBe(false);
    expect(useScheduleStore.getState().assignments['2026-10-01']).toBeUndefined();
  });

  it('deve fechar o modal e permanecer no modo de edição ao clicar em "Continuar Editando"', () => {
    useScheduleStore.setState({ isUnsavedModalOpen: true });
    render(<UnsavedChangesModal />);

    const cancelBtn = screen.getByText('Continuar Editando');
    fireEvent.click(cancelBtn);

    expect(useScheduleStore.getState().isEditMode).toBe(true);
    expect(useScheduleStore.getState().isUnsavedModalOpen).toBe(false);
    expect(useScheduleStore.getState().hasUnsavedChanges).toBe(true);
  });

  it('deve fechar o modal ao pressionar a tecla Escape', () => {
    useScheduleStore.setState({ isUnsavedModalOpen: true });
    render(<UnsavedChangesModal />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(useScheduleStore.getState().isUnsavedModalOpen).toBe(false);
    expect(useScheduleStore.getState().isEditMode).toBe(true);
  });
});

