import re
from urllib.parse import urlparse
import sqlite3
import os

try:
    from detectors.scoring_engine import evaluate_signal_scoring
except ImportError:
    from scoring_engine import evaluate_signal_scoring

if os.environ.get('VERCEL') or os.environ.get('AWS_LAMBDA_FUNCTION_NAME'):
    DB_PATH = '/tmp/cybershield.db'
else:
    DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'cybershield.db')

POPULAR_BRANDS = [
    'google', 'paypal', 'microsoft', 'apple', 'amazon', 'facebook', 'instagram',
    'netflix', 'sbi', 'hdfc', 'icici', 'axisbank', 'paytm', 'phonepe',
    'bank', 'chase', 'wellsfargo', 'binance', 'coinbase', 'whatsapp', 'telegram'
]

SUSPICIOUS_TLDS = {
    'top', 'xyz', 'cc', 'work', 'buzz', 'click', 'link', 'country', 'stream',
    'gq', 'cf', 'ml', 'ga', 'tk', 'rest', 'fit', 'club', 'surf', 'vip'
}

def analyze_url(url_input: str) -> dict:
    """
    Analyzes URLs for protocol security, lookalike domains, excessive subdomains,
    IP hostnames, suspicious TLDs, and queries the local SQLite blocklist.
    """
    if not url_input or not url_input.strip():
        return {"error": "URL cannot be empty."}

    raw_url = url_input.strip()

    target_url = raw_url
    if not re.match(r'^[a-zA-Z]+://', target_url):
        target_url = 'http://' + target_url

    parsed = urlparse(target_url)
    hostname = (parsed.hostname or '').lower()
    path = parsed.path or ''
    scheme = parsed.scheme.lower()

    detected_signals = []
    analyzed_signals = []
    warning_indicators = []
    safety_recommendations = []
    lookalike_findings = []

    # 1. Check Local In-App Blocklist
    is_blocked_locally = False
    blocklist_reason = None
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT reason, risk_score FROM blocklist WHERE url = ? OR domain = ?", (raw_url, hostname))
        row = cursor.fetchone()
        if row:
            is_blocked_locally = True
            blocklist_reason = row[0]
            detected_signals.append({
                "id": "in_app_blocklist",
                "name": "Local In-App Blocklist Match",
                "category": "Threat Intelligence",
                "weight": 90,
                "severity": "Critical",
                "status": "detected",
                "matched_snippet": hostname,
                "reason": f"Domain was previously blocked: {blocklist_reason}",
                "recommendation": "Maintain block; do not visit or whitelist without administrative approval."
            })
            warning_indicators.append(f"PREVIOUSLY BLOCKED: Domain is in your CyberShield In-App Blocklist ({blocklist_reason})")
        conn.close()
    except Exception:
        pass

    # 2. HTTPS Protocol Security
    if scheme != 'https':
        detected_signals.append({
            "id": "unencrypted_http",
            "name": "Unencrypted HTTP Protocol",
            "category": "Transport Security",
            "weight": 25,
            "severity": "Medium",
            "status": "detected",
            "matched_snippet": "http://",
            "reason": "Traffic transmitted in plaintext without TLS/SSL encryption.",
            "recommendation": "Never submit passwords, card details, or personal data on unencrypted sites."
        })
        warning_indicators.append("Unencrypted connection: Uses HTTP instead of secure HTTPS")
        safety_recommendations.append("Never submit passwords or payment details on unencrypted HTTP sites.")
    else:
        safety_recommendations.append("HTTPS is active (traffic is encrypted in transit).")

    # 3. Numeric IP Address as Hostname
    ip_pattern = re.compile(r'^(\d{1,3}\.){3}\d{1,3}$')
    if ip_pattern.match(hostname):
        detected_signals.append({
            "id": "ip_hostname",
            "name": "Raw IP Address Hostname",
            "category": "Domain Infrastructure",
            "weight": 40,
            "severity": "High",
            "status": "detected",
            "matched_snippet": hostname,
            "reason": "Direct numeric IP addresses are frequently used to bypass domain reputation checks.",
            "recommendation": "Legitimate consumer web services utilize registered brand domain names."
        })
        warning_indicators.append(f"Raw IP address used as hostname ({hostname}) instead of registered domain name")
        safety_recommendations.append("Avoid accessing raw numeric IP hostnames.")

    # 4. Suspicious / Disposable TLDs
    tld = hostname.split('.')[-1] if '.' in hostname else ''
    if tld in SUSPICIOUS_TLDS:
        detected_signals.append({
            "id": "suspicious_tld",
            "name": "High-Risk Disposable TLD",
            "category": "Domain Reputation",
            "weight": 25,
            "severity": "Medium",
            "status": "detected",
            "matched_snippet": f".{tld}",
            "reason": f"The '.{tld}' top-level domain is statistically overrepresented in low-cost malicious infrastructure.",
            "recommendation": "Exercise elevated caution when browsing or entering information."
        })
        warning_indicators.append(f"Domain registered under high-risk/disposable TLD (.{tld})")

    # 5. Lookalike Brand Typosquatting
    host_parts = hostname.split('.')
    main_domain = host_parts[-2] if len(host_parts) >= 2 else hostname
    for brand in POPULAR_BRANDS:
        if brand in hostname:
            if brand not in main_domain and len(host_parts) > 2:
                detected_signals.append({
                    "id": "lookalike_brand",
                    "name": f"Lookalike Spoofing: {brand.upper()}",
                    "category": "Brand Impersonation",
                    "weight": 40,
                    "severity": "Critical",
                    "status": "detected",
                    "matched_snippet": f"{brand} inside {hostname}",
                    "reason": f"Targeted brand '{brand.upper()}' appears as a deceptive subdomain or segment while actual parent domain is '{main_domain}'.",
                    "recommendation": f"Verify whether this is the authentic {brand.upper()} portal ({brand}.com or official national domain)."
                })
                lookalike_findings.append(f"Brand spoofing: '{brand.upper()}' used in subdomain, but registered domain is '{main_domain}'")
                warning_indicators.append(f"Deceptive Brand Masquerade: Mentions '{brand.upper()}', but registered root domain is '{main_domain}'")

    # 6. Nested Subdomains
    if len(host_parts) >= 4 and not ip_pattern.match(hostname):
        detected_signals.append({
            "id": "excessive_subdomains",
            "name": "Nested Subdomain Masquerading",
            "category": "Structural Deception",
            "weight": 30,
            "severity": "High",
            "status": "detected",
            "matched_snippet": f"{len(host_parts)} subdomain levels",
            "reason": "Excessive subdomain chaining is a common tactic to conceal the true apex root domain.",
            "recommendation": "Examine the root domain immediately preceding the TLD."
        })
        warning_indicators.append(f"Unusually complex subdomain nesting ({len(host_parts)} levels: '{hostname}')")

    eval_res = evaluate_signal_scoring("url_detector", raw_url, detected_signals)

    if not warning_indicators:
        warning_indicators.append("No typical deceptive typosquatting, raw IP, or high-risk TLDs detected.")
        safety_recommendations.append("The domain structure conforms to standard web conventions.")

    return {
        "url": raw_url,
        "hostname": hostname,
        "scheme": scheme,
        "is_blocked_locally": is_blocked_locally,
        "blocklist_reason": blocklist_reason,
        "risk_score": eval_res["risk_score"],
        "risk_level": eval_res["risk_level"],
        "badge_color": eval_res["badge_color"],
        "is_ambiguous": eval_res["is_ambiguous"],
        "ambiguity_reason": eval_res["ambiguity_reason"],
        "confidence": eval_res["confidence"],
        "score_calculation": eval_res["score_calculation"],
        "analyzed_signals": detected_signals,
        "warning_indicators": warning_indicators,
        "safety_recommendations": safety_recommendations,
        "lookalike_findings": lookalike_findings,
        "advisory_disclaimer": eval_res["advisory_disclaimer"],
        "privacy_notice": eval_res["privacy_notice"]
    }
