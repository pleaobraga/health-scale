import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

import { i18n } from '../i18n'

// Automatically clean up rendered DOM and reset storage/language after each test
afterEach(() => {
  cleanup()
  localStorage.clear()
  void i18n.changeLanguage('pt-BR')
})

