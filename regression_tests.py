"""
CyberShield One - Comprehensive Cybersecurity Regression & Evaluation Test Suite
Validates the 4 Hackathon Cybersecurity Evaluation Criteria:
1. Signals & Features Analysed
2. Detection Approach (Transparent Configurable Rule-Based Heuristic Scoring)
3. False Positives, Ambiguous Inputs, and User Feedback
4. Privacy, Zero-Knowledge Masking & Secure Processing
"""

import os
import sys

# Ensure api directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
api_dir = os.path.join(current_dir, 'api')
if api_dir not in sys.path:
    sys.path.insert(0, api_dir)

from detectors.scam_detector import analyze_scam_message
from detectors.payment_detector import analyze_payment_request
from detectors.impersonation_detector import analyze_impersonation
from detectors.url_detector import analyze_url
from detectors.leak_detector import scan_text_for_leaks
from detectors.permission_detector import analyze_permissions
from detectors.voice_detector import evaluate_voice_clone_scam
from database import init_db, get_db

def run_regression_suite():
    print("=" * 70)
    print("      CYBERSHIELD ONE: HACKATHON EVALUATION REGRESSION SUITE          ")
    print("=" * 70)
    init_db()

    tests_run = 0
    tests_passed = 0

    def assert_test(condition, test_name, detail=""):
        nonlocal tests_run, tests_passed
        tests_run += 1
        if condition:
            tests_passed += 1
            print(f"  [PASS] {test_name}")
        else:
            print(f"  [FAIL] {test_name}: {detail}")
            raise AssertionError(f"Test failed: {test_name} - {detail}")

    print("\n--- 1. BENIGN EXAMPLES (False Positive Resistance) ---")

    # 1.1 Benign Bank Debit SMS
    legit_bank_sms = "Dear Customer, INR 450 debited from A/C XX1234 at POS on 29-Oct. Avail Bal: INR 25,400."
    res = analyze_scam_message(legit_bank_sms)
    assert_test(res["risk_score"] < 25, "1.1 Benign Bank Debit SMS not flagged as threat", f"Score: {res['risk_score']}")
    assert_test("analyzed_signals" in res, "1.1b Signals list documented for benign SMS")

    # 1.2 Benign Customer Care Ticket
    legit_ticket = "Your support ticket #49102 has been marked resolved. Thank you for choosing our service."
    res = analyze_scam_message(legit_ticket)
    assert_test(res["risk_score"] < 25, "1.2 Benign Customer Care Ticket not flagged as threat", f"Score: {res['risk_score']}")

    # 1.3 Benign Payment Message
    legit_pay = "Shared the lunch bill for Rs 450 on PhonePe. Pay whenever free."
    res = analyze_payment_request(legit_pay)
    assert_test(res["risk_score"] < 25, "1.3 Benign Payment Split not flagged as fraud", f"Score: {res['risk_score']}")

    # 1.4 Normal Brand URL
    normal_url = "https://www.github.com/torvalds/linux"
    res = analyze_url(normal_url)
    assert_test(res["risk_score"] == 0, "1.4 Official GitHub URL is completely clean", f"Score: {res['risk_score']}")

    # 1.5 Safe Code / Dummy Placeholders
    safe_code = 'API_KEY = "your_key_here"\nDB_PASS = "changeme"\ndef test(): pass'
    res = scan_text_for_leaks(safe_code)
    assert_test(res["total_findings"] == 0 and res["risk_score"] == 0, "1.5 Dummy key placeholders filtered out", f"Findings: {res['total_findings']}")


    print("\n--- 2. SCAM EXAMPLES (Threat Interception & Severity) ---")

    # 2.1 Urgent Account Freeze & OTP Scams
    scam_msg = "URGENT: Your SBI account blocked within 2 hours. Click http://bit.ly/sbi-verify and share OTP."
    res = analyze_scam_message(scam_msg)
    assert_test(res["risk_score"] >= 70, "2.1 Urgent OTP scam flagged as Critical Threat", f"Score: {res['risk_score']}")
    assert_test(any(s["id"] == "credential_phishing" and s["status"] == "detected" for s in res["analyzed_signals"]), "2.1b OTP Harvesting signal explicitly identified")

    # 2.2 Reverse UPI PIN Trap
    upi_scam = "Congratulations! Received cashback Rs 3,500 on PhonePe. Enter UPI PIN to claim reward."
    res = analyze_payment_request(upi_scam)
    assert_test(res["risk_score"] >= 65, "2.2 Reverse UPI PIN trap flagged as Critical", f"Score: {res['risk_score']}")
    assert_test(any(s["id"] == "reverse_upi_pin" for s in res["analyzed_signals"]), "2.2b Reverse UPI PIN signal explicitly identified")

    # 2.3 Digital Arrest CBI Extortion
    cbi_scam = "Official Notice from CBI: Contraband booked in FedEx parcel in your name. Join Skype for Digital Arrest."
    res = analyze_impersonation(cbi_scam)
    assert_test(res["risk_score"] >= 65, "2.3 Digital Arrest extortion flagged as Critical", f"Score: {res['risk_score']}")
    assert_test(any("CBI" in e for e in res["impersonated_entities"]), "2.3b CBI Impersonation detected")

    # 2.4 Typosquatting Brand Phishing URL
    phish_url = "http://sbi.bank.login-portal.secure-verify.xyz/signin"
    res = analyze_url(phish_url)
    assert_test(res["risk_score"] >= 60, "2.4 Deceptive Typosquatting domain intercepted", f"Score: {res['risk_score']}")

    # 2.5 Real Cloud Secret Exposure
    leak_code = 'AWS_KEY = "AKIAIOSFODNN7EXAMPLE"\nOPENAI = "sk-proj-491029481029481029481029481029481029481029"'
    res = scan_text_for_leaks(leak_code)
    assert_test(res["total_findings"] >= 1 and res["risk_score"] >= 40, "2.5 Cloud secrets intercepted", f"Score: {res['risk_score']}")
    assert_test("AKIA" in res["findings"][0]["masked_value"] and "*" in res["findings"][0]["masked_value"], "2.5b Secret deterministically masked")

    # 2.6 Overprivileged Flashlight App
    res = analyze_permissions("flashlight", ["camera", "microphone", "location", "contacts"])
    assert_test(res["excessive_count"] >= 3 and res["risk_score"] >= 65, "2.6 Overprivileged Flashlight flagged as Severe Over-Privilege", f"Excessive: {res['excessive_count']}")


    print("\n--- 3. AMBIGUOUS, INCOMPLETE & NOISE INPUTS ---")

    # 3.1 Ambiguous Single Word
    amb_res = analyze_scam_message("Hi")
    assert_test(amb_res["is_ambiguous"] is True, "3.1 'Hi' handled conservatively as ambiguous", amb_res["ambiguity_reason"])
    assert_test(amb_res["risk_score"] == 0, "3.1b Ambiguous 'Hi' does not trigger false alarm score")
    assert_test(amb_res["confidence"]["score"] <= 40, "3.1c Low confidence score reported for ambiguous input")

    # 3.2 Casual Short Greeting
    amb_res2 = analyze_impersonation("Call me later")
    assert_test(amb_res2["is_ambiguous"] is True and amb_res2["risk_score"] == 0, "3.2 'Call me later' not misidentified as impersonation")


    print("\n--- 4. TRANSPARENT RULE-BASED SCORING & EXPLAINABILITY ---")

    # 4.1 Transparent Calculation Formula
    res = analyze_scam_message("URGENT: SBI account blocked within 2 hours. Share OTP.")
    assert_test("score_calculation" in res, "4.1 Score calculation object present")
    assert_test("formula" in res["score_calculation"], "4.1b Explicit mathematical formula string provided")
    assert_test("method" in res["score_calculation"] and "Rule-Based" in res["score_calculation"]["method"], "4.1c Labeled as Rule-Based Heuristic Sum (No Black-Box ML)")

    # 4.2 Advisory Disclaimers
    assert_test("advisory_disclaimer" in res and "not absolute legal proof" in res["advisory_disclaimer"], "4.2 Advisory disclaimer explicitly warns against definitive proof claims")


    print("\n--- 5. PRIVACY, ZERO-KNOWLEDGE MASKING & FEEDBACK ---")

    # 5.1 In-Memory Privacy Guarantee
    assert_test("privacy_notice" in res and "Zero-Knowledge" in res["privacy_notice"], "5.1 Zero-Knowledge privacy guarantee present")

    # 5.2 User Feedback Logging (False Positive / Useful Detection)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO scan_feedback (id, module, scan_id, feedback_type, user_note, created_at)
        VALUES ('FB-TEST-01', 'scam_detector', 'CS-1082', 'useful_detection', 'Accurately flagged OTP phishing SMS', '2026-10-29 16:55:00')
    """)
    cursor.execute("""
        INSERT OR REPLACE INTO scan_feedback (id, module, scan_id, feedback_type, user_note, created_at)
        VALUES ('FB-TEST-02', 'scam_detector', 'CS-1083', 'false_positive', 'Internal security alert notification', '2026-10-29 16:55:01')
    """)
    conn.commit()

    cursor.execute("SELECT COUNT(*) FROM scan_feedback WHERE id IN ('FB-TEST-01', 'FB-TEST-02')")
    count = cursor.fetchone()[0]
    conn.close()
    assert_test(count == 2, "5.2 User feedback correctly persisted in SQLite database")

    print("\n" + "=" * 70)
    print(f"   REGRESSION SUITE COMPLETED: {tests_passed}/{tests_run} TESTS PASSED (100% SUCCESS)")
    print("=" * 70)
    return True

if __name__ == "__main__":
    try:
        run_regression_suite()
    except Exception as e:
        print("[FAIL] Regression suite error:", e)
        sys.exit(1)

