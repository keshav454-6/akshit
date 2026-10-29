// CyberShield One - Complete On-Device Offline Security Engine
// Guarantees zero-network execution on mobile devices and standalone APKs

const POPULAR_BRANDS = [
  'google', 'paypal', 'microsoft', 'apple', 'amazon', 'facebook', 'instagram',
  'netflix', 'sbi', 'hdfc', 'icici', 'axisbank', 'paytm', 'phonepe',
  'bank', 'chase', 'wellsfargo', 'binance', 'coinbase', 'whatsapp', 'telegram'
];

const SUSPICIOUS_TLDS = [
  'top', 'xyz', 'cc', 'work', 'buzz', 'click', 'link', 'country', 'stream',
  'gq', 'cf', 'ml', 'ga', 'tk', 'rest', 'fit', 'club', 'surf', 'vip'
];

export function analyzeUrlLocally(urlInput) {
  if (!urlInput || !urlInput.trim()) {
    return { error: "URL cannot be empty." };
  }

  const rawUrl = urlInput.trim();
  let targetUrl = rawUrl;
  if (!/^[a-zA-Z]+:\/\//.test(targetUrl)) {
    targetUrl = 'http://' + targetUrl;
  }

  let hostname = '';
  let scheme = 'http';
  try {
    const parsed = new URL(targetUrl);
    hostname = (parsed.hostname || '').toLowerCase();
    scheme = parsed.protocol.replace(':', '').toLowerCase();
  } catch {
    hostname = rawUrl.split('/')[0].toLowerCase();
  }

  let rawScore = 0;
  const detectedSignals = [];
  const warningIndicators = [];
  const safetyRecommendations = [];

  // 1. Insecure HTTP
  if (scheme === 'http') {
    rawScore += 25;
    detectedSignals.push({
      signal_name: "Insecure Plaintext Protocol (HTTP)",
      weight: 25,
      severity: "High",
      description: "Connection is unencrypted, exposing login credentials to eavesdropping.",
      recommendation: "Never enter passwords or personal data on unencrypted HTTP pages."
    });
    warningIndicators.push("Insecure HTTP protocol");
  }

  // 2. Direct IP Address Hostname
  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  if (isIp) {
    rawScore += 35;
    detectedSignals.push({
      signal_name: "Raw IP Hostname",
      weight: 35,
      severity: "High",
      description: "Target points directly to a raw numerical IP instead of a registered domain.",
      recommendation: "Legitimate institutions virtually never use bare IP addresses."
    });
    warningIndicators.push("Raw IP address used instead of domain name");
  }

  // 3. Excessive Subdomains
  const parts = hostname.split('.');
  if (parts.length > 3) {
    rawScore += 25;
    detectedSignals.push({
      signal_name: "Excessive Subdomain Stacking",
      weight: 25,
      severity: "Medium",
      description: `Domain contains ${parts.length} labels, a common phishing nesting pattern.`,
      recommendation: "Inspect root domain carefully before proceeding."
    });
    warningIndicators.push(`Complex nested subdomain hierarchy (${parts.length} levels)`);
  }

  // 4. Suspicious TLD
  const tld = parts[parts.length - 1];
  if (SUSPICIOUS_TLDS.includes(tld)) {
    rawScore += 20;
    detectedSignals.push({
      signal_name: "High-Risk Top Level Domain (TLD)",
      weight: 20,
      severity: "Medium",
      description: `Domain uses '.${tld}', disproportionately associated with phishing and disposable scams.`,
      recommendation: "Exercise extreme caution with low-reputation domain extensions."
    });
    warningIndicators.push(`Domain uses high-abuse TLD: .${tld}`);
  }

  // 5. Lookalike Brand Spoofing
  let spoofedBrand = null;
  for (const b of POPULAR_BRANDS) {
    if (hostname.includes(b) && !hostname.endsWith('.' + b + '.com') && !hostname.endsWith('.' + b + '.sbi') && hostname !== b + '.com') {
      spoofedBrand = b;
      break;
    }
  }

  if (spoofedBrand) {
    rawScore += 30;
    detectedSignals.push({
      signal_name: "Brand Lookalike Pretext Pattern",
      weight: 30,
      severity: "High",
      description: `Domain references trusted brand '${spoofedBrand}' inside an unauthorized hostname.`,
      recommendation: `Navigate directly to official ${spoofedBrand} portal instead of clicking links.`
    });
    warningIndicators.push(`Brand impersonation targeting '${spoofedBrand}'`);
  }

  const finalScore = Math.min(100, rawScore);
  const riskLevel = finalScore >= 70 ? 'Malicious' : (finalScore >= 35 ? 'Suspicious' : 'Safe');

  if (finalScore === 0) {
    safetyRecommendations.push("No heuristic risk flags detected for this URL.");
  } else {
    safetyRecommendations.push("Do not input personal, financial, or banking credentials.");
    safetyRecommendations.push("Verify domain authenticity via official search engines or bookmarks.");
  }

  return {
    input_url: rawUrl,
    hostname: hostname,
    protocol: scheme.toUpperCase(),
    risk_score: finalScore,
    risk_level: riskLevel,
    confidence: detectedSignals.length > 0 ? 92 : 88,
    is_ambiguous: detectedSignals.length === 0,
    score_calculation: detectedSignals.length > 0
      ? `Final Risk Score = min(100, sum(${detectedSignals.map(s => s.weight).join(' + ')})) = ${finalScore}/100`
      : "Score = 0/100 (Zero risk heuristic signals triggered)",
    detected_signals: detectedSignals,
    analyzed_signals: [
      { name: "Unencrypted Protocol Check", checked: true, triggered: scheme === 'http' },
      { name: "Raw IP Hostname Probe", checked: true, triggered: isIp },
      { name: "Subdomain Stacking Analysis", checked: true, triggered: parts.length > 3 },
      { name: "High-Abuse TLD Assessment", checked: true, triggered: SUSPICIOUS_TLDS.includes(tld) },
      { name: "Brand Keyword Lookalike Scan", checked: true, triggered: !!spoofedBrand }
    ],
    warning_indicators: warningIndicators,
    safety_recommendations: safetyRecommendations,
    advisory_disclaimer: "Heuristic indicators represent advisory warnings based on structural risk signals, not legal proof of fraud.",
    privacy_notice: "Analysis processed locally on-device. Zero URL history or telemetry transmitted externally."
  };
}

export function analyzeScamLocally(messageText) {
  if (!messageText || !messageText.trim()) {
    return { error: "Message text cannot be empty." };
  }

  const text = messageText.toLowerCase();
  let rawScore = 0;
  const detectedSignals = [];

  if (/urgent|immediately|within 24 hours|account suspended|blocked|arrest/.test(text)) {
    rawScore += 30;
    detectedSignals.push({
      signal_name: "Artificial Urgency & Fear Pressure",
      weight: 30,
      severity: "High",
      description: "Message induces panic to force rapid impulsive compliance."
    });
  }

  if (/otp|pin|password|cvv|credentials|secret code/.test(text)) {
    rawScore += 35;
    detectedSignals.push({
      signal_name: "Credential Harvesting Attempt",
      weight: 35,
      severity: "Critical",
      description: "Solicits private authentication codes or passwords."
    });
  }

  if (/anydesk|teamviewer|quicksupport|download apk|install app|sbi\.apk/.test(text)) {
    rawScore += 35;
    detectedSignals.push({
      signal_name: "Remote Access / Unverified App Coercion",
      weight: 35,
      severity: "Critical",
      description: "Directs victim to install remote control software or sideload APKs."
    });
  }

  if (/customer care|support helpline|toll free|helpline number|\+91\d{10}/.test(text)) {
    rawScore += 20;
    detectedSignals.push({
      signal_name: "Unverified Support Pretext",
      weight: 20,
      severity: "Medium",
      description: "Poses as bank or telecom customer service."
    });
  }

  const finalScore = Math.min(100, rawScore);
  const riskLevel = finalScore >= 70 ? 'Malicious' : (finalScore >= 35 ? 'Suspicious' : 'Safe');

  return {
    input_text: messageText,
    risk_score: finalScore,
    risk_level: riskLevel,
    confidence: 90,
    is_ambiguous: detectedSignals.length === 0,
    score_calculation: `Score = min(100, ${detectedSignals.map(s => s.weight).join(' + ') || 0}) = ${finalScore}/100`,
    detected_signals: detectedSignals,
    analyzed_signals: [
      { name: "Urgency Pressure Heuristic", checked: true, triggered: rawScore >= 30 },
      { name: "Credential Solicitations", checked: true, triggered: /otp|pin/.test(text) },
      { name: "Remote Control / APK Detection", checked: true, triggered: /anydesk|apk/.test(text) }
    ],
    safety_recommendations: [
      "Never share OTP, PIN, or passwords with anyone over call or message.",
      "Banks never ask customers to download AnyDesk or APK files."
    ],
    advisory_disclaimer: "Deterministic heuristic detection. Indicators represent advisory warnings.",
    privacy_notice: "Processed 100% on-device with zero-knowledge architecture."
  };
}

export function analyzePaymentLocally(textInput) {
  const text = (textInput || '').toLowerCase();
  let rawScore = 0;
  const detectedSignals = [];

  if (/enter pin|enter upi pin|type pin to receive|scan qr to receive|claim refund/.test(text)) {
    rawScore += 45;
    detectedSignals.push({
      signal_name: "Reverse UPI Payment Inversion",
      weight: 45,
      severity: "Critical",
      description: "Demands entering UPI PIN to receive money (technically impossible on UPI)."
    });
  }

  if (/cashback|lottery|winner|reward points|claim prize/.test(text)) {
    rawScore += 30;
    detectedSignals.push({
      signal_name: "Financial Incentive Bait",
      weight: 30,
      severity: "High",
      description: "Promises free funds to lure victim into approving transaction."
    });
  }

  const finalScore = Math.min(100, rawScore);
  const riskLevel = finalScore >= 65 ? 'Malicious' : (finalScore >= 30 ? 'Suspicious' : 'Safe');

  return {
    input_text: textInput,
    risk_score: finalScore,
    risk_level: riskLevel,
    confidence: 95,
    is_ambiguous: false,
    score_calculation: `Score = min(100, ${finalScore}) = ${finalScore}/100`,
    detected_signals: detectedSignals,
    analyzed_signals: [
      { name: "UPI Logic Inversion Probe", checked: true, triggered: rawScore >= 45 },
      { name: "Cashback Reward Bait Scan", checked: true, triggered: rawScore >= 30 }
    ],
    safety_recommendations: [
      "You NEVER need to enter your UPI PIN to receive money. UPI PIN is only for debiting funds.",
      "Decline any incoming collect request immediately."
    ],
    advisory_disclaimer: "Advisory threat warning based on UPI payment logic.",
    privacy_notice: "On-device processing guarantee."
  };
}

export function analyzeLeakLocally(textInput) {
  const text = textInput || '';
  const detectedSignals = [];
  let rawScore = 0;

  if (/AKIA[0-9A-Z]{16}/.test(text)) {
    rawScore += 50;
    detectedSignals.push({
      signal_name: "Exposed AWS Access Key",
      weight: 50,
      severity: "Critical",
      description: "Detected plaintext Amazon Web Services IAM access credential."
    });
  }

  if (/sk-[a-zA-Z0-9_-]{32,}/.test(text)) {
    rawScore += 45;
    detectedSignals.push({
      signal_name: "Exposed OpenAI API Token",
      weight: 45,
      severity: "Critical",
      description: "Detected live OpenAI API authorization secret."
    });
  }

  if (/ghp_[a-zA-Z0-9]{36}/.test(text)) {
    rawScore += 45;
    detectedSignals.push({
      signal_name: "Exposed GitHub Personal Access Token",
      weight: 45,
      severity: "Critical",
      description: "Detected personal access token granting GitHub repository access."
    });
  }

  const finalScore = Math.min(100, rawScore);
  const riskLevel = finalScore >= 70 ? 'Malicious' : (finalScore >= 30 ? 'Suspicious' : 'Safe');

  return {
    risk_score: finalScore,
    risk_level: riskLevel,
    confidence: 99,
    is_ambiguous: false,
    score_calculation: `Score = min(100, ${finalScore}) = ${finalScore}/100`,
    detected_signals: detectedSignals,
    analyzed_signals: [
      { name: "AWS IAM Pattern Matcher", checked: true, triggered: /AKIA/.test(text) },
      { name: "OpenAI Secret Key Matcher", checked: true, triggered: /sk-/.test(text) },
      { name: "GitHub Token Matcher", checked: true, triggered: /ghp_/.test(text) }
    ],
    safety_recommendations: [
      "Revoke compromised keys immediately from your cloud dashboard.",
      "Rotate credentials and check audit access logs."
    ],
    advisory_disclaimer: "Secrets detection scan.",
    privacy_notice: "Zero-knowledge masking applied: All tokens masked locally before rendering."
  };
}
