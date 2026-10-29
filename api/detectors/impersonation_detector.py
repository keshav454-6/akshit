import re
try:
    from detectors.scoring_engine import evaluate_signal_scoring
except ImportError:
    from scoring_engine import evaluate_signal_scoring

def analyze_impersonation(text: str) -> dict:
    """
    Detects targeted impersonation of financial institutions, law enforcement,
    delivery companies, tech platforms, and close personal contacts.
    Provides explainable rule-based scoring and verifiable official counter-measures.
    """
    if not text or not text.strip():
        return {"error": "Message text is required for impersonation analysis."}

    cleaned = text.strip()

    signals_definition = [
        {
            "id": "digital_arrest_law",
            "name": "Law Enforcement / Digital Arrest Coercion",
            "category": "State Authority Impersonation",
            "weight": 45,
            "severity": "Critical",
            "regex": re.compile(r'\b(cbi|police|cyber cell|enforcement directorate|ed|customs|narcotics control bureau|ncb|court order|arrest warrant|supreme court|digital arrest|inspector|sub-inspector)\b', re.IGNORECASE),
            "reason": "The 'Digital Arrest' scam poses as police/CBI on Skype/WhatsApp falsely claiming illegal parcels or money laundering.",
            "recommendation": "Indian law enforcement NEVER conducts arrests over video calls or demands money deposits. Call Cyber Crime Helpline: 1930."
        },
        {
            "id": "bank_authority",
            "name": "Central Bank / Bank Official Impersonation",
            "category": "Financial Authority Impersonation",
            "weight": 35,
            "severity": "High",
            "regex": re.compile(r'\b(rbi|reserve bank|sbi|state bank|hdfc|icici|axis bank|punjab national bank|pnb|bank manager|kyc officer|compliance department)\b', re.IGNORECASE),
            "reason": "Banks will never contact customers via unverified mobile numbers or messaging apps to update credentials.",
            "recommendation": "Call the customer care number printed on the back of your physical ATM/Debit card, or visit your branch."
        },
        {
            "id": "courier_narcotics",
            "name": "Contraband Courier & Customs Pretext",
            "category": "Logistics & Customs Impersonation",
            "weight": 30,
            "severity": "High",
            "regex": re.compile(r'\b(fedex|dhl|india post|bluedart|delhivery|parcel|courier|consignment|customs|contraband|narcotics|passports?|package)\b', re.IGNORECASE),
            "reason": "Tricks victims into believing a package with contraband was booked in their name, escalating to a fake police transfer.",
            "recommendation": "Track tracking numbers solely on official courier portals (e.g. fedex.com). Never call numbers in unsolicited SMS."
        },
        {
            "id": "family_emergency",
            "name": "Friend / Family Distress (Mom/Grandparent Scam)",
            "category": "Relationship Impersonation",
            "weight": 40,
            "severity": "Critical",
            "regex": re.compile(r'\b(hi mom|hi dad|hello mom|hello dad|lost my phone|new number|friend\'s phone|in hospital|met with an accident|emergency cash|send money urgently)\b', re.IGNORECASE),
            "reason": "Emotional manipulation where scammers pretend to be a son, daughter, or grandchild who lost their phone and urgently needs money.",
            "recommendation": "Directly call the family member's known existing phone number or mutual relatives before sending funds."
        },
        {
            "id": "tech_support",
            "name": "Tech Platform / Corporate Support Impersonation",
            "category": "Enterprise / Tech Impersonation",
            "weight": 30,
            "severity": "High",
            "regex": re.compile(r'\b(microsoft support|windows security|apple support|google accounts team|it administrator|helpdesk department|hr payroll|payroll update)\b', re.IGNORECASE),
            "reason": "Claims computer has a virus or corporate credentials need updating to obtain remote desktop access.",
            "recommendation": "Contact your corporate IT team directly or visit official platform account portals directly."
        },
        {
            "id": "extreme_coercion",
            "name": "Digital Arrest Summons / Extreme Secrecy Coercion",
            "category": "Coercion & Isolation",
            "weight": 20,
            "severity": "High",
            "regex": re.compile(r'\b(warrant|lawsuit|legal penalty|jail|confidential|do not tell anyone|keep secret|skype|digital arrest|bail|summons)\b', re.IGNORECASE),
            "reason": "Aggressive intimidation insisting on secrecy to prevent victims from consulting trusted advisors or authorities.",
            "recommendation": "Do not remain isolated. Seek immediate counsel from family, legal advisors, or call 1930."
        }
    ]

    detected_signals = []
    analyzed_signals = []
    impersonated_entities = []
    indicators = []
    explanations = []
    verification_guide = []

    for sig in signals_definition:
        match = sig["regex"].findall(cleaned)
        if match:
            unique_matches = list(set([str(m).upper() for m in match]))
            snippet = ", ".join(unique_matches[:2])
            entry = {
                "id": sig["id"],
                "name": sig["name"],
                "category": sig["category"],
                "weight": sig["weight"],
                "severity": sig["severity"],
                "status": "detected",
                "matched_snippet": snippet,
                "reason": sig["reason"],
                "recommendation": sig["recommendation"]
            }
            detected_signals.append(entry)
            analyzed_signals.append(entry)

            impersonated_entities.append(f"{sig['name']} ({snippet})")
            indicators.append(f"{sig['name']}: {snippet}")
            explanations.append(sig["reason"])
            verification_guide.append(sig["recommendation"])
        else:
            analyzed_signals.append({
                "id": sig["id"],
                "name": sig["name"],
                "category": sig["category"],
                "weight": sig["weight"],
                "severity": sig["severity"],
                "status": "clean",
                "matched_snippet": None,
                "reason": sig["reason"],
                "recommendation": sig["recommendation"]
            })

    eval_res = evaluate_signal_scoring("impersonation_detector", cleaned, detected_signals)

    if not indicators and not eval_res["is_ambiguous"]:
        indicators.append("No typical brand, government, or high-coercion impersonation cues found.")
        verification_guide.append("Verify the identity of anyone demanding sensitive data through an independent channel.")

    return {
        "text_preview": cleaned[:120] + ("..." if len(cleaned) > 120 else ""),
        "risk_score": eval_res["risk_score"],
        "risk_level": eval_res["risk_level"],
        "badge_color": eval_res["badge_color"],
        "is_ambiguous": eval_res["is_ambiguous"],
        "ambiguity_reason": eval_res["ambiguity_reason"],
        "confidence": eval_res["confidence"],
        "score_calculation": eval_res["score_calculation"],
        "analyzed_signals": analyzed_signals,
        "impersonated_entities": impersonated_entities,
        "warning_indicators": indicators,
        "explanations": explanations,
        "verification_guide": verification_guide,
        "official_verification_steps": verification_guide,
        "advisory_disclaimer": eval_res["advisory_disclaimer"],
        "privacy_notice": eval_res["privacy_notice"]
    }
