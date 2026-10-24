import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { copyToClipboard } from './clipboard-utils'

describe('clipboard-utils - copyToClipboard', () => {
  const originalClipboard = navigator.clipboard

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true,
    })
  })

  it('returns false for empty text', async () => {
    const result = await copyToClipboard('')
    expect(result).toBe(false)
  })

  it('copies with navigator.clipboard.writeText when available', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    })

    const result = await copyToClipboard('Av. Paulista, 1000')
    expect(result).toBe(true)
    expect(writeTextMock).toHaveBeenCalledWith('Av. Paulista, 1000')
  })

  it('falls back to document.execCommand without navigator.clipboard', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
      configurable: true,
    })

    const execCommandMock = vi.fn().mockReturnValue(true)
    document.execCommand = execCommandMock

    const result = await copyToClipboard('Rua Augusta, 500')
    expect(result).toBe(true)
    expect(execCommandMock).toHaveBeenCalledWith('copy')
  })

  it('returns false and catches the error when copying fails', async () => {
    const writeTextMock = vi.fn().mockRejectedValue(new Error('Permission denied'))
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    })

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const result = await copyToClipboard('Endereço Teste')
    expect(result).toBe(false)
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})

