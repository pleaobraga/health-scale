import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ToastViewport } from './toast-viewport'
import { TOAST_DURATION_MS, useToastStore } from '../../store/use-toast-store'

describe('ToastViewport', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useToastStore.setState({ toasts: [] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders success toasts as status and error toasts as alert', () => {
    render(<ToastViewport />)

    act(() => {
      useToastStore.getState().showToast('success', 'Schedule saved.')
      useToastStore.getState().showToast('error', 'Cloud failure.')
    })

    expect(screen.getByRole('status')).toHaveTextContent('Schedule saved.')
    expect(screen.getByRole('alert')).toHaveTextContent('Cloud failure.')
  })

  it('dismisses a toast with the close button', () => {
    render(<ToastViewport />)
    act(() => {
      useToastStore.getState().showToast('success', 'Schedule saved.')
    })

    fireEvent.click(screen.getByRole('button', { name: /fechar/i }))

    expect(screen.queryByText('Schedule saved.')).not.toBeInTheDocument()
  })

  it('removes a toast automatically after its duration', () => {
    render(<ToastViewport />)
    act(() => {
      useToastStore.getState().showToast('error', 'Cloud failure.')
    })

    act(() => {
      vi.advanceTimersByTime(TOAST_DURATION_MS)
    })

    expect(screen.queryByText('Cloud failure.')).not.toBeInTheDocument()
  })

  it('keeps at most three toasts visible', () => {
    render(<ToastViewport />)
    act(() => {
      ;['1', '2', '3', '4'].forEach((n) => useToastStore.getState().showToast('info', `Notice ${n}`))
    })

    expect(screen.queryByText('Notice 1')).not.toBeInTheDocument()
    expect(screen.getAllByRole('status')).toHaveLength(3)
  })
})
