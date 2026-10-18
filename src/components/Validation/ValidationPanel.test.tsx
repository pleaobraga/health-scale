import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ValidationPanel } from './ValidationPanel';
import { useScheduleStore } from '../../store/useScheduleStore';

describe('ValidationPanel Component', () => {
  beforeEach(() => {
    localStorage.clear();
    const store = useScheduleStore.getState();
    store.dismissValidation();
  });

  it('deve renderizar os botões principais de Validar Escala e Salvar', () => {
    render(<ValidationPanel />);

    expect(screen.getByRole('button', { name: /Validar Escala/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Salvar/i })).toBeInTheDocument();
  });

  it('deve exibir painel de auditoria com estado 100% conforme quando não há erros', () => {
    // Simulates error-free state in store
    useScheduleStore.setState({
      hasValidated: true,
      validationErrors: [],
    });

    render(<ValidationPanel />);

    expect(screen.getByText('Escala 100% Conforme!')).toBeInTheDocument();
    expect(screen.getByText(/Nenhuma infração de descanso consecutivo/i)).toBeInTheDocument();
  });

  it('deve listar erros e avisos detalhados após a validação', () => {
    useScheduleStore.setState({
      hasValidated: true,
      validationErrors: [
        {
          id: 'err-1',
          rule: 'consecutive_days',
          severity: 'error',
          date: '2026-10-02',
          message: 'Descanso violado: Dra. Camila foi escalada em dias seguidos.',
        },
        {
          id: 'warn-1',
          rule: 'empty_day',
          severity: 'warning',
          date: '2026-10-20',
          message: 'Dia sem responsável: o dia 20/10/2026 está sem ninguém escalado.',
        },
      ],
    });

    render(<ValidationPanel />);

    expect(screen.getByText(/Descanso Consecutivo/i)).toBeInTheDocument();
    expect(screen.getByText('BLOQUEANTE')).toBeInTheDocument();
    expect(screen.getByText(/Descanso violado: Dra. Camila/i)).toBeInTheDocument();

    expect(screen.getByText(/Dia Vazio/i)).toBeInTheDocument();
    expect(screen.getByText('AVISO')).toBeInTheDocument();
  });

  it('deve acionar saveSchedule ao clicar no botão Salvar', () => {
    render(<ValidationPanel />);

    const saveBtn = screen.getByRole('button', { name: /Salvar/i });
    fireEvent.click(saveBtn);

    // Should display save feedback
    expect(useScheduleStore.getState().hasValidated).toBe(true);
  });
});
