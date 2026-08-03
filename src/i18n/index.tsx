import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ar } from './ar';
import { en, type TranslationKey } from './en';

export type Locale = 'en' | 'ar';

const messages = { en, ar } as const;

function applyDocumentLocale(locale: Locale) {
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = locale;
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: TranslationKey) => string;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem('admin_locale');
    const next = saved === 'ar' || saved === 'en' ? saved : 'en';
    applyDocumentLocale(next);
    return next;
  });

  useEffect(() => {
    applyDocumentLocale(locale);
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale: (next) => {
      localStorage.setItem('admin_locale', next);
      setLocale(next);
    },
    toggleLocale: () => {
      const next = locale === 'en' ? 'ar' : 'en';
      localStorage.setItem('admin_locale', next);
      setLocale(next);
    },
    t: (key) => messages[locale][key],
    dir: locale === 'ar' ? 'rtl' : 'ltr',
  }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
