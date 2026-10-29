import re
try:
    from detectors.scoring_engine import evaluate_signal_scoring
except ImportError:
    from scoring_engine import evaluate_signal_scoring

def analyze_payment_request(text: str) -> dict:
    """
    Evaluates payment claims, UPI messages, QR codes, refund pretexts,
    and requests to approve collect requests or enter authentication PINs.
    Follows a transparent rule-based scoring architecture with confidence metrics.
    """
    if not text or not text.strip():
        return {"error": "Payment message text is required."}

    cleaned = text.strip()

    signals_definition = [
        {
            "id": "reverse_upi_pin",
            "name": "Reverse UPI PIN Entry Request",
            "category": "Financial Authorization Trap",
            "weight": 45,
            "severity": "Critical",
            "regex": re.compile(r'\b(enter\s+(?:upi\s+)?pin\s+(?:to|for)\s+(?:receive|claim|credit|accept|get))\b', re.IGNORECASE),
            "reason": "Fundamental UPI Rule: Entering your UPI PIN strictly DEBITS funds from your account, never credits it.",
            "recommendation": "DO NOT enter your PIN. Receiving funds via UPI requires ZERO authorization or PIN entry."
        },
        {
            "id": "qr_receive_trap",
            "name": "QR Code Scanning to Receive Money Claim",
            "category": "Financial Authorization Trap",
            "weight": 35,
            "severity": "Critical",
            "regex": re.compile(r'\b(scan\s+(?:this\s+)?qr\s+(?:code\s+)?(?:to|and)\s+(?:receive|get|claim|credit|refund))\b', re.IGNORECASE),
            "reason": "Scanning a QR code in any UPI application initiates a PAY/TRANSFER operation OUT of your account.",
            "recommendation": "Never scan a QR code sent by a buyer or unknown contact claiming advance payment."
        },
        {
            "id": "collect_request_trap",
            "name": "UPI Collect Request Approval Trap",
            "category": "Payment Approval Deception",
            "weight": 30,
            "severity": "High",
            "regex": re.compile(r'\b(approve\s+(?:the\s+)?(?:request|payment|debit)|accept\s+request|click\s+pay\s+to\s+receive)\b', re.IGNORECASE),
            "reason": "Scammers send UPI Collect Requests instructing victims to press 'Approve' to receive cashback or lottery funds.",
            "recommendation": "Decline unexpected UPI Collect Requests immediately. Verify sender VPA."
        },
        {
            "id": "mistaken_refund_pressure",
            "name": "Accidental Transfer & Fake Refund Pretext",
            "category": "Psychological Manipulation",
            "weight": 25,
            "severity": "High",
            "regex": re.compile(r'\b(refund|transferred by mistake|sent money by mistake|return excess|overpaid|cashback reward|claim reward)\b', re.IGNORECASE),
            "reason": "A prevalent scam involves fake credit SMS followed by frantic calls claiming 'I sent you money by mistake, please return it'.",
            "recommendation": "Open your official banking app and check your actual updated account ledger. Do not rely on SMS."
        },
        {
            "id": "pin_general",
            "name": "Confidential PIN / Credential Mention",
            "category": "Authentication Secret",
            "weight": 20,
            "severity": "High",
            "regex": re.compile(r'\b(upi pin|mpin|atm pin|enter 4 digit|enter 6 digit pin)\b', re.IGNORECASE),
            "reason": "Payment requests should never demand typing PINs outside of authentic mobile banking apps.",
            "recommendation": "Only enter your UPI PIN inside your bank's native mobile app keypad."
        },
        {
            "id": "financial_urgency",
            "name": "Payment Window Countdown Pressure",
            "category": "Time Pressure",
            "weight": 15,
            "severity": "Medium",
            "regex": re.compile(r'\b(expire\s+in|valid\s+for\s+\d+|within\s+\d+\s+min|immediate|urgent|right\s+now)\b', re.IGNORECASE),
            "reason": "Rushed payment deadlines prevent users from verifying details with family or banks.",
            "recommendation": "Legitimate transactions do not expire in 2-3 minutes under coercive threats."
        },
        {
            "id": "external_link",
            "name": "Unverified Payment / Phishing Link",
            "category": "Technical Vector",
            "weight": 20,
            "severity": "Medium",
            "regex": re.compile(r'(https?://[^\s]+|bit\.ly|[a-z0-9-]+\.(?:top|xyz|cc|tk|club))', re.IGNORECASE),
            "reason": "External links may lead to counterfeit payment gateways mimicking Google Pay, PhonePe, or Paytm.",
            "recommendation": "Always execute transactions inside authentic mobile banking apps, never via links."
        }
    ]

    detected_signals = []
    analyzed_signals = []
    flags = []
    explanations = []
    verification_steps = []

    for sig in signals_definition:
        match = sig["regex"].search(cleaned)
        if match:
            matched_snippet = match.group(0)[:40]
            # Avoid duplicate PIN scoring if reverse UPI PIN already fired
            if sig["id"] == "pin_general" and any(d["id"] == "reverse_upi_pin" for d in detected_signals):
                continue

            entry = {
                "id": sig["id"],
                "name": sig["name"],
                "category": sig["category"],
                "weight": sig["weight"],
                "severity": sig["severity"],
                "status": "detected",
                "matched_snippet": matched_snippet,
                "reason": sig["reason"],
                "recommendation": sig["recommendation"]
            }
            detected_signals.append(entry)
            analyzed_signals.append(entry)

            flags.append(f"{sig['name']}: {matched_snippet}")
            explanations.append(sig["reason"])
            verification_steps.append(sig["recommendation"])
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

    eval_res = evaluate_signal_scoring("payment_detector", cleaned, detected_signals)

    if not flags and not eval_res["is_ambiguous"]:
        flags.append("No typical UPI reverse debit or cashback trap patterns found.")
        verification_steps.append("Verify payment recipient VPA or bank details through your regular address book.")

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
        "detected_flags": flags,
        "risk_explanations": explanations,
        "independent_verification_steps": verification_steps,
        "advisory_disclaimer": eval_res["advisory_disclaimer"],
        "privacy_notice": eval_res["privacy_notice"]
    }
