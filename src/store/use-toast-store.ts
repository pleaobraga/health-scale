import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
}

export const TOAST_DURATION_MS = 4500
const MAX_VISIBLE_TOASTS = 3

interface ToastStore {
  toasts: Toast[]
  showToast: (type: ToastType, message: string) => string
  dismissToast: (id: string) => void
}

/**
 * App-wide notifications (cloud sync, saving, etc.). Schedule validation issues are not
 * toasts: they stay in the calendar's diagnostics.
 */
export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  showToast: (type, message) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    set({ toasts: [...get().toasts, { id, type, message }].slice(-MAX_VISIBLE_TOASTS) })
    setTimeout(() => get().dismissToast(id), TOAST_DURATION_MS)
    return id
  },

  dismissToast: (id) => {
    set({ toasts: get().toasts.filter((toast) => toast.id !== id) })
  },
}))

export const showSuccessToast = (message: string) =>
  useToastStore.getState().showToast('success', message)

export const showErrorToast = (message: string) =>
  useToastStore.getState().showToast('error', message)
