import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { App } from './App';
import { useScheduleStore } from './store/useScheduleStore';
import * as backupService from './services/backupService';

describe('App Root Component - Onboarding & Navigation', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('deve redirecionar automaticamente para a tela de importação quando não houver dados locais persistidos', async () => {
    vi.spyOn(backupService, 'hasExistingLocalData').mockResolvedValue(false);
    useScheduleStore.setState({ currentView: 'calendar' });

    render(<App />);

    await waitFor(() => {
      expect(useScheduleStore.getState().currentView).toBe('import');
      expect(screen.getByText(/Selecione o arquivo de backup/i)).toBeInTheDocument();
    });
  });

  it('deve manter a tela de calendário quando houver dados locais persistidos', async () => {
    vi.spyOn(backupService, 'hasExistingLocalData').mockResolvedValue(true);
    useScheduleStore.setState({ currentView: 'calendar' });

    render(<App />);

    await waitFor(() => {
      expect(useScheduleStore.getState().currentView).toBe('calendar');
    });
  });

  it('deve renderizar a tela de pessoas quando currentView for "people"', () => {
    vi.spyOn(backupService, 'hasExistingLocalData').mockResolvedValue(true);
    useScheduleStore.setState({ currentView: 'people' });

    render(<App />);

    expect(screen.getByText(/Cadastro Geral de Funcionários/i)).toBeInTheDocument();
  });
});
