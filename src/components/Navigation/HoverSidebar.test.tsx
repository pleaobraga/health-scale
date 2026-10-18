import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HoverSidebar } from './HoverSidebar';
import { useScheduleStore } from '../../store/useScheduleStore';

describe('HoverSidebar Component', () => {
  beforeEach(() => {
    useScheduleStore.setState({
      currentView: 'calendar',
      isDarkMode: false,
    });
  });

  it('deve renderizar a logo, os links de navegação e o alternador de tema', () => {
    render(<HoverSidebar />);

    expect(screen.getAllByText('Escalas Mensais').length).toBeGreaterThan(0);
    expect(screen.getAllByText('HealthScale').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /calendário de escalas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /gerenciar pessoas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mudar para modo escuro/i })).toBeInTheDocument();
  });

  it('deve alternar a tela para "people" ao clicar em Gerenciar Pessoas', () => {
    render(<HoverSidebar />);

    const peopleBtn = screen.getByRole('button', { name: /gerenciar pessoas/i });
    fireEvent.click(peopleBtn);

    expect(useScheduleStore.getState().currentView).toBe('people');
  });

  it('deve alternar a tela para "calendar" ao clicar em Calendário de Escalas', () => {
    useScheduleStore.setState({ currentView: 'people' });
    render(<HoverSidebar />);

    const calendarBtn = screen.getByRole('button', { name: /calendário de escalas/i });
    fireEvent.click(calendarBtn);

    expect(useScheduleStore.getState().currentView).toBe('calendar');
  });

  it('deve alternar entre Dark Mode e Light Mode e alterar a classe dark no documento', () => {
    render(<HoverSidebar />);

    const toggleBtn = screen.getByRole('button', { name: /mudar para modo escuro/i });
    fireEvent.click(toggleBtn);

    expect(useScheduleStore.getState().isDarkMode).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    const toggleLightBtn = screen.getByRole('button', { name: /mudar para modo claro/i });
    fireEvent.click(toggleLightBtn);

    expect(useScheduleStore.getState().isDarkMode).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('deve alternar a tela para "import" ao clicar em Importar Dados', () => {
    render(<HoverSidebar />);

    const importBtn = screen.getByRole('button', { name: /importar dados/i });
    fireEvent.click(importBtn);

    expect(useScheduleStore.getState().currentView).toBe('import');
  });

  it('deve exibir o botão de Exportar Dados e permitir o clique', () => {
    render(<HoverSidebar />);

    const exportBtn = screen.getByRole('button', { name: /exportar dados/i });
    expect(exportBtn).toBeInTheDocument();
    fireEvent.click(exportBtn);
  });

  it('deve exibir o cabeçalho mobile e abrir o menu em tela cheia ao clicar no botão de menu', () => {
    render(<HoverSidebar />);

    // Cabeçalho mobile visível com botão de menu
    const mobileHeader = screen.getByTestId('mobile-header');
    expect(mobileHeader).toBeInTheDocument();

    const menuBtn = screen.getByTestId('mobile-menu-button');
    expect(menuBtn).toBeInTheDocument();

    // Menu em tela cheia inicialmente fechado
    expect(screen.queryByTestId('mobile-fullscreen-menu')).not.toBeInTheDocument();

    // Clica para abrir o menu em tela cheia
    fireEvent.click(menuBtn);
    expect(screen.getByTestId('mobile-fullscreen-menu')).toBeInTheDocument();

    // Clica para fechar o menu
    const closeBtn = screen.getByTestId('mobile-menu-close');
    fireEvent.click(closeBtn);
    expect(screen.queryByTestId('mobile-fullscreen-menu')).not.toBeInTheDocument();
  });
});

