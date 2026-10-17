import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { FullScreenCalendarModal } from './FullScreenCalendarModal';
import { useScheduleStore } from '../../store/useScheduleStore';

describe('FullScreenCalendarModal', () => {
  beforeEach(() => {
    useScheduleStore.setState({
      isFullScreenModalOpen: false,
      currentMonth: '2026-10',
      persons: [
        { id: 'p1', name: 'Dr. Roberto Alves', color: '#3B82F6' },
      ],
      assignments: {
        '2026-10-15': ['p1'],
      },
      events: [
        { id: 'e1', date: '2026-10-15', title: 'Dia do Professor' },
      ],
    });
  });

  it('does not render when isFullScreenModalOpen is false', () => {
    render(<FullScreenCalendarModal />);
    expect(screen.queryByText(/outubro de 2026/i)).not.toBeInTheDocument();
  });

  it('renders correctly with month and year and assignments when open', () => {
    useScheduleStore.setState({ isFullScreenModalOpen: true });
    render(<FullScreenCalendarModal />);

    // Title should show month and year
    expect(screen.getByText(/outubro de 2026/i)).toBeInTheDocument();
    expect(screen.getByText('Tela Cheia')).toBeInTheDocument();

    // Should render assigned person name
    expect(screen.getByText('Dr. Roberto Alves')).toBeInTheDocument();
  });

  it('closes when close button is clicked', () => {
    useScheduleStore.setState({ isFullScreenModalOpen: true });
    render(<FullScreenCalendarModal />);

    const closeBtn = screen.getByTitle(/fechar tela cheia/i);
    fireEvent.click(closeBtn);

    expect(useScheduleStore.getState().isFullScreenModalOpen).toBe(false);
  });

  it('closes on Escape key press', () => {
    useScheduleStore.setState({ isFullScreenModalOpen: true });
    render(<FullScreenCalendarModal />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(useScheduleStore.getState().isFullScreenModalOpen).toBe(false);
  });
});

