try:
    from detectors.scoring_engine import evaluate_signal_scoring
except ImportError:
    from scoring_engine import evaluate_signal_scoring

def evaluate_voice_clone_scam(answers: dict) -> dict:
    """
    Evaluates potential AI voice-cloning scam indicators using a transparent,
    explainable behavioral and situational decision matrix.
    
    Expected keys in answers:
      - familiar_voice_money: bool (Did someone sounding like a loved one/friend urgently ask for funds?)
      - emotional_emergency: bool (Was an emergency cited like hospital, bail, arrest, accident?)
      - demand_secrecy: bool (Did they plead not to inform parents, spouse, or police?)
      - urgency_deadline: bool (Were you pressured to transfer money within minutes?)
      - refuses_video_verify: bool (Did they refuse a video call or hang up when questioned?)
      - unusual_channel_or_number: bool (Did the call arrive from an unfamiliar or hidden number?)
      - strange_speech_artifacts: bool (Did the voice have robotic pauses, repetitive cadence, or unusual audio background?)
    """
    signals_definition = [
        {
            "id": "familiar_voice_money",
            "name": "Urgent Financial Request from Purportedly Known Voice",
            "category": "Impersonated Voice Vector",
            "weight": 25,
            "severity": "Critical",
            "reason": "AI deepfake voice cloning is predominantly used to pose as children, grandchildren, or bosses demanding immediate cash.",
            "recommendation": "Never wire money or crypto based solely on a phone call. Require secondary verification."
        },
        {
            "id": "emotional_emergency",
            "name": "Extreme Emotional Crisis Pretext (Hospital/Arrest/Accident)",
            "category": "Psychological Manipulation",
            "weight": 20,
            "severity": "High",
            "reason": "Manufactures overwhelming emotional shock (e.g. 'I am in jail', 'severe car crash') to disable logical scrutiny.",
            "recommendation": "Take a deep breath. Cross-verify the claimed location or hospital directly before acting."
        },
        {
            "id": "demand_secrecy",
            "name": "Insistence on Strict Secrecy / Concealment from Others",
            "category": "Isolation Tactic",
            "weight": 20,
            "severity": "High",
            "reason": "Attackers demand 'don't tell mom/dad/police' to prevent the victim from cross-checking with anyone who could expose the deception.",
            "recommendation": "Disregard the demand for secrecy. Immediately contact mutual friends or family members."
        },
        {
            "id": "urgency_deadline",
            "name": "High-Pressure Clock Countdown Demanding Immediate Action",
            "category": "Time Pressure",
            "weight": 15,
            "severity": "Medium",
            "reason": "Artificial urgency forces victims to send funds before they have time to verify authentic whereabouts.",
            "recommendation": "Step back and slow down. Legitimate emergency services accept formal hospital/bail protocols."
        },
        {
            "id": "refuses_video_verify",
            "name": "Refusal / Evasion of Secondary Visual Verification",
            "category": "Verification Evasion",
            "weight": 20,
            "severity": "High",
            "reason": "Voice-clone attackers avoid live FaceTime/WhatsApp video calls because visual deepfakes are harder to pull off in real time.",
            "recommendation": "Insist on a clear live video call. If they refuse or hang up, treat as an active fraud attempt."
        },
        {
            "id": "unusual_channel_or_number",
            "name": "Incoming Call from Unknown Number Claiming to be Known Contact",
            "category": "Channel Anomaly",
            "weight": 15,
            "severity": "Medium",
            "reason": "Scammers claim 'my phone was lost/broken' to explain why the call originates from a disposable VoIP number.",
            "recommendation": "Hang up and call back on the authentic pre-saved contact number for that family member."
        },
        {
            "id": "strange_speech_artifacts",
            "name": "Synthetic Artifacts / Unnatural Cadence in Audio",
            "category": "Acoustic Cue",
            "weight": 15,
            "severity": "Medium",
            "reason": "Current consumer TTS/voice-cloners often leave unnatural micro-pauses, metallic timbre, or repetitive breathing artifacts.",
            "recommendation": "Ask a predetermined Family Code Word or an intimate question an AI scraper would not know."
        }
    ]

    detected_indicators = []
    detected_signals = []
    analyzed_signals = []
    total_score = 0

    for sig in signals_definition:
        key = sig["id"]
        is_active = bool(answers.get(key) is True)
        if is_active:
            total_score += sig["weight"]
            detected_indicators.append(sig["name"])
            sig_entry = {
                "id": sig["id"],
                "name": sig["name"],
                "category": sig["category"],
                "weight": sig["weight"],
                "severity": sig["severity"],
                "status": "detected",
                "matched_snippet": "Reported by user in guided questionnaire",
                "reason": sig["reason"],
                "recommendation": sig["recommendation"]
            }
            detected_signals.append(sig_entry)
            analyzed_signals.append(sig_entry)
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

    risk_score = min(total_score, 100)

    if risk_score >= 70:
        risk_level = "High Probability Voice-Clone Scam"
        verdict = "Multiple textbook indicators of a voice-cloning social engineering attack detected."
        badge_color = "red"
        confidence_score = 90
        confidence_level = "High Confidence (Multiple Mutually Reinforcing Indicators)"
    elif risk_score >= 40:
        risk_level = "Suspicious Distress Pretext"
        verdict = "Significant psychological pressure tactics detected. High caution required before funds transfer."
        badge_color = "orange"
        confidence_score = 75
        confidence_level = "Moderate Confidence"
    elif risk_score > 0:
        risk_level = "Low to Moderate Caution"
        verdict = "Some urgency detected. Verification is recommended before taking financial action."
        badge_color = "yellow"
        confidence_score = 65
        confidence_level = "Moderate Confidence"
    else:
        risk_level = "Minimal Scam Risk"
        verdict = "No primary psychological or operational voice clone scam vectors indicated in the assessment."
        badge_color = "green"
        confidence_score = 85
        confidence_level = "High Confidence (No Reported Flags)"

    recommendations = [
        "DO NOT send money or crypto immediately, regardless of how convincing the caller sounds.",
        "Hang up immediately and call the family member or friend back on their authentic, pre-saved phone number.",
        "Ask a predetermined Family Code Word or a private question that an AI model scraping social media would not know (e.g. 'What was the name of our first childhood pet?').",
        "Demand an instant FaceTime, WhatsApp, or Google Meet video call with clear lighting to confirm their live physical presence.",
        "Contact another mutual relative or friend to cross-verify the claimed emergency before transferring any funds.",
        "Report attempted cyber extortion to the National Cyber Crime Reporting Portal (1930 / cybercrime.gov.in)."
    ]

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "badge_color": badge_color,
        "verdict": verdict,
        "confidence": {
            "score": confidence_score,
            "level": confidence_level,
            "uncertainty_note": "Assessment based on behavioral and situational decision matrix reported by the user."
        },
        "score_calculation": {
            "method": "Configurable Behavioral Decision Matrix (No Audio Waveform Black-Box ML)",
            "total_points": total_score,
            "formula": f"Sum of Active Behavioral Indicator Weights = {total_score}/100",
            "active_indicators_count": len(detected_signals)
        },
        "analyzed_signals": analyzed_signals,
        "active_indicators": detected_indicators,
        "actionable_countermeasures": recommendations,
        "advisory_disclaimer": "Notice: Heuristic behavioral indicators serve as cautionary advisories, not absolute legal proof of synthetic audio.",
        "transparency_notice": (
            "Important Transparency Notice: This module evaluates behavioral, linguistic, and operational scam patterns "
            "characteristic of AI voice-cloning fraud. It uses an explainable rule-based decision matrix, NOT raw biometric "
            "waveform machine learning, and does not claim to conclusively verify audio files without forensic certification."
        )
    }
