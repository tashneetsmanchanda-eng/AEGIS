/**
 * Safe output translation for analytical content
 * Translates CHESEAL responses, CASCADE explanations, confidence text
 * Always falls back to original English if translation fails
 */

/**
 * Safe translation function for backend outputs
 * Returns translated text if available, otherwise returns original
 * Guarantees no crashes or undefined returns
 */
export function translateOutput(text: string, language: string): string {
  // If English, return as-is
  if (!text || language === 'en') {
    return text;
  }

  // For MVP: Backend should handle translation
  // This is a safety fallback that ensures stability
  // If backend doesn't support the language, return English
  // This prevents white screen and ensures demo works
  
  try {
    // For now, return original text
    // Backend is responsible for translation
    // This function exists as a safety layer
    return text;
  } catch (error) {
    console.warn('[Translation] Translation failed, using original:', error);
    return text; // Always fallback to original
  }
}

/**
 * Get language display name for indicator
 */
export function getLanguageDisplay(languageCode: string): string {
  const languageNames: Record<string, string> = {
    en: 'English 🇬🇧',
    de: 'Deutsch 🇩🇪',
    hi: 'हिंदी 🇮🇳',
    es: 'Español 🇪🇸',
    pt: 'Português 🇵🇹',
    fr: 'Français 🇫🇷',
    it: 'Italiano 🇮🇹',
    tr: 'Türkçe 🇹🇷',
    ru: 'Русский 🇷🇺',
    ar: 'العربية 🇸🇦',
  };
  
  return languageNames[languageCode] || `Language: ${languageCode.toUpperCase()}`;
}

