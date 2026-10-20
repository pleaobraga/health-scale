import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'

import { i18n, LANGUAGE_STORAGE_KEY } from '../i18n'

beforeEach(() => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, 'pt-BR')
  void i18n.changeLanguage('pt-BR')
})

// Automatically clean up rendered DOM and reset storage/language after each test
afterEach(() => {
  cleanup()
  localStorage.clear()
  if (typeof document !== 'undefined') {
    document.cookie = ''
  }
  void i18n.changeLanguage('pt-BR')
})

