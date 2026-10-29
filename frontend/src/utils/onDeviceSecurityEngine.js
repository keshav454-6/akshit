// CyberShield One - Complete Robust On-Device Security Engine
// Fulfills exact schema for all detector views with zero network dependency

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
  const rawUrl = (urlInput || '').trim();
  if (!rawUrl) {
    return { error: "URL cannot be empty." };
  }

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

  const isHttps = scheme === 'https';
  let rawScore = 0;
  const warningIndicators = [];
  const safetyRecommendations = [];
  const lookalikeFindings = [];
  const analyzedSignals = [];

  // 1. Insecure Protocol
  const isHttp = scheme === 'http';
  if (isHttp) {
    rawScore += 25;
    warningIndicators.push("Insecure unencrypted HTTP protocol");
    analyzedSignals.push({
      name: "Insecure Plaintext Protocol (HTTP)",
      category: "Protocol",
      weight: 25,
      severity: "High",
      status: "detected",
      description: "Connection is unencrypted, exposing login credentials to eavesdropping.",
      reason: "URL uses plaintext http:// instead of secure https://",
      recommended_action: "Avoid entering credentials or sensitive data on unencrypted sites."
    });
  } else {
    analyzedSignals.push({
      name: "Insecure Plaintext Protocol (HTTP)",
      category: "Protocol",
      weight: 25,
      severity: "High",
      status: "clean",
      description: "Connection is encrypted using TLS/HTTPS.",
      reason: "Secure https:// scheme detected.",
      recommended_action: "None needed."
    });
  }

  // 2. Direct IP Address Hostname
  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  if (isIp) {
    rawScore += 35;
    warningIndicators.push("Raw IP address used instead of domain name");
    analyzedSignals.push({
      name: "Raw IP Hostname",
      category: "Hostname",
      weight: 35,
      severity: "High",
      status: "detected",
      description: "Target points directly to a raw numerical IP instead of a registered domain.",
      reason: "Numerical IP address used as web host.",
      recommended_action: "Legitimate institutions virtually never use bare IP addresses."
    });
  } else {
    analyzedSignals.push({
      name: "Raw IP Hostname",
      category: "Hostname",
      weight: 35,
      severity: "High",
      status: "clean",
      description: "Standard registered domain name utilized.",
      reason: "Domain resolution adheres to standard DNS naming.",
      recommended_action: "None."
    });
  }

  // 3. Excessive Subdomains
  const parts = hostname.split('.');
  const hasExcessiveSubdomains = parts.length > 3;
  if (hasExcessiveSubdomains) {
    rawScore += 25;
    warningIndicators.push(`Complex nested subdomain hierarchy (${parts.length} levels)`);
    analyzedSignals.push({
      name: "Excessive Subdomain Stacking",
      category: "Structure",
      weight: 25,
      severity: "Medium",
      status: "detected",
      description: `Domain contains ${parts.length} labels, a common phishing nesting pattern.`,
      reason: "High subdomain depth designed to deceive casual inspection.",
      recommended_action: "Verify root domain portion of address."
    });
  } else {
    analyzedSignals.push({
      name: "Excessive Subdomain Stacking",
      category: "Structure",
      weight: 25,
      severity: "Medium",
      status: "clean",
      description: "Standard hostname depth.",
      reason: "Acceptable label hierarchy.",
      recommended_action: "None."
    });
  }

  // 4. Suspicious TLD
  const tld = parts[parts.length - 1];
  const isSuspiciousTld = SUSPICIOUS_TLDS.includes(tld);
  if (isSuspiciousTld) {
    rawScore += 20;
    warningIndicators.push(`Domain uses high-abuse TLD: .${tld}`);
    analyzedSignals.push({
      name: "High-Risk Top Level Domain (TLD)",
      category: "TLD",
      weight: 20,
      severity: "Medium",
      status: "detected",
      description: `Domain uses '.${tld}', disproportionately associated with phishing and disposable scams.`,
      reason: `TLD .${tld} has elevated abuse ratings across security blocklists.`,
      recommended_action: "Exercise caution when visiting unfamiliar domain extensions."
    });
  } else {
    analyzedSignals.push({
      name: "High-Risk Top Level Domain (TLD)",
      category: "TLD",
      weight: 20,
      severity: "Medium",
      status: "clean",
      description: "Standard reputable top-level domain.",
      reason: `TLD .${tld} exhibits typical legitimate usage profiles.`,
      recommended_action: "None."
    });
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
    warningIndicators.push(`Brand lookalike targeting '${spoofedBrand}'`);
    lookalikeFindings.push(`Impersonation pattern mimicking '${spoofedBrand}'`);
    analyzedSignals.push({
      name: "Brand Lookalike Pretext Pattern",
      category: "Impersonation",
      weight: 30,
      severity: "High",
      status: "detected",
      description: `Domain references trusted brand '${spoofedBrand}' inside an unauthorized hostname.`,
      reason: `Pretext string '${spoofedBrand}' found in non-canonical domain.`,
      recommended_action: `Navigate directly to official ${spoofedBrand} portal instead of clicking links.`
    });
  } else {
    analyzedSignals.push({
      name: "Brand Lookalike Pretext Pattern",
      category: "Impersonation",
      weight: 30,
      severity: "High",
      status: "clean",
      description: "No brand typosquatting patterns detected.",
      reason: "Hostname does not embed unauthorized high-profile corporate names.",
      recommended_action: "None."
    });
  }

  const finalScore = Math.min(100, rawScore);
  const riskLevel = finalScore >= 60 ? 'Malicious' : (finalScore >= 35 ? 'Suspicious' : 'Safe');

  if (finalScore === 0) {
    safetyRecommendations.push("No heuristic risk flags detected for this URL.");
  } else {
    safetyRecommendations.push("Do not input personal, financial, or banking credentials.");
    safetyRecommendations.push("Verify domain authenticity via official search engines or bookmarks.");
  }

  return {
    input_url: rawUrl,
    hostname: hostname,
    scheme: scheme,
    is_https: isHttps,
    protocol: scheme.toUpperCase(),
    risk_score: finalScore,
    risk_level: riskLevel,
    is_blocked_locally: false,
    confidence: {
      score: analyzedSignals.some(s => s.status === 'detected') ? 92 : 88,
      level: analyzedSignals.some(s => s.status === 'detected') ? "High Confidence" : "Moderate Confidence",
      explanation: "Deterministic heuristic assessment calculated on-device."
    },
    is_ambiguous: finalScore === 0,
    score_calculation: analyzedSignals.filter(s => s.status === 'detected').length > 0
      ? `Final Risk Score = min(100, ${analyzedSignals.filter(s => s.status === 'detected').map(s => s.weight).join(' + ')}) = ${finalScore}/100`
      : "Score = 0/100 (Zero risk heuristic signals triggered)",
    warning_indicators: warningIndicators,
    safety_recommendations: safetyRecommendations,
    lookalike_findings: lookalikeFindings,
    analyzed_signals: analyzedSignals,
    advisory_disclaimer: "Heuristic indicators represent advisory warnings based on structural risk signals, not legal proof of fraud.",
    privacy_notice: "Analysis processed locally on-device. Zero URL history or telemetry transmitted externally."
  };
}

export function analyzeScamLocally(messageText) {
  const rawText = (messageText || '').trim();
  if (!rawText) {
    return { error: "Message text cannot be empty." };
  }

  const text = rawText.toLowerCase();
  let rawScore = 0;
  const warningSigns = [];
  const actions = [];
  const explanations = [];
  const analyzedSignals = [];

  // Urgency
  const hasUrgency = /urgent|immediately|within 24 hours|account suspended|blocked|arrest|deactivated|action required/.test(text);
  if (hasUrgency) {
    rawScore += 30;
    warningSigns.push("Artificial Urgency: Demands immediate action to avoid penalty.");
    explanations.push("Message uses fear, urgency, or account freeze threats to induce impulsive compliance.");
    analyzedSignals.push({
      name: "Artificial Urgency & Fear Pressure",
      category: "Psychological",
      weight: 30,
      severity: "High",
      status: "detected",
      description: "Message induces panic to force rapid impulsive compliance.",
      reason: "Urgent keywords detected (immediately, within 24 hours, blocked).",
      recommended_action: "Pause and independently contact the institution via official contacts."
    });
  } else {
    analyzedSignals.push({
      name: "Artificial Urgency & Fear Pressure",
      category: "Psychological",
      weight: 30,
      severity: "High",
      status: "clean",
      description: "No manufactured panic pressure detected.",
      reason: "Tone is informational without artificial deadlines.",
      recommended_action: "None."
    });
  }

  // Credentials
  const hasCredentials = /otp|pin|password|cvv|credentials|secret code|bank account|pan card/.test(text);
  if (hasCredentials) {
    rawScore += 35;
    warningSigns.push("Credential Harvesting: Requests private codes, PINs, or credentials.");
    explanations.push("Legitimate banks and organizations never ask customers to share OTPs or login PINs.");
    analyzedSignals.push({
      name: "Credential Harvesting Solicitations",
      category: "Credentials",
      weight: 35,
      severity: "Critical",
      status: "detected",
      description: "Solicits private authentication codes or passwords.",
      reason: "Sensitive keywords (OTP, PIN, Password, CVV) found in communication.",
      recommended_action: "Never provide OTPs or passwords to incoming callers or SMS."
    });
  } else {
    analyzedSignals.push({
      name: "Credential Harvesting Solicitations",
      category: "Credentials",
      weight: 35,
      severity: "Critical",
      status: "clean",
      description: "No private credential requests identified.",
      reason: "Communication does not request authentication secrets.",
      recommended_action: "None."
    });
  }

  // Remote Access / APK
  const hasApk = /anydesk|teamviewer|quicksupport|download apk|install app|sbi\.apk|apk file/.test(text);
  if (hasApk) {
    rawScore += 35;
    warningSigns.push("Dangerous Sideloading: Coerces user into downloading third-party APK or remote access software.");
    explanations.push("Scammers use remote management tools (AnyDesk/TeamViewer) to drain accounts.");
    analyzedSignals.push({
      name: "Remote Control / APK Sideloading Trap",
      category: "Payload",
      weight: 35,
      severity: "Critical",
      status: "detected",
      description: "Directs victim to install remote control software or sideload unverified APKs.",
      reason: "Remote software (AnyDesk, TeamViewer) or direct APK mentioned.",
      recommended_action: "Never install remote access applications prompted by SMS or phone calls."
    });
  } else {
    analyzedSignals.push({
      name: "Remote Control / APK Sideloading Trap",
      category: "Payload",
      weight: 35,
      severity: "Critical",
      status: "clean",
      description: "No remote access or untrusted package solicitations.",
      reason: "Clean payload profile.",
      recommended_action: "None."
    });
  }

  const finalScore = Math.min(100, rawScore);
  const riskLevel = finalScore >= 70 ? 'Malicious' : (finalScore >= 40 ? 'Suspicious' : 'Safe');

  actions.push("Do not click any embedded links or call numbers provided in the message.");
  actions.push("Never disclose OTPs, UPI PINs, or passwords.");
  actions.push("Verify independently using official helplines or in-branch visits.");

  return {
    input_text: rawText,
    risk_score: finalScore,
    risk_level: riskLevel,
    detected_indicators_count: warningSigns.length,
    confidence: {
      score: warningSigns.length > 0 ? 92 : 85,
      level: warningSigns.length > 0 ? "High Confidence" : "Moderate Confidence",
      explanation: "Evaluated using deterministic rule-based scam pattern engine."
    },
    is_ambiguous: warningSigns.length === 0,
    score_calculation: warningSigns.length > 0
      ? `Final Score = min(100, ${analyzedSignals.filter(s => s.status === 'detected').map(s => s.weight).join(' + ')}) = ${finalScore}/100`
      : "Score = 0/100 (Zero scam signals triggered)",
    warning_signs: warningSigns,
    actions: actions,
    explanations: explanations,
    analyzed_signals: analyzedSignals,
    advisory_disclaimer: "Deterministic heuristic detection. Indicators represent advisory warnings.",
    privacy_notice: "Processed 100% on-device with zero-knowledge architecture."
  };
}

export function analyzePaymentLocally(textInput) {
  const rawText = (textInput || '').trim();
  const text = rawText.toLowerCase();
  let rawScore = 0;
  const detectedFlags = [];
  const riskExplanations = [];
  const verificationSteps = [];
  const analyzedSignals = [];

  const hasUpiPin = /enter pin|enter upi pin|type pin to receive|scan qr to receive|claim refund|approve request to get/.test(text);
  if (hasUpiPin) {
    rawScore += 45;
    detectedFlags.push("Reverse UPI Fraud: Demands entering UPI PIN to receive money (technically impossible).");
    riskExplanations.push("UPI PIN is exclusively used to authorize debits (money leaving your account). You never enter a PIN to receive funds.");
    analyzedSignals.push({
      name: "Reverse UPI Payment Inversion",
      category: "Financial Logic",
      weight: 45,
      severity: "Critical",
      status: "detected",
      description: "Demands entering UPI PIN to receive money.",
      reason: "Instruction to enter PIN for receiving funds detected.",
      recommended_action: "Decline collect request immediately; UPI PIN is debit-only."
    });
  } else {
    analyzedSignals.push({
      name: "Reverse UPI Payment Inversion",
      category: "Financial Logic",
      weight: 45,
      severity: "Critical",
      status: "clean",
      description: "No reverse PIN inversion detected.",
      reason: "No claims that PIN is required for crediting money.",
      recommended_action: "None."
    });
  }

  const hasCashback = /cashback|lottery|winner|reward points|claim prize|receive 5000|credited to your wallet/.test(text);
  if (hasCashback) {
    rawScore += 30;
    detectedFlags.push("Cashback / Lottery Bait: Uses financial reward to distract user from debit notification.");
    riskExplanations.push("Scammers send payment collect requests disguised as reward claims.");
    analyzedSignals.push({
      name: "Financial Incentive Bait",
      category: "Social Engineering",
      weight: 30,
      severity: "High",
      status: "detected",
      description: "Promises free funds to lure victim into approving transaction.",
      reason: "Cashback or prize terminology detected.",
      recommended_action: "Be skeptical of unsolicited rewards or unexpected refunds."
    });
  } else {
    analyzedSignals.push({
      name: "Financial Incentive Bait",
      category: "Social Engineering",
      weight: 30,
      severity: "High",
      status: "clean",
      description: "No prize or cashback deception identified.",
      reason: "Clean financial proposition.",
      recommended_action: "None."
    });
  }

  const finalScore = Math.min(100, rawScore);
  const riskLevel = finalScore >= 65 ? 'Malicious' : (finalScore >= 35 ? 'Suspicious' : 'Safe');

  verificationSteps.push("Rule: You NEVER enter UPI PIN to receive money.");
  verificationSteps.push("Check the transaction type in your UPI app: 'Pay' vs 'Collect'.");
  verificationSteps.push("Report suspicious UPI IDs directly on cybercrime.gov.in or helpline 1930.");

  return {
    input_text: rawText,
    risk_score: finalScore,
    risk_level: riskLevel,
    assessment: finalScore >= 65 ? "High-Risk Fraudulent Payment Trap" : (finalScore >= 35 ? "Suspicious Collect Request" : "Low Risk Transaction"),
    confidence: {
      score: 95,
      level: "High Confidence",
      explanation: "Deterministic protocol analysis of UPI transaction specifications."
    },
    is_ambiguous: detectedFlags.length === 0,
    score_calculation: `Score = min(100, ${finalScore}) = ${finalScore}/100`,
    detected_flags: detectedFlags,
    risk_explanations: riskExplanations,
    independent_verification_steps: verificationSteps,
    analyzed_signals: analyzedSignals,
    advisory_disclaimer: "Advisory threat warning based on UPI payment logic.",
    privacy_notice: "On-device processing guarantee."
  };
}

export function analyzeLeakLocally(textInput) {
  const text = textInput || '';
  const findings = [];
  const analyzedSignals = [];
  let rawScore = 0;

  if (/AKIA[0-9A-Z]{16}/.test(text)) {
    rawScore += 50;
    findings.push({
      type: "AWS Access Key ID",
      masked_value: "AKIA****************",
      severity: "Critical",
      remediation: "Revoke key from AWS IAM Console and rotate immediately."
    });
    analyzedSignals.push({
      name: "AWS IAM Access Key Matcher",
      category: "Cloud Credentials",
      weight: 50,
      severity: "Critical",
      status: "detected",
      description: "Plaintext AWS Access Key detected in content.",
      reason: "Matched standard AKIA pattern.",
      recommended_action: "Revoke IAM user key immediately."
    });
  } else {
    analyzedSignals.push({
      name: "AWS IAM Access Key Matcher",
      category: "Cloud Credentials",
      weight: 50,
      severity: "Critical",
      status: "clean",
      description: "No AWS credentials detected.",
      reason: "No pattern match.",
      recommended_action: "None."
    });
  }

  if (/sk-[a-zA-Z0-9_-]{32,}/.test(text)) {
    rawScore += 45;
    findings.push({
      type: "OpenAI Secret Key",
      masked_value: "sk-************************************",
      severity: "Critical",
      remediation: "Revoke API key in OpenAI Dashboard to prevent unauthorized token spend."
    });
    analyzedSignals.push({
      name: "OpenAI API Secret Token Matcher",
      category: "API Keys",
      weight: 45,
      severity: "Critical",
      status: "detected",
      description: "Live OpenAI API authorization secret detected.",
      reason: "Matched sk- pattern prefix.",
      recommended_action: "Delete API key from OpenAI developer platform."
    });
  } else {
    analyzedSignals.push({
      name: "OpenAI API Secret Token Matcher",
      category: "API Keys",
      weight: 45,
      severity: "Critical",
      status: "clean",
      description: "No OpenAI API tokens detected.",
      reason: "No pattern match.",
      recommended_action: "None."
    });
  }

  const finalScore = Math.min(100, rawScore);
  const riskLevel = finalScore >= 60 ? 'Malicious' : (finalScore > 0 ? 'Suspicious' : 'Safe');

  return {
    risk_score: finalScore,
    risk_level: riskLevel,
    total_findings: findings.length,
    findings: findings,
    confidence: {
      score: 99,
      level: "High Confidence",
      explanation: "Deterministic cryptographic regex signature matching."
    },
    is_ambiguous: false,
    score_calculation: `Score = min(100, ${finalScore}) = ${finalScore}/100`,
    analyzed_signals: analyzedSignals,
    advisory_disclaimer: "Secrets detection scan. Raw secrets masked locally before display.",
    privacy_notice: "Zero-knowledge masking applied: All tokens masked locally on-device."
  };
}

export function analyzeImpersonationLocally(textInput) {
  const rawText = (textInput || '').trim();
  const text = rawText.toLowerCase();
  let rawScore = 0;
  const impersonatedEntities = [];
  const warningIndicators = [];
  const threatExplanations = [];
  const verificationSteps = [];
  const analyzedSignals = [];

  // Authority check
  if (/cbi|police|customs|cyber crime|supreme court|arrest warrant|narcotics|digital arrest/.test(text)) {
    rawScore += 45;
    impersonatedEntities.push("Law Enforcement / Judicial Authority");
    warningIndicators.push("High-Coercion Pretext: Claims legal action, contraband, or Digital Arrest warrants.");
    threatExplanations.push("Government agencies and courts never issue arrest warrants over video call or ask for security deposits.");
    analyzedSignals.push({
      name: "Law Enforcement Coercion Indicator",
      category: "Authority Impersonation",
      weight: 45,
      severity: "Critical",
      status: "detected",
      description: "Falsely claims association with police, CBI, or judiciary.",
      reason: "Detected high-coercion law enforcement keywords.",
      recommended_action: "Disconnect immediately; legitimate police will never conduct 'Digital Arrests'."
    });
  } else {
    analyzedSignals.push({
      name: "Law Enforcement Coercion Indicator",
      category: "Authority Impersonation",
      weight: 45,
      severity: "Critical",
      status: "clean",
      description: "No judicial or police coercion markers.",
      reason: "Clean authority profile.",
      recommended_action: "None."
    });
  }

  // Courier / Customs check
  if (/fedex|dhl|customs|parcel|consignment|contraband|drugs|passport/.test(text)) {
    rawScore += 30;
    impersonatedEntities.push("Courier & Customs Agency");
    warningIndicators.push("Courier Contraband Pretext: Claims a package in your name contains illegal items.");
    threatExplanations.push("Scammers use fake parcel holds to panic victims into paying clearing fees.");
    analyzedSignals.push({
      name: "Courier Contraband Bait",
      category: "Logistics Impersonation",
      weight: 30,
      severity: "High",
      status: "detected",
      description: "Falsely claims confiscated parcel or illegal contraband.",
      reason: "Customs or courier terms detected.",
      recommended_action: "Call official courier customer support directly using verified website."
    });
  } else {
    analyzedSignals.push({
      name: "Courier Contraband Bait",
      category: "Logistics Impersonation",
      weight: 30,
      severity: "High",
      status: "clean",
      description: "No parcel extortion markers.",
      reason: "Clean logistics profile.",
      recommended_action: "None."
    });
  }

  // Distressed family check
  if (/hi mom|accident|hospital|emergency|dropped my phone|temporary number|send money/.test(text)) {
    rawScore += 35;
    impersonatedEntities.push("Family Member in Distress ('Hi Mom' Scam)");
    warningIndicators.push("Urgent Distress Extortion: Claims family emergency from an unfamiliar number.");
    threatExplanations.push("Attackers pretend to be children or relatives needing urgent hospital or bail money.");
    analyzedSignals.push({
      name: "Distressed Relative Vector",
      category: "Social Engineering",
      weight: 35,
      severity: "Critical",
      status: "detected",
      description: "Pretends to be family member in urgent crisis.",
      reason: "Detected emergency family pretext keywords.",
      recommended_action: "Call the relative on their known phone number before sending money."
    });
  } else {
    analyzedSignals.push({
      name: "Distressed Relative Vector",
      category: "Social Engineering",
      weight: 35,
      severity: "Critical",
      status: "clean",
      description: "No family emergency pretext.",
      reason: "Clean social profile.",
      recommended_action: "None."
    });
  }

  const finalScore = Math.min(100, rawScore);
  const riskLevel = finalScore >= 65 ? 'Malicious' : (finalScore >= 35 ? 'Suspicious' : 'Safe');

  verificationSteps.push("Never transfer money or refundable security deposits to cancel an 'arrest warrant'.");
  verificationSteps.push("Call National Cyber Crime Helpline at 1930 or visit cybercrime.gov.in.");
  verificationSteps.push("Verify independently by contacting the organization using public official directories.");

  return {
    input_text: rawText,
    risk_score: finalScore,
    risk_level: riskLevel,
    impersonated_entities: impersonatedEntities.length > 0 ? impersonatedEntities : ["Unspecified / Generic Contact"],
    warning_indicators: warningIndicators.length > 0 ? warningIndicators : ["No authority impersonation markers detected."],
    threat_explanations: threatExplanations.length > 0 ? threatExplanations : ["Message does not show hallmarks of government or executive impersonation."],
    official_verification_steps: verificationSteps,
    confidence: {
      score: 92,
      level: "High Confidence",
      explanation: "Deterministic heuristic pre-texting signature analysis."
    },
    is_ambiguous: warningIndicators.length === 0,
    score_calculation: `Score = min(100, ${finalScore}) = ${finalScore}/100`,
    analyzed_signals: analyzedSignals,
    advisory_disclaimer: "Advisory threat warning based on documented impersonation vectors.",
    privacy_notice: "On-device analysis completed in-memory."
  };
}

export function analyzePermissionLocally(category, permissions, source = 'manual') {
  const perms = permissions || [];
  const cat = category || 'generic_utility';

  const NECESSARY_MAP = {
    flashlight: ['notifications'],
    calculator: ['notifications'],
    camera_photo: ['camera', 'files_storage', 'notifications'],
    video_call_conferencing: ['camera', 'microphone', 'notifications', 'background_access'],
    navigation_maps: ['location', 'notifications', 'background_access'],
    social_media: ['camera', 'microphone', 'files_storage', 'contacts', 'notifications'],
    ecommerce_shopping: ['notifications', 'location'],
    generic_utility: ['notifications']
  };

  const expected = NECESSARY_MAP[cat] || ['notifications'];
  const auditList = [];
  let excessiveCount = 0;

  const PERM_METADATA = {
    camera: { name: 'Camera', purpose: 'Capture photos/video', risk: 'Can secretly snap background photos.' },
    microphone: { name: 'Microphone', purpose: 'Record audio', risk: 'Can eavesdrop on surrounding conversations.' },
    location: { name: 'Precise GPS Location', purpose: 'Geographic tracking', risk: 'Exposes home address and physical movements.' },
    contacts: { name: 'Contacts Book', purpose: 'Address book access', risk: 'Harvests friend, family, and colleague contact numbers.' },
    files_storage: { name: 'Storage & Media Files', purpose: 'Read/write storage', risk: 'Exposes private documents and photos.' },
    notifications: { name: 'Push Notifications', purpose: 'Alert notifications', risk: 'Can deliver spam or deceptive popups.' },
    background_access: { name: 'Background Execution', purpose: 'Persistent service', risk: 'Drains battery and polls sensors while idle.' },
    sms_call_logs: { name: 'SMS & Call History', purpose: 'Read messages & logs', risk: 'Can intercept 2FA banking OTPs and call records.' }
  };

  perms.forEach(p => {
    const isExcessive = !expected.includes(p);
    if (isExcessive) excessiveCount++;
    const meta = PERM_METADATA[p] || { name: p, purpose: 'System resource', risk: 'General privilege risk' };
    auditList.push({
      name: meta.name,
      status: isExcessive ? 'Excessive / Unjustified' : 'Legitimate',
      is_excessive: isExcessive,
      purpose: meta.purpose,
      privacy_risk: meta.risk,
      recommendation: isExcessive ? `Revoke ${meta.name} permission in Settings; not needed for ${cat.replace('_', ' ')}.` : 'Permission is standard for this application type.'
    });
  });

  const rawScore = Math.min(100, excessiveCount * 28);
  const riskLevel = rawScore >= 65 ? 'Critical Risk' : (rawScore >= 35 ? 'Elevated Risk' : 'Low Risk');

  return {
    risk_score: rawScore,
    risk_level: riskLevel,
    app_category: cat,
    category_description: `Utility profile: expected permissions include ${expected.join(', ')}.`,
    source_type: source,
    is_browser_retrieved: source === 'browser_sensor',
    excessive_count: excessiveCount,
    permissions_audit: auditList
  };
}

export function analyzeVoiceLocally(answers = {}) {
  let rawScore = 0;
  const activeIndicators = [];

  if (answers.familiar_voice_money) {
    rawScore += 25;
    activeIndicators.push("Demands immediate financial transfer or crypto.");
  }
  if (answers.emotional_emergency) {
    rawScore += 25;
    activeIndicators.push("Extreme manufactured crisis (accident, jail, ICU, kidnap).");
  }
  if (answers.demand_secrecy) {
    rawScore += 20;
    activeIndicators.push("Demands strict secrecy and isolation from family.");
  }
  if (answers.urgency_deadline) {
    rawScore += 15;
    activeIndicators.push("Artificial time pressure: 'within minutes'.");
  }
  if (answers.refuses_video_verify) {
    rawScore += 25;
    activeIndicators.push("Refuses live FaceTime / WhatsApp video confirmation.");
  }
  if (answers.unusual_channel_or_number) {
    rawScore += 15;
    activeIndicators.push("Call originated from unfamiliar or hidden number.");
  }
  if (answers.strange_speech_artifacts) {
    rawScore += 20;
    activeIndicators.push("Synthetic pauses, breath glitches, or flat emotional inflection.");
  }

  const finalScore = Math.min(100, rawScore);
  const riskLevel = finalScore >= 60 ? 'Critical Deepfake Risk' : (finalScore >= 35 ? 'Suspicious Impersonation' : 'Standard Interaction');
  const verdict = finalScore >= 60 ? 'Probable AI Voice Clone Extortion Scheme' : (finalScore >= 35 ? 'Potential Social Engineering / Impersonation' : 'Interaction Appears Normal');

  return {
    risk_score: finalScore,
    risk_level: riskLevel,
    verdict: verdict,
    active_indicators: activeIndicators,
    actionable_countermeasures: [
      "Demand the agreed Family Safe-Word before doing anything.",
      "Hang up immediately and call the family member back on their known number.",
      "Request a 10-second live video call with specific gestures (e.g. wave left hand).",
      "Report extortion call to National Cyber Helpline at 1930."
    ]
  };
}
