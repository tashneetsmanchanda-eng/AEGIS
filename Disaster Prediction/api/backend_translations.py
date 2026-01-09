"""
Backend Translation Templates for Phase-2

Controlled translation map for structured backend output text.
Only translates deterministic, structured strings - NOT free-form content.

SAFE ACCESS RULE:
    lang = request.language or "en"
    t = BACKEND_TRANSLATIONS.get(lang, BACKEND_TRANSLATIONS["en"])
    translated = t.get(key, BACKEND_TRANSLATIONS["en"].get(key, key))
"""

BACKEND_TRANSLATIONS = {
    "en": {
        # Demo scenario recommendations
        "MONITOR_CONDITIONS": "Monitor conditions",
        "MAINTAIN_PREPAREDNESS": "Maintain preparedness",
        
        # Model-generated recommendation templates (from CombinedPredictor)
        # These are structured patterns that may appear in recommendations
        "HIGH_FLOOD_RISK": "High flood risk - activate emergency protocols",
        "PREPARE_EVACUATION": "Prepare evacuation routes and shelters",
        "MONITOR_WATER_LEVELS": "Monitor water levels closely",
        "CHECK_DRAINAGE": "Check drainage infrastructure",
        "MOSQUITO_CONTROL": "Deploy mosquito control measures (larva control, nets)",
        "STOCK_ANTIMALARIAL": "Stock antimalarial medications",
        "WATER_CHLORINATION": "Ensure water chlorination and purification",
        "PREPARE_REHYDRATION": "Prepare oral rehydration supplies",
        "DISTRIBUTE_PROTECTIVE_GEAR": "Distribute protective gear for flood cleanup",
        "RODENT_CONTROL": "Implement rodent control measures",
        "ENHANCE_SANITATION": "Enhance sanitation and hygiene facilities",
        "HEPATITIS_VACCINATION": "Consider hepatitis vaccination campaigns",
        "LOW_RISK_MONITORING": "Risk levels are low - maintain standard monitoring",
    },
    "de": {
        "MONITOR_CONDITIONS": "Bedingungen überwachen",
        "MAINTAIN_PREPAREDNESS": "Bereitschaft aufrechterhalten",
        "HIGH_FLOOD_RISK": "Hohes Hochwasserrisiko - Notfallprotokolle aktivieren",
        "PREPARE_EVACUATION": "Evakuierungsrouten und Unterkünfte vorbereiten",
        "MONITOR_WATER_LEVELS": "Wasserstände genau überwachen",
        "CHECK_DRAINAGE": "Entwässerungsinfrastruktur überprüfen",
        "MOSQUITO_CONTROL": "Mückenbekämpfungsmaßnahmen einsetzen (Larvenbekämpfung, Netze)",
        "STOCK_ANTIMALARIAL": "Antimalariamedikamente vorrätig halten",
        "WATER_CHLORINATION": "Wasserchlorierung und -aufbereitung sicherstellen",
        "PREPARE_REHYDRATION": "Orales Rehydratationsmaterial vorbereiten",
        "DISTRIBUTE_PROTECTIVE_GEAR": "Schutzausrüstung für Hochwasserbereinigung verteilen",
        "RODENT_CONTROL": "Nagerbekämpfungsmaßnahmen durchführen",
        "ENHANCE_SANITATION": "Sanitär- und Hygieneeinrichtungen verbessern",
        "HEPATITIS_VACCINATION": "Hepatitis-Impfkampagnen in Betracht ziehen",
        "LOW_RISK_MONITORING": "Risikoniveaus sind niedrig - Standardüberwachung beibehalten",
    },
    "hi": {
        "MONITOR_CONDITIONS": "स्थितियों की निगरानी करें",
        "MAINTAIN_PREPAREDNESS": "तत्परता बनाए रखें",
        "HIGH_FLOOD_RISK": "उच्च बाढ़ जोखिम - आपातकालीन प्रोटोकॉल सक्रिय करें",
        "PREPARE_EVACUATION": "निकासी मार्ग और आश्रय स्थान तैयार करें",
        "MONITOR_WATER_LEVELS": "जल स्तर की बारीकी से निगरानी करें",
        "CHECK_DRAINAGE": "जल निकासी अवसंरचना की जांच करें",
        "MOSQUITO_CONTROL": "मच्छर नियंत्रण उपाय तैनात करें (लार्वा नियंत्रण, जाल)",
        "STOCK_ANTIMALARIAL": "एंटीमलेरिया दवाएं स्टॉक करें",
        "WATER_CHLORINATION": "जल क्लोरीनीकरण और शुद्धिकरण सुनिश्चित करें",
        "PREPARE_REHYDRATION": "मौखिक पुनर्जलीकरण आपूर्ति तैयार करें",
        "DISTRIBUTE_PROTECTIVE_GEAR": "बाढ़ सफाई के लिए सुरक्षात्मक उपकरण वितरित करें",
        "RODENT_CONTROL": "कृंतक नियंत्रण उपाय लागू करें",
        "ENHANCE_SANITATION": "सफाई और स्वच्छता सुविधाएं बढ़ाएं",
        "HEPATITIS_VACCINATION": "हेपेटाइटिस टीकाकरण अभियान पर विचार करें",
        "LOW_RISK_MONITORING": "जोखिम स्तर कम हैं - मानक निगरानी बनाए रखें",
    },
    "es": {
        "MONITOR_CONDITIONS": "Monitorear condiciones",
        "MAINTAIN_PREPAREDNESS": "Mantener preparación",
        "HIGH_FLOOD_RISK": "Alto riesgo de inundación - activar protocolos de emergencia",
        "PREPARE_EVACUATION": "Preparar rutas de evacuación y refugios",
        "MONITOR_WATER_LEVELS": "Monitorear niveles de agua de cerca",
        "CHECK_DRAINAGE": "Verificar infraestructura de drenaje",
        "MOSQUITO_CONTROL": "Desplegar medidas de control de mosquitos (control de larvas, redes)",
        "STOCK_ANTIMALARIAL": "Abastecer medicamentos antipalúdicos",
        "WATER_CHLORINATION": "Asegurar cloración y purificación del agua",
        "PREPARE_REHYDRATION": "Preparar suministros de rehidratación oral",
        "DISTRIBUTE_PROTECTIVE_GEAR": "Distribuir equipo de protección para limpieza de inundaciones",
        "RODENT_CONTROL": "Implementar medidas de control de roedores",
        "ENHANCE_SANITATION": "Mejorar instalaciones de saneamiento e higiene",
        "HEPATITIS_VACCINATION": "Considerar campañas de vacunación contra hepatitis",
        "LOW_RISK_MONITORING": "Los niveles de riesgo son bajos - mantener monitoreo estándar",
    },
    "fr": {
        "MONITOR_CONDITIONS": "Surveiller les conditions",
        "MAINTAIN_PREPAREDNESS": "Maintenir la préparation",
        "HIGH_FLOOD_RISK": "Risque élevé d'inondation - activer les protocoles d'urgence",
        "PREPARE_EVACUATION": "Préparer les routes d'évacuation et les abris",
        "MONITOR_WATER_LEVELS": "Surveiller de près les niveaux d'eau",
        "CHECK_DRAINAGE": "Vérifier l'infrastructure de drainage",
        "MOSQUITO_CONTROL": "Déployer des mesures de contrôle des moustiques (contrôle des larves, moustiquaires)",
        "STOCK_ANTIMALARIAL": "Stocker des médicaments antipaludiques",
        "WATER_CHLORINATION": "Assurer la chloration et la purification de l'eau",
        "PREPARE_REHYDRATION": "Préparer les fournitures de réhydratation orale",
        "DISTRIBUTE_PROTECTIVE_GEAR": "Distribuer des équipements de protection pour le nettoyage des inondations",
        "RODENT_CONTROL": "Mettre en œuvre des mesures de contrôle des rongeurs",
        "ENHANCE_SANITATION": "Améliorer les installations sanitaires et d'hygiène",
        "HEPATITIS_VACCINATION": "Envisager des campagnes de vaccination contre l'hépatite",
        "LOW_RISK_MONITORING": "Les niveaux de risque sont faibles - maintenir une surveillance standard",
    },
    "pt": {
        "MONITOR_CONDITIONS": "Monitorar condições",
        "MAINTAIN_PREPAREDNESS": "Manter preparação",
        "HIGH_FLOOD_RISK": "Alto risco de inundação - ativar protocolos de emergência",
        "PREPARE_EVACUATION": "Preparar rotas de evacuação e abrigos",
        "MONITOR_WATER_LEVELS": "Monitorar níveis de água de perto",
        "CHECK_DRAINAGE": "Verificar infraestrutura de drenagem",
        "MOSQUITO_CONTROL": "Implantar medidas de controle de mosquitos (controle de larvas, redes)",
        "STOCK_ANTIMALARIAL": "Estocar medicamentos antimaláricos",
        "WATER_CHLORINATION": "Garantir cloração e purificação da água",
        "PREPARE_REHYDRATION": "Preparar suprimentos de reidratação oral",
        "DISTRIBUTE_PROTECTIVE_GEAR": "Distribuir equipamentos de proteção para limpeza de inundações",
        "RODENT_CONTROL": "Implementar medidas de controle de roedores",
        "ENHANCE_SANITATION": "Melhorar instalações de saneamento e higiene",
        "HEPATITIS_VACCINATION": "Considerar campanhas de vacinação contra hepatite",
        "LOW_RISK_MONITORING": "Os níveis de risco estão baixos - manter monitoramento padrão",
    },
    "it": {
        "MONITOR_CONDITIONS": "Monitorare le condizioni",
        "MAINTAIN_PREPAREDNESS": "Mantenere la preparazione",
        "HIGH_FLOOD_RISK": "Alto rischio di alluvione - attivare protocolli di emergenza",
        "PREPARE_EVACUATION": "Preparare rotte di evacuazione e rifugi",
        "MONITOR_WATER_LEVELS": "Monitorare da vicino i livelli dell'acqua",
        "CHECK_DRAINAGE": "Verificare l'infrastruttura di drenaggio",
        "MOSQUITO_CONTROL": "Implementare misure di controllo delle zanzare (controllo delle larve, zanzariere)",
        "STOCK_ANTIMALARIAL": "Fornire farmaci antimalarici",
        "WATER_CHLORINATION": "Garantire clorazione e purificazione dell'acqua",
        "PREPARE_REHYDRATION": "Preparare forniture per reidratazione orale",
        "DISTRIBUTE_PROTECTIVE_GEAR": "Distribuire attrezzature protettive per la pulizia delle alluvioni",
        "RODENT_CONTROL": "Implementare misure di controllo dei roditori",
        "ENHANCE_SANITATION": "Migliorare le strutture igienico-sanitarie",
        "HEPATITIS_VACCINATION": "Considerare campagne di vaccinazione contro l'epatite",
        "LOW_RISK_MONITORING": "I livelli di rischio sono bassi - mantenere il monitoraggio standard",
    },
    "tr": {
        "MONITOR_CONDITIONS": "Koşulları izleyin",
        "MAINTAIN_PREPAREDNESS": "Hazırlığı sürdürün",
        "HIGH_FLOOD_RISK": "Yüksek sel riski - acil durum protokollerini etkinleştirin",
        "PREPARE_EVACUATION": "Tahliye rotaları ve barınakları hazırlayın",
        "MONITOR_WATER_LEVELS": "Su seviyelerini yakından izleyin",
        "CHECK_DRAINAGE": "Drenaj altyapısını kontrol edin",
        "MOSQUITO_CONTROL": "Sivrisinek kontrol önlemleri uygulayın (larva kontrolü, ağlar)",
        "STOCK_ANTIMALARIAL": "Sıtma ilaçları stoklayın",
        "WATER_CHLORINATION": "Su klorlama ve arıtma sağlayın",
        "PREPARE_REHYDRATION": "Oral rehidratasyon malzemeleri hazırlayın",
        "DISTRIBUTE_PROTECTIVE_GEAR": "Sel temizliği için koruyucu ekipman dağıtın",
        "RODENT_CONTROL": "Kemirgen kontrol önlemleri uygulayın",
        "ENHANCE_SANITATION": "Sanitasyon ve hijyen tesislerini iyileştirin",
        "HEPATITIS_VACCINATION": "Hepatit aşılama kampanyalarını düşünün",
        "LOW_RISK_MONITORING": "Risk seviyeleri düşük - standart izlemeyi sürdürün",
    },
    "ru": {
        "MONITOR_CONDITIONS": "Мониторинг условий",
        "MAINTAIN_PREPAREDNESS": "Поддерживать готовность",
        "HIGH_FLOOD_RISK": "Высокий риск наводнения - активировать протоколы чрезвычайных ситуаций",
        "PREPARE_EVACUATION": "Подготовить маршруты эвакуации и убежища",
        "MONITOR_WATER_LEVELS": "Внимательно следить за уровнями воды",
        "CHECK_DRAINAGE": "Проверить инфраструктуру дренажа",
        "MOSQUITO_CONTROL": "Развернуть меры по борьбе с комарами (контроль личинок, сетки)",
        "STOCK_ANTIMALARIAL": "Запасти противомалярийные препараты",
        "WATER_CHLORINATION": "Обеспечить хлорирование и очистку воды",
        "PREPARE_REHYDRATION": "Подготовить средства для пероральной регидратации",
        "DISTRIBUTE_PROTECTIVE_GEAR": "Распределить защитное оборудование для очистки от наводнений",
        "RODENT_CONTROL": "Внедрить меры по борьбе с грызунами",
        "ENHANCE_SANITATION": "Улучшить санитарные и гигиенические объекты",
        "HEPATITIS_VACCINATION": "Рассмотреть кампании по вакцинации против гепатита",
        "LOW_RISK_MONITORING": "Уровни риска низкие - поддерживать стандартный мониторинг",
    },
    "ar": {
        "MONITOR_CONDITIONS": "مراقبة الظروف",
        "MAINTAIN_PREPAREDNESS": "الحفاظ على الاستعداد",
        "HIGH_FLOOD_RISK": "خطر فيضان عالي - تفعيل بروتوكولات الطوارئ",
        "PREPARE_EVACUATION": "تحضير طرق الإخلاء والملاجئ",
        "MONITOR_WATER_LEVELS": "مراقبة مستويات المياه عن كثب",
        "CHECK_DRAINAGE": "فحص البنية التحتية للصرف",
        "MOSQUITO_CONTROL": "نشر تدابير مكافحة البعوض (مكافحة اليرقات، الشباك)",
        "STOCK_ANTIMALARIAL": "تخزين الأدوية المضادة للملاريا",
        "WATER_CHLORINATION": "ضمان الكلورة وتنقية المياه",
        "PREPARE_REHYDRATION": "تحضير إمدادات الإماهة الفموية",
        "DISTRIBUTE_PROTECTIVE_GEAR": "توزيع معدات الحماية لتنظيف الفيضانات",
        "RODENT_CONTROL": "تنفيذ تدابير مكافحة القوارض",
        "ENHANCE_SANITATION": "تحسين مرافق الصرف الصحي والنظافة",
        "HEPATITIS_VACCINATION": "النظر في حملات التطعيم ضد التهاب الكبد",
        "LOW_RISK_MONITORING": "مستويات المخاطر منخفضة - الحفاظ على المراقبة القياسية",
    },
}


def translate_recommendation(recommendation: str, language_code: str) -> str:
    """
    Translate a backend-generated recommendation string.
    
    Uses pattern matching to identify known recommendation templates and translate them.
    Falls back to original string if no match found (safe fallback).
    
    Args:
        recommendation: The recommendation string to translate
        language_code: Language code (e.g., "en", "de", "hi")
        
    Returns:
        Translated string, or original if translation not found
    """
    lang = language_code.lower() if language_code else "en"
    translations = BACKEND_TRANSLATIONS.get(lang, BACKEND_TRANSLATIONS["en"])
    
    # For English, return as-is
    if lang == "en":
        return recommendation
    
    # Pattern matching for known recommendation strings
    # Match by key phrases (case-insensitive)
    rec_lower = recommendation.lower()
    
    # Demo scenario recommendations
    if "monitor conditions" in rec_lower or rec_lower == "monitor conditions":
        return translations.get("MONITOR_CONDITIONS", recommendation)
    if "maintain preparedness" in rec_lower or rec_lower == "maintain preparedness":
        return translations.get("MAINTAIN_PREPAREDNESS", recommendation)
    
    # Model-generated recommendations (with emojis and structured patterns)
    if "high flood risk" in rec_lower and "emergency protocols" in rec_lower:
        return translations.get("HIGH_FLOOD_RISK", recommendation)
    if "evacuation routes" in rec_lower and "shelters" in rec_lower:
        return translations.get("PREPARE_EVACUATION", recommendation)
    if "monitor water levels" in rec_lower and "closely" in rec_lower:
        return translations.get("MONITOR_WATER_LEVELS", recommendation)
    if "drainage infrastructure" in rec_lower:
        return translations.get("CHECK_DRAINAGE", recommendation)
    if "mosquito control" in rec_lower and "larva" in rec_lower:
        return translations.get("MOSQUITO_CONTROL", recommendation)
    if "antimalarial" in rec_lower:
        return translations.get("STOCK_ANTIMALARIAL", recommendation)
    if "water chlorination" in rec_lower or "water purification" in rec_lower:
        return translations.get("WATER_CHLORINATION", recommendation)
    if "oral rehydration" in rec_lower:
        return translations.get("PREPARE_REHYDRATION", recommendation)
    if "protective gear" in rec_lower and "flood cleanup" in rec_lower:
        return translations.get("DISTRIBUTE_PROTECTIVE_GEAR", recommendation)
    if "rodent control" in rec_lower:
        return translations.get("RODENT_CONTROL", recommendation)
    if "sanitation" in rec_lower and "hygiene" in rec_lower:
        return translations.get("ENHANCE_SANITATION", recommendation)
    if "hepatitis vaccination" in rec_lower:
        return translations.get("HEPATITIS_VACCINATION", recommendation)
    if "risk levels are low" in rec_lower and "standard monitoring" in rec_lower:
        return translations.get("LOW_RISK_MONITORING", recommendation)
    
    # Fallback: return original (safe - preserves functionality)
    return recommendation


def translate_recommendations_list(recommendations: list, language_code: str) -> list:
    """
    Translate a list of recommendation strings.
    
    Args:
        recommendations: List of recommendation strings
        language_code: Language code
        
    Returns:
        List of translated recommendations
    """
    return [translate_recommendation(rec, language_code) for rec in recommendations]

