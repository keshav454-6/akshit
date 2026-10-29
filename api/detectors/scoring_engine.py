import os
import json

_RULES_CACHE = None

def get_rules_config() -> dict:
    """Loads and caches the centralized detection rules configuration."""
    global _RULES_CACHE
    if _RULES_CACHE is not None:
        return _RULES_CACHE

    possible_paths = [
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'detection_rules.json'),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), 'detection_rules.json'),
        os.path.join(os.getcwd(), 'api', 'detection_rules.json'),
        os.path.join(os.getcwd(), 'backend', 'detection_rules.json'),
        os.path.join(os.getcwd(), 'detection_rules.json')
    ]

    for p in possible_paths:
        if os.path.isfile(p):
            try:
                with open(p, 'r', encoding='utf-8') as f:
                    _RULES_CACHE = json.load(f)
                    return _RULES_CACHE
            except Exception:
                pass

    # Fallback default configuration if file missing
    _RULES_CACHE = {
        "version": "1.2.0-fallback",
        "scoring_model": {
            "type": "Transparent Configurable Rule-Based Heuristic Sum"
        },
        "modules": {}
    }
    return _RULES_CACHE


def evaluate_signal_scoring(module_id: str, text: str, detected_signals: list, all_signals: list = None) -> dict:
    """
    Computes transparent, configurable rule-based scoring with individual signal weights,
    confidence metrics, uncertainty explanation, advisory disclaimers, and ambiguous input handling.
    """
    rules = get_rules_config()
    module_cfg = rules.get("modules", {}).get(module_id, {})
    ambiguity_cfg = module_cfg.get("ambiguity_threshold", {"min_characters": 15, "min_words": 3})

    raw_text = (text or "").strip()
    words = raw_text.split()
    char_count = len(raw_text)
    word_count = len(words)

    # 1. Check for Ambiguous / Incomplete / Inconclusive input
    is_ambiguous = False
    ambiguity_reason = ""
    if char_count < ambiguity_cfg.get("min_characters", 15) or word_count < ambiguity_cfg.get("min_words", 3):
        # If there are NO critical signals detected, label as inconclusive/ambiguous
        has_critical = any(s.get("severity") == "Critical" for s in detected_signals)
        if not has_critical:
            is_ambiguous = True
            ambiguity_reason = (
                f"Input is brief ({char_count} chars, {word_count} words). "
                "The engine conservatively flags this as inconclusive to avoid false positives on casual phrases."
            )

    # 2. Transparent Weighted Sum Calculation
    total_weight_points = sum(s.get("weight", 0) for s in detected_signals)
    risk_score = 0 if is_ambiguous else min(total_weight_points, 100)

    # 3. Determine Risk Level
    if is_ambiguous:
        risk_level = "Inconclusive / Context Needed"
        badge_color = "gray"
    elif risk_score >= 70:
        risk_level = "Critical Threat"
        badge_color = "red"
    elif risk_score >= 40:
        risk_level = "High Suspicion"
        badge_color = "orange"
    elif risk_score >= 20:
        risk_level = "Medium Caution"
        badge_color = "yellow"
    else:
        risk_level = "Low Risk / Clean"
        badge_color = "green"

    # 4. Confidence & Uncertainty Scoring
    if is_ambiguous:
        confidence_score = 30
        confidence_level = "Low (Ambiguous Input)"
        uncertainty_factor = "High uncertainty due to minimal conversational context or short character count."
    elif len(detected_signals) >= 3 or risk_score >= 70:
        confidence_score = 92
        confidence_level = "High Confidence"
        uncertainty_factor = "Low uncertainty: Multiple mutually reinforcing fraud indicators identified."
    elif len(detected_signals) >= 1:
        confidence_score = 78
        confidence_level = "Moderate Confidence"
        uncertainty_factor = "Moderate uncertainty: Single or limited indicators found; cross-reference advised."
    else:
        confidence_score = 85
        confidence_level = "Moderate-to-High Confidence (Benign Assessment)"
        uncertainty_factor = "No documented fraud patterns matched in baseline heuristic ruleset."

    # 5. Format Rule Contributions
    contributions = []
    for s in detected_signals:
        contributions.append({
            "signal_id": s.get("id"),
            "name": s.get("name"),
            "category": s.get("category", "General"),
            "weight": s.get("weight", 0),
            "severity": s.get("severity", "Medium"),
            "matched_snippet": s.get("matched_snippet", "")
        })

    formula_str = (
        f"Sum of Triggered Signals = {' + '.join([str(s.get('weight', 0)) for s in detected_signals]) or '0'} "
        f"= {total_weight_points} points. Final Risk Score = min({total_weight_points}, 100) = {risk_score}/100"
    )

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "badge_color": badge_color,
        "is_ambiguous": is_ambiguous,
        "ambiguity_reason": ambiguity_reason,
        "confidence": {
            "score": confidence_score,
            "level": confidence_level,
            "uncertainty_note": uncertainty_factor
        },
        "score_calculation": {
            "method": "Transparent Configurable Rule-Based Heuristic Sum (No Black-Box ML)",
            "total_points": total_weight_points,
            "formula": formula_str,
            "signals_triggered_count": len(detected_signals),
            "signal_contributions": contributions
        },
        "advisory_disclaimer": (
            "Notice: Heuristic indicators represent risk warnings for defense and verification, "
            "not absolute legal proof of fraud or malice."
        ),
        "privacy_notice": (
            "Zero-Knowledge Processing: Evaluated locally in-memory without external cloud transmission. "
            "Sensitive credentials and PII are masked."
        )
    }

