import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, getTranslation, Translations } from '../i18n/locales';

const LANGUAGE_STORAGE_KEY = 'AEGIS_LANGUAGE';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  // Load from localStorage on mount, default to 'en' safely
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (stored && ['en', 'de', 'hi', 'es', 'pt', 'fr', 'it', 'tr', 'ru', 'ar', 'zh', 'ja', 'ko', 'bn', 'ta', 'te', 'mr', 'ur', 'id', 'th', 'el'].includes(stored)) {
          return stored as Locale;
        }
      } catch (e) {
        // localStorage access failed, fallback to 'en'
        console.warn('Failed to read language from localStorage:', e);
      }
    }
    return 'en';
  });

  const t = getTranslation(locale);

  // Persist to localStorage when locale changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
      } catch (e) {
        console.warn('Failed to save language to localStorage:', e);
      }
    }
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    // Also save to localStorage immediately
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, newLocale);
      } catch (e) {
        console.warn('Failed to save language to localStorage:', e);
      }
    }
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
}
