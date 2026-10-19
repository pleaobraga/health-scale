import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { LanguageSelector } from './language-selector'
import { i18n, LANGUAGE_STORAGE_KEY } from '../../i18n'

describe('LanguageSelector Component', () => {
  beforeEach(async () => {
    localStorage.clear()
    await i18n.changeLanguage('pt-BR')
  })

  it('deve renderizar o idioma ativo Português (Brasil) por padrão no modo full', () => {
    render(<LanguageSelector variant="full" />)

    const trigger = screen.getByRole('button', {
      name: /idioma atual: português \(brasil\)/i,
    })
    expect(trigger).toBeInTheDocument()
    expect(screen.getByText('Português (Brasil)')).toBeInTheDocument()
  })

  it('deve renderizar o modo compacto exibindo o botão acessível', () => {
    render(<LanguageSelector variant="compact" />)

    const trigger = screen.getByRole('button', {
      name: /idioma atual: português \(brasil\)/i,
    })
    expect(trigger).toBeInTheDocument()
  })

  it('deve abrir o menu ao clicar e alternar o idioma para English (US)', async () => {
    render(<LanguageSelector variant="full" />)

    const trigger = screen.getByRole('button', {
      name: /idioma atual: português \(brasil\)/i,
    })
    fireEvent.click(trigger)

    expect(screen.getByRole('listbox')).toBeInTheDocument()
    const englishOption = screen.getByRole('option', {
      name: /english \(us\)/i,
    })
    expect(englishOption).toBeInTheDocument()

    fireEvent.click(englishOption)

    await waitFor(() => {
      expect(i18n.language).toBe('en-US')
      expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en-US')
    })
  })

  it('deve fechar o dropdown ao pressionar a tecla Escape', () => {
    render(<LanguageSelector variant="full" />)

    const trigger = screen.getByRole('button', {
      name: /idioma atual: português \(brasil\)/i,
    })
    fireEvent.click(trigger)

    expect(screen.getByRole('listbox')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('deve fechar o dropdown ao clicar fora', () => {
    render(
      <div>
        <div data-testid="outside-element">Fora</div>
        <LanguageSelector variant="full" />
      </div>,
    )

    const trigger = screen.getByRole('button', {
      name: /idioma atual: português \(brasil\)/i,
    })
    fireEvent.click(trigger)

    expect(screen.getByRole('listbox')).toBeInTheDocument()

    fireEvent.mouseDown(screen.getByTestId('outside-element'))

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
