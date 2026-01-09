"""
Translation templates for Consequence Mirror outputs.

Provides language-specific templates for impact statements and infrastructure statuses.
Numbers, dates, and metrics are NOT translated - only the template text.
"""

# Phase names by language
PHASE_TRANSLATIONS = {
    "en": {"immediate": "Immediate", "secondary": "Secondary", "long_term": "Long-term"},
    "de": {"immediate": "Sofort", "secondary": "Sekundär", "long_term": "Langfristig"},
    "hi": {"immediate": "तत्काल", "secondary": "द्वितीयक", "long_term": "दीर्घकालिक"},
    "es": {"immediate": "Inmediato", "secondary": "Secundario", "long_term": "A largo plazo"},
    "fr": {"immediate": "Immédiat", "secondary": "Secondaire", "long_term": "Long terme"},
    "pt": {"immediate": "Imediato", "secondary": "Secundário", "long_term": "Longo prazo"},
    "it": {"immediate": "Immediato", "secondary": "Secondario", "long_term": "Lungo termine"},
    "tr": {"immediate": "Acil", "secondary": "İkincil", "long_term": "Uzun vadeli"},
    "ru": {"immediate": "Немедленный", "secondary": "Вторичный", "long_term": "Долгосрочный"},
    "ar": {"immediate": "فوري", "secondary": "ثانوي", "long_term": "طويل الأمد"},
}

# Infrastructure status translations
INFRASTRUCTURE_STATUS_TRANSLATIONS = {
    "en": {
        "Operational": "Operational",
        "Degraded": "Degraded",
        "Critical": "Critical",
        "Quality Degraded": "Quality Degraded",
        "Contamination Breach": "Contamination Breach",
        "Minimal Impact": "Minimal Impact",
        "Moderate Impact": "Moderate Impact",
        "Severe Impact": "Severe Impact",
    },
    "de": {
        "Operational": "Funktionsfähig",
        "Degraded": "Beeinträchtigt",
        "Critical": "Kritisch",
        "Quality Degraded": "Qualität beeinträchtigt",
        "Contamination Breach": "Kontaminationsbruch",
        "Minimal Impact": "Minimale Auswirkungen",
        "Moderate Impact": "Mäßige Auswirkungen",
        "Severe Impact": "Schwere Auswirkungen",
    },
    "hi": {
        "Operational": "परिचालन",
        "Degraded": "अवनत",
        "Critical": "गंभीर",
        "Quality Degraded": "गुणवत्ता अवनत",
        "Contamination Breach": "संदूषण उल्लंघन",
        "Minimal Impact": "न्यूनतम प्रभाव",
        "Moderate Impact": "मध्यम प्रभाव",
        "Severe Impact": "गंभीर प्रभाव",
    },
    "es": {
        "Operational": "Operativo",
        "Degraded": "Degradado",
        "Critical": "Crítico",
        "Quality Degraded": "Calidad degradada",
        "Contamination Breach": "Brecha de contaminación",
        "Minimal Impact": "Impacto mínimo",
        "Moderate Impact": "Impacto moderado",
        "Severe Impact": "Impacto severo",
    },
    "fr": {
        "Operational": "Opérationnel",
        "Degraded": "Dégradé",
        "Critical": "Critique",
        "Quality Degraded": "Qualité dégradée",
        "Contamination Breach": "Brèche de contamination",
        "Minimal Impact": "Impact minimal",
        "Moderate Impact": "Impact modéré",
        "Severe Impact": "Impact sévère",
    },
    "pt": {
        "Operational": "Operacional",
        "Degraded": "Degradado",
        "Critical": "Crítico",
        "Quality Degraded": "Qualidade degradada",
        "Contamination Breach": "Brecha de contaminação",
        "Minimal Impact": "Impacto mínimo",
        "Moderate Impact": "Impacto moderado",
        "Severe Impact": "Impacto severo",
    },
    "it": {
        "Operational": "Operativo",
        "Degraded": "Degradato",
        "Critical": "Critico",
        "Quality Degraded": "Qualità degradata",
        "Contamination Breach": "Breccia di contaminazione",
        "Minimal Impact": "Impatto minimo",
        "Moderate Impact": "Impatto moderato",
        "Severe Impact": "Impatto severo",
    },
    "tr": {
        "Operational": "Operasyonel",
        "Degraded": "Bozulmuş",
        "Critical": "Kritik",
        "Quality Degraded": "Kalite bozulmuş",
        "Contamination Breach": "Kirlenme ihlali",
        "Minimal Impact": "Minimal etki",
        "Moderate Impact": "Orta etki",
        "Severe Impact": "Ciddi etki",
    },
    "ru": {
        "Operational": "Работоспособен",
        "Degraded": "Снижен",
        "Critical": "Критический",
        "Quality Degraded": "Качество снижено",
        "Contamination Breach": "Нарушение загрязнения",
        "Minimal Impact": "Минимальное воздействие",
        "Moderate Impact": "Умеренное воздействие",
        "Severe Impact": "Тяжелое воздействие",
    },
    "ar": {
        "Operational": "تشغيلي",
        "Degraded": "متدهور",
        "Critical": "حرج",
        "Quality Degraded": "جودة متدهورة",
        "Contamination Breach": "خرق التلوث",
        "Minimal Impact": "تأثير ضئيل",
        "Moderate Impact": "تأثير متوسط",
        "Severe Impact": "تأثير شديد",
    },
}


def translate_phase(phase: str, language_code: str) -> str:
    """Translate phase name."""
    lang = language_code.lower() if language_code else "en"
    translations = PHASE_TRANSLATIONS.get(lang, PHASE_TRANSLATIONS["en"])
    
    phase_lower = phase.lower()
    if "immediate" in phase_lower:
        return translations["immediate"]
    elif "secondary" in phase_lower:
        return translations["secondary"]
    elif "long" in phase_lower or "term" in phase_lower:
        return translations["long_term"]
    return phase  # Fallback to original


def translate_impact_statement(statement: str, language_code: str) -> str:
    """
    Translate impact statement, preserving numbers and metrics.
    
    For MVP: Backend generates in requested language via CHESEAL.
    This function provides a safety fallback but primarily relies on backend translation.
    """
    lang = language_code.lower() if language_code else "en"
    
    # For English, return as-is
    if lang == "en":
        return statement
    
    # For MVP: Return original statement
    # Backend/CHESEAL handles primary translation
    # This ensures stability
    return statement


def translate_infrastructure_status(status: str, language_code: str) -> str:
    """Translate infrastructure status, preserving status semantics."""
    if not status:
        return status
    
    lang = language_code.lower() if language_code else "en"
    translations = INFRASTRUCTURE_STATUS_TRANSLATIONS.get(lang, INFRASTRUCTURE_STATUS_TRANSLATIONS["en"])
    return translations.get(status, status)  # Fallback to original if not found
