import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { LanguageSelector } from './language-selector'
import { i18n, LANGUAGE_STORAGE_KEY } from '../../i18n'

describe('LanguageSelector Component', () => {
  beforeEach(async () => {
    localStorage.clear()
    await i18n.changeLanguage('pt-BR')
  })

  it('renders Português (Brasil) as the default language in the full variant', () => {
    render(<LanguageSelector variant="full" />)

    const trigger = screen.getByRole('button', {
      name: /idioma atual: português \(brasil\)/i,
    })
    expect(trigger).toBeInTheDocument()
    expect(screen.getByText('Português (Brasil)')).toBeInTheDocument()
  })

  it('renders the centered menu variant used in headers and mobile drawers', () => {
    render(<LanguageSelector variant="menu" />)

    const trigger = screen.getByRole('button', {
      name: /idioma atual: português \(brasil\)/i,
    })
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveClass('justify-center')
    expect(trigger).toHaveClass('rounded-2xl')
    expect(screen.getByText('Português (Brasil)')).toBeInTheDocument()
  })

  it('opens the menu and switches the language to English (US)', async () => {
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

  it('closes the dropdown on Escape', () => {
    render(<LanguageSelector variant="full" />)

    const trigger = screen.getByRole('button', {
      name: /idioma atual: português \(brasil\)/i,
    })
    fireEvent.click(trigger)

    expect(screen.getByRole('listbox')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes the dropdown on outside click', () => {
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
