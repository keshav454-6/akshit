import re
try:
    from detectors.scoring_engine import evaluate_signal_scoring
except ImportError:
    from scoring_engine import evaluate_signal_scoring

LEAK_SIGNATURES = [
    {
        "id": "aws_key_id",
        "type": "AWS Access Key ID",
        "pattern": r'\b(AKIA[0-9A-Z]{16})\b',
        "severity": "Critical",
        "weight": 40,
        "remediation": "Revoke key via AWS IAM console immediately. Rotate credentials and check CloudTrail logs for unauthorized usage."
    },
    {
        "id": "aws_secret_key",
        "type": "AWS Secret Access Key",
        "pattern": r'(?i)(?:aws_secret_access_key|aws_secret|secret_key)\s*[:=]\s*["\']?([A-Za-z0-9/+=]{40})["\']?',
        "severity": "Critical",
        "weight": 40,
        "remediation": "Deactivate AWS IAM credentials immediately. Use IAM Roles or AWS Secrets Manager instead of hardcoding."
    },
    {
        "id": "github_token",
        "type": "GitHub Personal Access Token",
        "pattern": r'\b(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82})\b',
        "severity": "Critical",
        "weight": 40,
        "remediation": "Revoke this token from GitHub Settings -> Developer Settings -> Personal Access Tokens. Regenerate with minimal required scopes."
    },
    {
        "id": "gcp_api_key",
        "type": "Google Cloud / Firebase API Key",
        "pattern": r'\b(AIza[0-9A-Za-z_-]{35})\b',
        "severity": "High",
        "weight": 25,
        "remediation": "Restrict this key in Google Cloud Console by HTTP referrer, IP address, or specific API services. Rotate if full administrative privileges exist."
    },
    {
        "id": "openai_api_key",
        "type": "OpenAI / LLM API Key",
        "pattern": r'\b(sk-[a-zA-Z0-9]{32,}|sk-proj-[a-zA-Z0-9_-]{40,})\b',
        "severity": "Critical",
        "weight": 35,
        "remediation": "Delete and revoke key on OpenAI Dashboard -> API Keys. Never commit API keys to version control. Store in .env or OS environment variables."
    },
    {
        "id": "anthropic_api_key",
        "type": "Anthropic API Key",
        "pattern": r'\b(sk-ant-[a-zA-Z0-9_-]{40,})\b',
        "severity": "Critical",
        "weight": 35,
        "remediation": "Revoke key immediately on Anthropic Console. Set up billing alerts to catch unauthorized model querying."
    },
    {
        "id": "slack_token",
        "type": "Slack Bot / User Token",
        "pattern": r'\b(xox[baprs]-[0-9a-zA-Z]{10,48})\b',
        "severity": "High",
        "weight": 25,
        "remediation": "Revoke the Slack App / Bot token in api.slack.com/apps. Check audit logs for unauthorized message or workspace access."
    },
    {
        "id": "stripe_key",
        "type": "Stripe API Secret / Publishable Key",
        "pattern": r'\b((?:sk|pk)_(?:live|test)_[0-9a-zA-Z]{24,99})\b',
        "severity": "Critical",
        "weight": 40,
        "remediation": "Roll Stripe key from Stripe Dashboard -> Developers -> API Keys. An exposed live key allows attackers to issue refunds or access customer financial data."
    },
    {
        "id": "rsa_private_key",
        "type": "RSA / OpenSSH Private Key",
        "pattern": r'-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----',
        "severity": "Critical",
        "weight": 45,
        "remediation": "The associated public key must be removed from all authorized_keys files immediately. Generate a new Ed25519 or RSA-4096 keypair."
    },
    {
        "id": "db_connection_uri",
        "type": "Database Connection URI with Credentials",
        "pattern": r'((?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql|redis)://[^:\s]+:[^@\s]+@[a-zA-Z0-9.-]+:[0-9]+/[^\s"\']*)',
        "severity": "Critical",
        "weight": 40,
        "remediation": "Rotate database user password immediately. Whitelist trusted IP CIDRs and use managed secret stores."
    },
    {
        "id": "jwt_token",
        "type": "JSON Web Token (JWT)",
        "pattern": r'\b(eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,})\b',
        "severity": "High",
        "weight": 20,
        "remediation": "Invalidate token on auth server if stateful, or rotate the signing secret key. Check expiration claims (exp)."
    },
    {
        "id": "hardcoded_password",
        "type": "Hardcoded Password Assignment",
        "pattern": r'(?i)(?:password|passwd|pwd|db_pass|secret)\s*[:=]\s*["\']([^"\']{6,40})["\']',
        "severity": "Medium",
        "weight": 15,
        "remediation": "Extract hardcoded secret into environment variables (.env with gitignore) or secure key vault."
    }
]

def mask_secret(value: str) -> str:
    """Masks secret so only a few prefix/suffix characters are visible. Never returns full plaintext."""
    if not value:
        return ""
    val_len = len(value)
    if val_len <= 6:
        return "******"
    elif val_len <= 12:
        return value[:2] + ("*" * (val_len - 3)) + value[-1]
    else:
        return value[:4] + ("*" * (val_len - 8)) + value[-4:]

def scan_text_for_leaks(content: str) -> dict:
    """
    Performs deterministic pattern matching on code or text files.
    Masks all secrets. Never stores raw payload.
    """
    if not content or not content.strip():
        return {"error": "Content cannot be empty. Please paste code or config snippet."}

    lines = content.split('\n')
    findings = []
    seen_matches = set()
    detected_signals = []

    for line_idx, line in enumerate(lines, start=1):
        for sig in LEAK_SIGNATURES:
            regex = re.compile(sig["pattern"])
            for match in regex.finditer(line):
                matched_str = match.group(1) if match.groups() else match.group(0)

                # Filter trivial false positives (placeholders and examples)
                if any(dummy in matched_str.lower() for dummy in ['example.com', 'your_password', 'changeme', 'secret_here', 'xxx', 'your_key', 'my_secret']):
                    continue

                masked = mask_secret(matched_str)
                key = (sig["type"], line_idx, masked)
                if key not in seen_matches:
                    seen_matches.add(key)
                    findings.append({
                        "type": sig["type"],
                        "severity": sig["severity"],
                        "line_number": line_idx,
                        "masked_value": masked,
                        "remediation": sig["remediation"]
                    })
                    detected_signals.append({
                        "id": sig["id"],
                        "name": sig["type"],
                        "category": "Credential Secret",
                        "weight": sig["weight"],
                        "severity": sig["severity"],
                        "status": "detected",
                        "matched_snippet": f"Line {line_idx}: {masked}",
                        "reason": f"Detected exposed secret of type '{sig['type']}'.",
                        "recommendation": sig["remediation"]
                    })

    eval_res = evaluate_signal_scoring("leak_detector", content, detected_signals)

    return {
        "total_findings": len(findings),
        "risk_score": eval_res["risk_score"],
        "risk_level": eval_res["risk_level"],
        "badge_color": eval_res["badge_color"],
        "is_ambiguous": eval_res["is_ambiguous"],
        "ambiguity_reason": eval_res["ambiguity_reason"],
        "confidence": eval_res["confidence"],
        "score_calculation": eval_res["score_calculation"],
        "analyzed_signals": detected_signals,
        "findings": findings,
        "advisory_disclaimer": eval_res["advisory_disclaimer"],
        "privacy_notice": (
            "Zero-Knowledge Scan: CyberShield scans text entirely in-memory on your local machine. "
            "Raw secret values are masked and never logged or dispatched to any external cloud provider."
        )
    }
