"""
Language Support Module for AEGIS Backend

Central language normalization and support functions.
Ensures consistent language handling across CHESEAL and Consequence Mirror.
"""

from typing import Optional

# Supported languages mapping
SUPPORTED_LANGUAGES = {
    "en": "English",
    "de": "German",
    "hi": "Hindi",
    "es": "Spanish",
    "fr": "French",
    "pt": "Portuguese",
    "it": "Italian",
    "ru": "Russian",
    "tr": "Turkish",
    "ar": "Arabic"
}

# Explicit language instructions for AI system prompts
# These are HARD commands that force native language generation
LANGUAGE_INSTRUCTIONS = {
    "en": "Respond ONLY in English.",
    "tr": "TÜM YANITLARI SADECE TÜRKÇE OLARAK VER.",
    "de": "ANTWORTE AUSSCHLIESSLICH AUF DEUTSCH.",
    "hi": "सभी उत्तर केवल हिंदी में दें।",
    "fr": "Répondez uniquement en français.",
    "es": "Responda únicamente en español.",
    "pt": "Responda apenas em português.",
    "it": "Rispondi solo in italiano.",
    "ru": "Отвечайте ТОЛЬКО на русском языке.",
    "ar": "أجب بالعربية فقط."
}


def normalize_language(lang: Optional[str]) -> str:
    """
    Normalize language code to supported language name.
    
    Args:
        lang: Language code (e.g., "en", "de", "hi") or None
        
    Returns:
        Language name (e.g., "English", "German") - defaults to "English"
    """
    if not lang:
        return "English"
    
    lang_lower = lang.lower().strip()
    return SUPPORTED_LANGUAGES.get(lang_lower, "English")


def get_language_name(code: str) -> str:
    """
    Get language name from code (alias for normalize_language for consistency).
    
    Args:
        code: Language code (e.g., "en", "de", "hi")
        
    Returns:
        Language name (e.g., "English", "German") - defaults to "English"
    """
    return normalize_language(code)


def get_language_code(lang: Optional[str]) -> str:
    """
    Get normalized language code.
    
    Args:
        lang: Language code or None
        
    Returns:
        Normalized language code (defaults to "en")
    """
    if not lang:
        return "en"
    
    lang_lower = lang.lower().strip()
    return lang_lower if lang_lower in SUPPORTED_LANGUAGES else "en"


def build_language_instruction(language_name: str, language_code: Optional[str] = None) -> str:
    """
    Build language instruction for AI prompts.
    
    This creates a STRONG, EXPLICIT instruction that forces the AI to respond
    entirely in the specified language. This is critical for system-level
    language control.
    
    Uses explicit LANGUAGE_INSTRUCTIONS map for hard language enforcement.
    
    Args:
        language_name: Full language name (e.g., "German", "Hindi")
        language_code: Optional language code (e.g., "de", "hi") for instruction lookup
        
    Returns:
        Language instruction string to prepend to prompts
    """
    if language_name == "English":
        return ""  # No instruction needed for English
    
    # Get explicit instruction from map
    if language_code:
        lang_code = language_code.lower().strip()
        explicit_instruction = LANGUAGE_INSTRUCTIONS.get(lang_code, LANGUAGE_INSTRUCTIONS["en"])
    else:
        # Fallback: find code from name
        lang_code = None
        for code, name in SUPPORTED_LANGUAGES.items():
            if name == language_name:
                lang_code = code
                break
        explicit_instruction = LANGUAGE_INSTRUCTIONS.get(lang_code or "en", LANGUAGE_INSTRUCTIONS["en"])
    
    return (
        f"You are AEGIS, an AI public risk decision system.\n"
        f"{explicit_instruction}\n\n"
        f"Rules:\n"
        f"- Generate natively in the target language\n"
        f"- Do not translate from English\n"
        f"- Do not mix languages\n"
        f"- Use professional, public-sector tone\n"
        f"- All reasoning, explanations, recommendations, and analysis MUST be in {language_name}.\n\n"
    )

