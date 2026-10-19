import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import enAddresses from './locales/en-US/addresses.json'
import enAuth from './locales/en-US/auth.json'
import enCalendar from './locales/en-US/calendar.json'
import enCommon from './locales/en-US/common.json'
import enImport from './locales/en-US/import.json'
import enPeople from './locales/en-US/people.json'
import enSettings from './locales/en-US/settings.json'
import enUsers from './locales/en-US/users.json'
import ptAddresses from './locales/pt-BR/addresses.json'
import ptAuth from './locales/pt-BR/auth.json'
import ptCalendar from './locales/pt-BR/calendar.json'
import ptCommon from './locales/pt-BR/common.json'
import ptImport from './locales/pt-BR/import.json'
import ptPeople from './locales/pt-BR/people.json'
import ptSettings from './locales/pt-BR/settings.json'
import ptUsers from './locales/pt-BR/users.json'

export const LANGUAGE_STORAGE_KEY = 'health-schedule:language'

export const defaultNS = 'common'

export const resources = {
  'pt-BR': {
    common: ptCommon,
    auth: ptAuth,
    calendar: ptCalendar,
    people: ptPeople,
    settings: ptSettings,
    addresses: ptAddresses,
    users: ptUsers,
    import: ptImport,
  },
  'en-US': {
    common: enCommon,
    auth: enAuth,
    calendar: enCalendar,
    people: enPeople,
    settings: enSettings,
    addresses: enAddresses,
    users: enUsers,
    import: enImport,
  },
} as const

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS,
    fallbackLng: 'pt-BR',
    lng: typeof localStorage !== 'undefined'
      ? (localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'pt-BR')
      : 'pt-BR',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
  })

export { i18n }

