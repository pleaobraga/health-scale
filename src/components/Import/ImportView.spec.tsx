import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImportView } from './ImportView';
import { useScheduleStore } from '../../store/useScheduleStore';
import * as backupService from '../../services/backupService';
import { AppDataSnapshot } from '../../types';

describe('ImportView Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    useScheduleStore.setState({ currentView: 'import' });
  });

  it('deve renderizar o banner de boas-vindas e a área de dropzone', () => {
    render(<ImportView />);

    expect(screen.getByText(/Gerenciador de Escalas Mensais/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /começar do zero/i })).toBeInTheDocument();
    expect(screen.getByText(/Selecione o arquivo de backup/i)).toBeInTheDocument();
    expect(screen.getByText(/Clique para selecionar/i)).toBeInTheDocument();
  });

  it('deve permitir começar do zero limpando dados e navegando para a tela de pessoas', () => {
    render(<ImportView />);

    const startZeroBtn = screen.getByRole('button', { name: /começar do zero/i });
    fireEvent.click(startZeroBtn);

    expect(useScheduleStore.getState().currentView).toBe('people');
    expect(useScheduleStore.getState().persons).toEqual([]);
  });

  it('deve exibir mensagem de erro quando arquivo inválido for selecionado', async () => {
    render(<ImportView />);

    const invalidFile = new File(['corrupt-data'], 'bad.json', { type: 'application/json' });
    const input = screen.getByTestId('backup-file-input');

    fireEvent.change(input, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Erro ao validar arquivo/i)).toBeInTheDocument();
    });
  });

  it('deve processar arquivo válido e exibir os contadores de prévia', async () => {
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
    };

    const validFile = new File([JSON.stringify(validSnapshot)], 'backup.json', {
      type: 'application/json',
    });

    render(<ImportView />);

    const input = screen.getByTestId('backup-file-input');
    fireEvent.change(input, { target: { files: [validFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Prévia do Backup Válido/i)).toBeInTheDocument();
      expect(screen.getByText('Dr. Lucas')).toBeInTheDocument();
      expect(screen.getByText('Dra. Camila')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /restaurar backup/i })).toBeInTheDocument();
    });
  });

  it('deve restaurar diretamente quando a aplicação estiver 100% vazia (sem modal de sobrescrita)', async () => {
    vi.spyOn(backupService, 'hasExistingLocalData').mockResolvedValue(false);
    const restoreSpy = vi.spyOn(backupService, 'restoreAppData').mockResolvedValue();

    const validSnapshot: AppDataSnapshot = {
      exportedAt: '2026-10-17T12:00:00.000Z',
      people: [{ id: 'p1', name: 'Dr. Lucas', color: '#10b981' }],
      monthParticipants: {},
      availabilities: [],
      assignments: {},
      events: [],
    };

    const validFile = new File([JSON.stringify(validSnapshot)], 'backup.json', {
      type: 'application/json',
    });

    render(<ImportView />);

    const input = screen.getByTestId('backup-file-input');
    fireEvent.change(input, { target: { files: [validFile] } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /restaurar backup/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /restaurar backup/i }));

    await waitFor(() => {
      expect(restoreSpy).toHaveBeenCalledTimes(1);
      expect(screen.queryByText(/Atenção: Sobrescrita de Dados/i)).not.toBeInTheDocument();
    });
  });

  it('deve abrir modal de sobrescrita quando já existirem dados cadastrados localmente', async () => {
    vi.spyOn(backupService, 'hasExistingLocalData').mockResolvedValue(true);
    const restoreSpy = vi.spyOn(backupService, 'restoreAppData').mockResolvedValue();

    const validSnapshot: AppDataSnapshot = {
      exportedAt: '2026-10-17T12:00:00.000Z',
      people: [{ id: 'p1', name: 'Dr. Lucas', color: '#10b981' }],
      monthParticipants: {},
      availabilities: [],
      assignments: {},
      events: [],
    };

    const validFile = new File([JSON.stringify(validSnapshot)], 'backup.json', {
      type: 'application/json',
    });

    render(<ImportView />);

    const input = screen.getByTestId('backup-file-input');
    fireEvent.change(input, { target: { files: [validFile] } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /restaurar backup/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /restaurar backup/i }));

    // Confirmation modal should be opened
    await waitFor(() => {
      expect(screen.getByText(/Atenção: Sobrescrita de Dados/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /sim, sobrescrever dados/i })
      ).toBeInTheDocument();
    });

    // Clicking destructive confirm executes restore
    fireEvent.click(screen.getByRole('button', { name: /sim, sobrescrever dados/i }));

    await waitFor(() => {
      expect(restoreSpy).toHaveBeenCalledTimes(1);
    });
  });
});

