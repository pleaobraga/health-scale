import { Check, ChevronDown, Globe } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { BrazilFlag, UsaFlag } from './flag-icons'
import { LANGUAGE_STORAGE_KEY } from '../../i18n'

export type SupportedLanguage = 'pt-BR' | 'en-US'

export interface LanguageOption {
  code: SupportedLanguage
  label: string
  flag: React.ComponentType<{ className?: string }>
}

const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'pt-BR',
    label: 'Português (Brasil)',
    flag: BrazilFlag,
  },
  {
    code: 'en-US',
    label: 'English (US)',
    flag: UsaFlag,
  },
]

export interface LanguageSelectorProps {
  variant?: 'compact' | 'full' | 'sidebar' | 'menu'
  className?: string
  buttonClassName?: string
  align?: 'top' | 'bottom' | 'left' | 'right'
}

export function LanguageSelector({
  variant = 'full',
  className = '',
  buttonClassName = '',
  align = 'top',
}: LanguageSelectorProps) {
  const { i18n, t } = useTranslation('common')
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Current language normalized to supported codes
  const currentLangCode: SupportedLanguage =
    i18n.language === 'en-US' || i18n.language.startsWith('en')
      ? 'en-US'
      : 'pt-BR'

  const currentOption =
    SUPPORTED_LANGUAGES.find((lang) => lang.code === currentLangCode) ||
    SUPPORTED_LANGUAGES[0]

  const CurrentFlag = currentOption.flag

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleSelectLanguage = async (code: SupportedLanguage) => {
    try {
      await i18n.changeLanguage(code)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, code)
      }
    } catch (err) {
      console.error('Failed to change language:', err)
    } finally {
      setIsOpen(false)
    }
  }

  // Position alignment styling for dropdown menu
  const menuPlacementClass =
    align === 'top'
      ? 'left-0 bottom-full mb-2'
      : align === 'right'
        ? 'right-0 top-full mt-2'
        : 'left-0 top-full mt-2'

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block text-left select-none ${className}`}
      data-testid="language-selector"
    >
      {/* Trigger Button */}
      {variant === 'compact' ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          title={`Idioma: ${currentOption.label}`}
          aria-label={`Idioma atual: ${currentOption.label}`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={`w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${buttonClassName}`}
        >
          <CurrentFlag className="w-5 h-5" />
        </button>
      ) : variant === 'sidebar' ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          title={`Idioma: ${currentOption.label}`}
          aria-label={`Idioma atual: ${currentOption.label}`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${buttonClassName}`}
        >
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            <CurrentFlag className="w-5 h-5" />
          </div>
          <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden flex items-center justify-between flex-1 min-w-0">
            <span className="truncate">{currentOption.label}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>
      ) : variant === 'menu' ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={`Idioma atual: ${currentOption.label}`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold shadow-xs transition focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${buttonClassName}`}
        >
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            <CurrentFlag className="w-5 h-3.5" />
          </div>
          <span>{currentOption.label}</span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={`Idioma atual: ${currentOption.label}`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-2xs transition focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${buttonClassName}`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <CurrentFlag className="w-5 h-3.5" />
            <span className="truncate">{currentOption.label}</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-500 transition-transform duration-200 shrink-0 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      )}

      {/* Dropdown Menu Options */}
      {isOpen && (
        <div
          role="listbox"
          aria-label={t('languages.select', {
            defaultValue: 'Opções de idioma',
          })}
          className={`absolute ${menuPlacementClass} z-50 ${
            variant === 'menu' ? 'w-full' : 'min-w-[200px] w-full max-w-xs'
          } bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-150`}
        >
          <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/60 mb-1">
            <Globe className="w-3 h-3" />
            <span>{t('languages.title')}</span>
          </div>

          <div className="space-y-0.5">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const Flag = lang.flag
              const isSelected = lang.code === currentLangCode

              return (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/80 dark:border-indigo-800/80'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Flag className="w-5 h-3.5" />
                    <span className="truncate">{lang.label}</span>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
