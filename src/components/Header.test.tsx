import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';
import { useScheduleStore } from '../store/useScheduleStore';

describe('Header Component', () => {
  beforeEach(() => {
    useScheduleStore.setState({ isDarkMode: false });
  });

  it('deve renderizar o título principal e o badge Local-First', () => {
    render(<Header />);
    expect(screen.getByText('Gerenciador de Escalas Mensais')).toBeInTheDocument();
    expect(screen.getByText('Local-First')).toBeInTheDocument();
  });

  it('NÃO deve conter o botão Restaurar Exemplo', () => {
    render(<Header />);
    expect(screen.queryByText(/Restaurar Exemplo/i)).not.toBeInTheDocument();
  });

  it('deve alternar o tema ao clicar no botão de Dark Mode', () => {
    render(<Header />);

    const darkModeBtn = screen.getByRole('button', { name: /Mudar para Modo Escuro/i });
    expect(darkModeBtn).toBeInTheDocument();

    fireEvent.click(darkModeBtn);
    expect(useScheduleStore.getState().isDarkMode).toBe(true);

    const lightModeBtn = screen.getByRole('button', { name: /Mudar para Modo Claro/i });
    expect(lightModeBtn).toBeInTheDocument();

    fireEvent.click(lightModeBtn);
    expect(useScheduleStore.getState().isDarkMode).toBe(false);
  });
});

