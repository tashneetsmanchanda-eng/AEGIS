import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocale } from '../contexts/LocaleContext';
import { LANGUAGES, getLanguageInfo, type Locale } from '../i18n/locales';

export function LanguageSelector() {
  const { locale, setLocale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = getLanguageInfo(locale);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, langCode: Locale) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setLocale(langCode);
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  };

  return (
    <>
      {/* Globe toggle button - Fixed position, top-left, fully visible */}
      <div
        className="language-toggle"
        style={{
          position: 'fixed',
          top: '12px',
          left: '12px',
          zIndex: 10000,
        }}
      >
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:text-white hover:border-slate-600/50 transition-all focus:outline-none focus:ring-2 focus:ring-[#D946EF]/50 focus:border-[#D946EF]/50"
          aria-label="Select language"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <Globe className="w-4 h-4" />
          <span className="text-xs uppercase tracking-wider font-medium">
            {currentLanguage?.code.toUpperCase() || locale.toUpperCase()}
          </span>
        </button>
      </div>

      {/* Portal dropdown - Fixed position, scrollable, below header */}
      {isOpen && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0"
                style={{ zIndex: 9999 }}
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
              />
              
              {/* Dropdown sidebar - Fixed position, viewport-safe, scrollable */}
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
                className="language-dropdown rounded-lg bg-slate-800 border border-slate-700/50 shadow-2xl"
                style={{
                  position: 'fixed',
                  top: '64px',
                  left: '16px',
                  width: '280px',
                  maxHeight: '70vh',
                  overflowY: 'auto',
                  zIndex: 10000,
                  padding: '4px 0',
                }}
                role="listbox"
                aria-label="Language selection"
              >
                <div style={{ overflow: 'hidden', maxHeight: 'unset' }}>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLocale(lang.code);
                        setIsOpen(false);
                        buttonRef.current?.focus();
                      }}
                      onKeyDown={(e) => handleKeyDown(e, lang.code)}
                      className={`w-full px-4 py-3 text-left text-sm transition-colors border-b border-slate-700/30 last:border-b-0 ${
                        locale === lang.code
                          ? 'bg-[#D946EF]/20 text-[#D946EF]'
                          : 'text-slate-300 hover:bg-[#D946EF]/10 hover:text-white'
                      } focus:outline-none focus:bg-[#D946EF]/20 focus:text-[#D946EF]`}
                      role="option"
                      aria-selected={locale === lang.code}
                      tabIndex={0}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{lang.nativeName}</span>
                        {locale === lang.code && (
                          <span className="text-[#D946EF] text-xs">✓</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {lang.englishName}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
