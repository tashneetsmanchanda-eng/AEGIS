/**
 * Internationalization (i18n) locale definitions for AEGIS
 */

export type Locale = 
  | 'en' | 'hi' | 'es' | 'de' | 'pt' | 'fr' | 'it'
  | 'zh' | 'ja' | 'ko' | 'bn' | 'ta' | 'te' | 'mr' | 'ur'
  | 'ar' | 'ru' | 'tr' | 'id' | 'th' | 'el';

export interface Translations {
  // Common
  common: {
    loading: string;
    error: string;
    close: string;
    back: string;
    submit: string;
    cancel: string;
    expand: string;
    collapse: string;
  };
  
  // Navigation & UI
  ui: {
    title: string;
    subtitle: string;
    location: string;
    environment: string;
    analyze: string;
    dashboard: string;
    chat: string;
  };
  
  // System States
  system: {
    monitoring: string;
    verified: string;
    active: string;
    decision: string;
    riskLevel: string;
    riskScore: string;
    confidence: string;
    highConfidence: string;
    mediumConfidence: string;
    lowConfidence: string;
  };
  
  // Actions & Recommendations
  actions: {
    title: string;
    recommended: string;
    required: string;
    timeSensitive: string;
    nonUrgent: string;
  };
  
  // Data & Inputs
  data: {
    inputsConsidered: string;
    technicalDetails: string;
    disasterData: string;
    diseaseSignals: string;
    climateInputs: string;
    locationContext: string;
    historicalData: string;
    syntheticData: string;
  };
  
  // Edge Cases
  edgeCases: {
    aqiUnavailable: string;
    limitedHistoricalData: string;
    overlappingHazards: string;
    insufficientEvidence: string;
  };
  
  // Chat
  chat: {
    placeholder: string;
    userQuestion: string;
    chesealResponse: string;
    analyzing: string;
    explanation: string;
    keyRiskDrivers: string;
    whyThisMatters: string;
  };
  
  // Confidence Explanations
  confidence: {
    high: string;
    medium: string;
    low: string;
    explanation: string;
  };
}

// Language metadata with native names (alphabetically sorted by native name)
export interface LanguageInfo {
  code: Locale;
  nativeName: string;
  englishName: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: 'ar', nativeName: 'العربية', englishName: 'Arabic' },
  { code: 'bn', nativeName: 'বাংলা', englishName: 'Bengali' },
  { code: 'zh', nativeName: '中文', englishName: 'Chinese (Simplified)' },
  { code: 'en', nativeName: 'English', englishName: 'English' },
  { code: 'de', nativeName: 'Deutsch', englishName: 'German' },
  { code: 'el', nativeName: 'Ελληνικά', englishName: 'Greek' },
  { code: 'hi', nativeName: 'हिंदी', englishName: 'Hindi' },
  { code: 'id', nativeName: 'Bahasa Indonesia', englishName: 'Indonesian' },
  { code: 'it', nativeName: 'Italiano', englishName: 'Italian' },
  { code: 'ja', nativeName: '日本語', englishName: 'Japanese' },
  { code: 'ko', nativeName: '한국어', englishName: 'Korean' },
  { code: 'mr', nativeName: 'मराठी', englishName: 'Marathi' },
  { code: 'pt', nativeName: 'Português', englishName: 'Portuguese' },
  { code: 'ru', nativeName: 'Русский', englishName: 'Russian' },
  { code: 'es', nativeName: 'Español', englishName: 'Spanish' },
  { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil' },
  { code: 'te', nativeName: 'తెలుగు', englishName: 'Telugu' },
  { code: 'th', nativeName: 'ภาษาไทย', englishName: 'Thai' },
  { code: 'tr', nativeName: 'Türkçe', englishName: 'Turkish' },
  { code: 'ur', nativeName: 'اردو', englishName: 'Urdu' },
  { code: 'fr', nativeName: 'Français', englishName: 'French' },
];

// Sort by native name (locale-aware sorting)
LANGUAGES.sort((a, b) => a.nativeName.localeCompare(b.nativeName, undefined, { sensitivity: 'base' }));

// Fallback translation function (returns English translations for now)
const getEnglishTranslations = (): Translations => ({
  common: {
    loading: 'Loading...',
    error: 'Error',
    close: 'Close',
    back: 'Back',
    submit: 'Submit',
    cancel: 'Cancel',
    expand: 'Expand',
    collapse: 'Collapse',
  },
  ui: {
    title: 'AEGIS - AI Public Risk Decision System',
    subtitle: 'An AI Crisis Co-Pilot for Cascading Disasters',
    location: 'Location',
    environment: 'Environment',
    analyze: 'Analyze Risk',
    dashboard: 'Dashboard',
    chat: 'Chat',
  },
  system: {
    monitoring: 'MONITORING',
    verified: 'VERIFIED DATA',
    active: 'AUTOMATION ACTIVE',
    decision: 'SYSTEM DECISION',
    riskLevel: 'RISK LEVEL',
    riskScore: 'RISK SCORE',
    confidence: 'Decision Confidence',
    highConfidence: 'High',
    mediumConfidence: 'Medium',
    lowConfidence: 'Low',
  },
  actions: {
    title: 'RECOMMENDED ACTIONS',
    recommended: 'Recommended',
    required: 'Required',
    timeSensitive: 'TIME-SENSITIVE',
    nonUrgent: 'NON-URGENT',
  },
  data: {
    inputsConsidered: 'Inputs Considered',
    technicalDetails: 'View Technical Details',
    disasterData: 'Disaster Data',
    diseaseSignals: 'Disease Signals',
    climateInputs: 'Climate Inputs',
    locationContext: 'Location Context',
    historicalData: 'Historical Data',
    syntheticData: 'Synthetic Data',
  },
  edgeCases: {
    aqiUnavailable: 'AQI data unavailable — using regional average',
    limitedHistoricalData: 'Limited historical data — projections may have higher uncertainty',
    overlappingHazards: 'Overlapping hazards detected — cascading risk amplified',
    insufficientEvidence: 'Insufficient evidence — confidence below threshold',
  },
  chat: {
    placeholder: 'Ask CHESEAL a question…',
    userQuestion: 'USER QUESTION',
    chesealResponse: 'CHESEAL — AI ANALYST',
    analyzing: 'Analyzing with CHESEAL...',
    explanation: 'EXPLANATION',
    keyRiskDrivers: 'Key Risk Drivers',
    whyThisMatters: 'Why This Matters',
  },
  confidence: {
    high: 'High confidence due to consistent signals across multiple data sources',
    medium: 'Medium confidence — some uncertainty in data quality or model inputs',
    low: 'Low confidence — limited data or conflicting signals detected',
    explanation: 'Confidence Level',
  },
});

// Simple translations object (expanded later)
const translations: Partial<Record<Locale, Translations>> = {
  en: getEnglishTranslations(),
};

export const getTranslation = (locale: Locale): Translations => {
  return translations[locale] || getEnglishTranslations();
};

export const getLanguageInfo = (code: Locale): LanguageInfo | undefined => {
  return LANGUAGES.find(lang => lang.code === code);
};

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  hi: 'हिंदी',
  es: 'Español',
  de: 'Deutsch',
  pt: 'Português',
  fr: 'Français',
  it: 'Italiano',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  bn: 'বাংলা',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  mr: 'मराठी',
  ur: 'اردو',
  ar: 'العربية',
  ru: 'Русский',
  tr: 'Türkçe',
  id: 'Bahasa Indonesia',
  th: 'ภาษาไทย',
  el: 'Ελληνικά',
};
