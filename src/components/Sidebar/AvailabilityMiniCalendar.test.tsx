import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AvailabilityMiniCalendar } from './AvailabilityMiniCalendar';

describe('AvailabilityMiniCalendar Component', () => {
  it('deve renderizar os dias do mês e contador de dias selecionados', () => {
    const handleChange = vi.fn();
    render(
      <AvailabilityMiniCalendar
        month="2026-10"
        selectedDays={[1, 3, 5]}
        onChange={handleChange}
      />
    );

    expect(screen.getByText(/Disponibilidade \(Outubro de 2026\)/i)).toBeInTheDocument();
    expect(screen.getByText('3 / 31 dias')).toBeInTheDocument();
    // Verify presence of individual days
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '31' })).toBeInTheDocument();
  });

  it('deve acionar atalho de Dias Pares', () => {
    const handleChange = vi.fn();
    render(
      <AvailabilityMiniCalendar
        month="2026-10"
        selectedDays={[]}
        onChange={handleChange}
      />
    );

    const evenBtn = screen.getByRole('button', { name: /Dias Pares/i });
    fireEvent.click(evenBtn);

    expect(handleChange).toHaveBeenCalledTimes(1);
    const calledWith = handleChange.mock.calls[0][0];
    expect(calledWith.length).toBe(15); // Out of 31 days, 15 even days
    expect(calledWith.every((d: number) => d % 2 === 0)).toBe(true);
  });

  it('deve acionar atalho de Dias Ímpares', () => {
    const handleChange = vi.fn();
    render(
      <AvailabilityMiniCalendar
        month="2026-10"
        selectedDays={[]}
        onChange={handleChange}
      />
    );

    const oddBtn = screen.getByRole('button', { name: /Dias Ímpares/i });
    fireEvent.click(oddBtn);

    expect(handleChange).toHaveBeenCalledTimes(1);
    const calledWith = handleChange.mock.calls[0][0];
    expect(calledWith.length).toBe(16); // Out of 31 days, 16 odd days
    expect(calledWith.every((d: number) => d % 2 !== 0)).toBe(true);
  });

  it('deve acionar atalho de Limpar', () => {
    const handleChange = vi.fn();
    render(
      <AvailabilityMiniCalendar
        month="2026-10"
        selectedDays={[2, 4, 6]}
        onChange={handleChange}
      />
    );

    const clearBtn = screen.getByRole('button', { name: /Limpar/i });
    fireEvent.click(clearBtn);

    expect(handleChange).toHaveBeenCalledWith([]);
  });

  it('deve alternar dia individual ao clicar nele', () => {
    const handleChange = vi.fn();
    render(
      <AvailabilityMiniCalendar
        month="2026-10"
        selectedDays={[10]}
        onChange={handleChange}
      />
    );

    // Click on day 15 (not selected -> should add)
    const day15 = screen.getByRole('button', { name: '15' });
    fireEvent.click(day15);
    expect(handleChange).toHaveBeenCalledWith([10, 15]);

    // Click on day 10 (already selected -> should remove)
    const day10 = screen.getByRole('button', { name: '10' });
    fireEvent.click(day10);
    expect(handleChange).toHaveBeenCalledWith([]);
  });
});

