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

  it('deve retornar false quando o texto for vazio', async () => {
    const result = await copyToClipboard('')
    expect(result).toBe(false)
  })

  it('deve copiar usando navigator.clipboard.writeText quando disponível', async () => {
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

  it('deve usar o fallback document.execCommand quando navigator.clipboard não estiver disponível', async () => {
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

  it('deve retornar false e capturar erro caso a cópia falhe', async () => {
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

