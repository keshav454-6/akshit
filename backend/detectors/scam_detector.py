import re
try:
    from detectors.scoring_engine import evaluate_signal_scoring
except ImportError:
    from scoring_engine import evaluate_signal_scoring

def analyze_scam_message(text: str) -> dict:
    """
    Analyzes SMS, WhatsApp, emails, or customer-care text for phishing, fraud,
    urgency pressure, and credential harvesting indicators using a transparent,
    explainable rule-based scoring architecture.
    """
    if not text or not text.strip():
        return {
            "error": "Empty message provided. Please paste the message content."
        }

    cleaned = text.strip()

    # Define the evaluated signals
    signals_definition = [
        {
            "id": "credential_phishing",
            "name": "Credential & Auth Secret Harvesting",
            "category": "Authentication Secret",
            "weight": 35,
            "severity": "Critical",
            "regex": re.compile(r'\b(otp|one time password|pin|mpin|cvv|expiry date|netbanking password|passcode|card number)\b', re.IGNORECASE),
            "reason": "Legitimate institutions, banks, and customer care executives NEVER ask for OTPs, PINs, or passwords.",
            "recommendation": "Never disclose OTP, PIN, or CVV. End the conversation immediately."
        },
        {
            "id": "blocking_threat",
            "name": "Account Blocking & Panicking Threat",
            "category": "Coercion & Intimidation",
            "weight": 25,
            "severity": "High",
            "regex": re.compile(r'\b(block|blocked|suspend|suspended|deactivate|freeze|frozen|terminated|hold|legal action|police complaint|arrest)\b', re.IGNORECASE),
            "reason": "Scammers manufacture artificial fear to prevent critical verification or consultation.",
            "recommendation": "Do not panic. Formal bank notices are served via written communications, not urgent chat/SMS."
        },
        {
          "id": "urgency_pressure",
          "name": "Manufactured Time-Pressure Deadline",
          "category": "Psychological Manipulation",
          "weight": 20,
          "severity": "Medium",
          "regex": re.compile(r'\b(immediate|immediately|urgent|urgently|within \d+ hours?|within 24 hours?|within 10 minutes?|today only|last chance|action required)\b', re.IGNORECASE),
          "reason": "Urgency is a primary psychological trigger used to rush victims into unverified actions.",
          "recommendation": "Step back and take time. Genuine customer service issues never require instant transfer."
        },
        {
          "id": "authority_impersonation",
          "name": "Customer Care & Service Authority Pretext",
          "category": "Pretexting",
          "weight": 15,
          "severity": "Medium",
          "regex": re.compile(r'\b(customer care|support desk|helpdesk|service executive|officer|sbi support|hdfc care|airtel kyc|jio 5g|electricity board|customs officer|courier officer)\b', re.IGNORECASE),
          "reason": "Impersonation of trusted utility or telecom brands lends false credibility to the communication.",
          "recommendation": "Look up the verified contact number from the official website or physical documents."
        },
        {
          "id": "suspicious_links_remote",
          "name": "Unverified URLs & Screen-Sharing Tools",
          "category": "Technical Vector",
          "weight": 30,
          "severity": "Critical",
          "regex": re.compile(r'(https?://[^\s]+|bit\.ly/[^\s]+|tinyurl\.com/[^\s]+|t\.me/[^\s]+|\.apk|\banydesk\b|\brustdesk\b|\bteamviewer\b|\bquicksupport\b)', re.IGNORECASE),
          "reason": "Fraudsters use shortened links or remote screen-sharing tools to siphon OTPs or control devices.",
          "recommendation": "Never download APK files or install screen-sharing software at the request of an unknown contact."
        },
        {
          "id": "bait_pretext",
          "name": "Routine Task / KYC / Reward Baits",
          "category": "Social Engineering Baits",
          "weight": 20,
          "severity": "Medium",
          "regex": re.compile(r'\b(kyc update|kyc pending|pan card update|electricity bill update|lottery winner|lucky draw|cash prize|won \d+|reward points?)\b', re.IGNORECASE),
          "reason": "Pretexting with administrative obligations (KYC, electricity bill) is a top fraud vector.",
          "recommendation": "Visit the official branch or authorized vendor portal directly to verify real status."
        }
    ]

    detected_signals = []
    analyzed_signals = []
    warning_signs = []
    explanations = []
    actions = []

    for sig in signals_definition:
        matches = sig["regex"].findall(cleaned)
        if matches:
            # Mask or sanitize matched strings
            unique_matches = list(set([str(m)[:30] for m in matches]))
            snippet = ", ".join(unique_matches[:2])
            signal_entry = {
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
            detected_signals.append(signal_entry)
            analyzed_signals.append(signal_entry)

            warning_signs.append(f"{sig['name']}: {snippet}")
            explanations.append(sig["reason"])
            actions.append(sig["recommendation"])
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

    # Evaluate scoring, ambiguity, and confidence
    eval_res = evaluate_signal_scoring("scam_detector", cleaned, detected_signals)

    if not warning_signs and not eval_res["is_ambiguous"]:
        warning_signs.append("No obvious automated phishing or high-urgency keywords detected.")
        explanations.append("The message does not display standard linguistic red flags. Maintain standard vigilance.")
        actions.append("Verify the sender address or phone number through standard channels.")

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
        "warning_signs": warning_signs,
        "explanations": explanations,
        "actions": actions,
        "advisory_disclaimer": eval_res["advisory_disclaimer"],
        "privacy_notice": eval_res["privacy_notice"]
    }
