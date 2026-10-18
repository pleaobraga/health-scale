import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestAppRouter } from './index';
import * as backupService from '../services/backupService';
import { useScheduleStore } from '../store/useScheduleStore';

describe('Application Client-Side Router (HashRouter & Route Mapping)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('deve renderizar o RootLayout com a Sidebar fixa e o CalendarView na rota "/"', async () => {
    vi.spyOn(backupService, 'hasExistingLocalData').mockResolvedValue(true);

    render(<TestAppRouter initialEntries={['/']} />);

    expect(screen.getByTestId('root-layout')).toBeInTheDocument();
    expect(screen.getByTestId('hover-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-view')).toBeInTheDocument();
  });

  it('deve renderizar o CalendarView na rota alias "/calendario"', async () => {
    vi.spyOn(backupService, 'hasExistingLocalData').mockResolvedValue(true);

    render(<TestAppRouter initialEntries={['/calendario']} />);

    expect(screen.getByTestId('calendar-view')).toBeInTheDocument();
  });

  it('deve renderizar a tela de Gestão Global de Pessoas na rota "/pessoas"', async () => {
    vi.spyOn(backupService, 'hasExistingLocalData').mockResolvedValue(true);

    render(<TestAppRouter initialEntries={['/pessoas']} />);

    expect(screen.getByText(/Cadastro Geral de Funcionários/i)).toBeInTheDocument();
    expect(useScheduleStore.getState().currentView).toBe('people');
  });

  it('deve renderizar a tela dedicada de importação na rota "/importar"', async () => {
    vi.spyOn(backupService, 'hasExistingLocalData').mockResolvedValue(true);

    render(<TestAppRouter initialEntries={['/importar']} />);

    expect(screen.getByText(/Selecione o arquivo de backup/i)).toBeInTheDocument();
    expect(useScheduleStore.getState().currentView).toBe('import');
  });

  it('deve renderizar a rota extensível de configurações na rota "/configuracoes"', async () => {
    vi.spyOn(backupService, 'hasExistingLocalData').mockResolvedValue(true);

    render(<TestAppRouter initialEntries={['/configuracoes']} />);

    expect(screen.getByTestId('settings-view')).toBeInTheDocument();
    expect(screen.getByText(/Configurações Gerais/i)).toBeInTheDocument();
  });

  it('deve redirecionar rotas não mapeadas (*) de volta para a rota raiz', async () => {
    vi.spyOn(backupService, 'hasExistingLocalData').mockResolvedValue(true);

    render(<TestAppRouter initialEntries={['/rota-completamente-invalida']} />);

    await waitFor(() => {
      expect(screen.getByTestId('calendar-view')).toBeInTheDocument();
    });
  });

  it('deve navegar entre as rotas através dos links da Sidebar', async () => {
    vi.spyOn(backupService, 'hasExistingLocalData').mockResolvedValue(true);

    render(<TestAppRouter initialEntries={['/']} />);

    // Starts on calendar
    expect(screen.getByTestId('calendar-view')).toBeInTheDocument();

    // Click on people link
    const peopleLink = screen.getByRole('link', { name: /gerenciar pessoas/i });
    fireEvent.click(peopleLink);

    await waitFor(() => {
      expect(screen.getByText(/Cadastro Geral de Funcionários/i)).toBeInTheDocument();
    });

    // Click on import link
    const importLink = screen.getByRole('link', { name: /importar dados/i });
    fireEvent.click(importLink);

    await waitFor(() => {
      expect(screen.getByText(/Selecione o arquivo de backup/i)).toBeInTheDocument();
    });

    // Click on settings link
    const settingsLink = screen.getByRole('link', { name: /configurações/i });
    fireEvent.click(settingsLink);

    await waitFor(() => {
      expect(screen.getByTestId('settings-view')).toBeInTheDocument();
    });
  });

  it('deve aplicar estilo ativo (classes Tailwind) no NavLink correspondente à rota ativa', () => {
    vi.spyOn(backupService, 'hasExistingLocalData').mockResolvedValue(true);

    render(<TestAppRouter initialEntries={['/pessoas']} />);

    const peopleLink = screen.getByRole('link', { name: /gerenciar pessoas/i });
    expect(peopleLink.className).toContain('text-indigo-700');
    expect(peopleLink.className).toContain('font-bold');
  });

  it('deve redirecionar para "/importar" se a rota inicial for "/" e o armazenamento local estiver vazio (onboarding)', async () => {
    vi.spyOn(backupService, 'hasExistingLocalData').mockResolvedValue(false);

    render(<TestAppRouter initialEntries={['/']} />);

    await waitFor(() => {
      expect(screen.getByText(/Selecione o arquivo de backup/i)).toBeInTheDocument();
      expect(useScheduleStore.getState().currentView).toBe('import');
    });
  });
});

