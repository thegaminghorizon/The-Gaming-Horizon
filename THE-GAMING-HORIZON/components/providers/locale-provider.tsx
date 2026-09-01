'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  CURRENCIES,
  DEFAULT_CURRENCY,
  DEFAULT_LANGUAGE,
  LANGUAGES,
  TRANSLATIONS,
  formatCurrency,
  type CurrencyOption,
  type LanguageOption,
  type TranslationKey,
} from '@/lib/i18n'

const LANGUAGE_STORAGE_KEY = 'gh-language'
const CURRENCY_STORAGE_KEY = 'gh-currency'

interface LocaleContextValue {
  language: LanguageOption
  currency: CurrencyOption
  setLanguage: (language: LanguageOption) => void
  setCurrency: (currency: CurrencyOption) => void
  /** Translate a dictionary key for the active language, falling back to English. */
  t: (key: TranslationKey) => string
  /** Format a USD reference amount into the active currency, localized to the active language. */
  formatPrice: (usdAmount: number) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

function readStoredLanguage(): LanguageOption {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE
  try {
    const code = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return LANGUAGES.find((lang) => lang.code === code) ?? DEFAULT_LANGUAGE
  } catch {
    return DEFAULT_LANGUAGE
  }
}

function readStoredCurrency(): CurrencyOption {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY
  try {
    const code = window.localStorage.getItem(CURRENCY_STORAGE_KEY)
    return CURRENCIES.find((cur) => cur.code === code) ?? DEFAULT_CURRENCY
  } catch {
    return DEFAULT_CURRENCY
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageOption>(DEFAULT_LANGUAGE)
  const [currency, setCurrencyState] = useState<CurrencyOption>(DEFAULT_CURRENCY)

  // Hydrate from localStorage after mount (avoids SSR/client markup mismatch).
  useEffect(() => {
    setLanguageState(readStoredLanguage())
    setCurrencyState(readStoredCurrency())
  }, [])

  // Keep <html lang="..."> in sync so screen readers, spellcheck, and
  // browser translation UI reflect the selected language site-wide.
  useEffect(() => {
    document.documentElement.lang = language.code
  }, [language])

  const setLanguage = useCallback((next: LanguageOption) => {
    setLanguageState(next)
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next.code)
    } catch {
      // Best-effort persistence — the selection still applies for this session.
    }
  }, [])

  const setCurrency = useCallback((next: CurrencyOption) => {
    setCurrencyState(next)
    try {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, next.code)
    } catch {
      // Best-effort persistence — the selection still applies for this session.
    }
  }, [])

  const t = useCallback(
    (key: TranslationKey) => {
      const table = TRANSLATIONS[language.code] as Record<string, string>
      return table[key] ?? TRANSLATIONS.en[key] ?? key
    },
    [language],
  )

  const formatPrice = useCallback(
    (usdAmount: number) => formatCurrency(usdAmount, currency, language.tag),
    [currency, language],
  )

  const value = useMemo<LocaleContextValue>(
    () => ({ language, currency, setLanguage, setCurrency, t, formatPrice }),
    [currency, formatPrice, language, setCurrency, setLanguage, t],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}
