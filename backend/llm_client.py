"""
llm_client.py - LLM Detection Engine for phishing classification

Person 2's deliverable for the team PoC.
Wraps the Ollama API on Glows.ai with the v3 phishing-detection prompt.

Setup:
    pip install requests
    export GLOWS_URL="http://localhost:11434/api/chat"   # inside Glows.ai instance
    # OR for remote access:
    # export GLOWS_URL="https://tw-07.access.glows.ai:23171/api/chat"
    # export GLOWS_TOKEN="your_token_here"

Usage:
    python llm_client.py --smoke-test
    python llm_client.py --input email.json

As a module:
    from llm_client import classify_email, classify_batch
"""

import argparse
import json
import os
import re
import sys
import time

import requests

from dotenv import load_dotenv
load_dotenv()

# ---------------- Configuration ----------------
GLOWS_URL = os.environ.get(
    "GLOWS_URL",
    "https://tw-05.access.glows.ai:25511/api/chat",
)
GLOWS_TOKEN = os.environ.get("GLOWS_TOKEN", "tuUygJ2r1K")
MODEL_NAME = os.environ.get("MODEL_NAME", "gpt-oss:20b")
REQUEST_TIMEOUT = 180


# ---------------- v3 System Prompt (slimmed for 20B) ----------------
SYSTEM_PROMPT = """You are a phishing detection assistant for SOC analysts.

Analyze the email and return ONLY a JSON object with this schema:
{"verdict": "phishing" or "ham", "confidence": 0.0-1.0, "indicators": [{"type": "short label", "evidence": "quote from email"}], "rationale": "2-3 sentences explaining your reasoning"}

Detection guidelines:
- Check for: unexpected requests, unverifiable authority claims, sender/domain mismatch, credential or financial extraction, suspicious URLs or lookalike domains.
- Many phishing attacks contain NO URLs. Do not require links to classify as phishing.
- Good grammar is NOT evidence of legitimacy. Attackers use AI to write fluent text.
- Urgency alone is NOT phishing. Internal IT, HR, and security emails are often urgent. Only flag urgency when combined with credential extraction, external sender, or unverifiable identity.

Return ONLY the JSON object. No other text before or after."""


# ---------------- Few-shot (1 compact example per class) ----------------
FEW_SHOT = [
    {
        "role": "user",
        "content": "Email body:\nFrom: HR Director\nSubject: Direct deposit update\n\nPlease reply with your bank account and routing number to verify your direct deposit before Friday payroll.\n\nExtracted URLs: none",
    },
    {
        "role": "assistant",
        "content": json.dumps({
            "verdict": "phishing",
            "confidence": 0.93,
            "indicators": [
                {"type": "authority_claim", "evidence": "HR Director"},
                {"type": "financial_extraction", "evidence": "reply with your bank account and routing number"},
            ],
            "rationale": "Unverifiable authority claim combined with financial data extraction via reply. No URL needed — this is a classic reply-based payroll scam. Absence of links is not exculpatory.",
        }),
    },
    {
        "role": "user",
        "content": "Email body:\nFrom: IT Operations <itops@company.com>\nSubject: ACTION REQUIRED: Update VPN by 5 PM\n\nAll staff, update VPN via Software Center on your laptop. No external links. Questions? IT helpdesk ext 4500.\n\nExtracted URLs: none",
    },
    {
        "role": "assistant",
        "content": json.dumps({
            "verdict": "ham",
            "confidence": 0.92,
            "indicators": [
                {"type": "internal_sender", "evidence": "itops@company.com"},
                {"type": "no_credential_request", "evidence": "no password or payment requested"},
                {"type": "verifiable_callback", "evidence": "IT helpdesk ext 4500"},
            ],
            "rationale": "Urgent tone but sender is internal, action uses internal software with no external link, no credential extraction, and a verifiable internal callback is provided. Urgency alone is not phishing.",
        }),
    },
]


# ---------------- Core functions ----------------
def build_user_message(record: dict) -> str:
    """Render a Data Handoff Cheat Sheet record into a prompt block."""
    body = record.get("content", {}).get("body", "") or record.get("body", "")
    urls = record.get("features", {}).get("urls", []) or []
    url_count = record.get("features", {}).get("url_count", len(urls))

    parts = [f"Email body:\n{body}"]
    if url_count > 0:
        parts.append(f"\nExtracted URLs ({url_count}): {urls}")
    else:
        parts.append("\nExtracted URLs: none")
    return "\n".join(parts)


def build_messages(record: dict) -> list:
    """System prompt + few-shot pairs + the new email."""
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(FEW_SHOT)
    messages.append({"role": "user", "content": build_user_message(record)})
    return messages


def extract_json(text: str) -> dict:
    """Extract a JSON object from model output, even if wrapped in prose or fences."""
    text = text.strip()
    # Strip markdown fences
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
        text = text.strip()

    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Find the first {...} block in the response
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return json.loads(match.group())

    raise json.JSONDecodeError("No JSON object found in response", text, 0)


def call_ollama(messages: list, timeout: int = REQUEST_TIMEOUT) -> str:
    """POST to Ollama. Returns the raw assistant message content."""
    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "stream": False,
        # NOTE: format:"json" removed — gpt-oss:20b returns empty with it enabled.
        "options": {"temperature": 0.1},
    }
    params = {}
    if GLOWS_TOKEN:
        params["token"] = GLOWS_TOKEN

    r = requests.post(GLOWS_URL, params=params, json=payload, timeout=timeout)
    r.raise_for_status()
    data = r.json()
    return data.get("message", {}).get("content", "")


def parse_verdict(text: str) -> dict:
    """Parse and validate the model output."""
    v = extract_json(text)

    if v.get("verdict") not in ("phishing", "ham"):
        raise ValueError(f"verdict must be 'phishing' or 'ham', got: {v.get('verdict')!r}")
    if not isinstance(v.get("confidence"), (int, float)):
        raise ValueError(f"confidence must be a number, got: {v.get('confidence')!r}")

    v["confidence"] = max(0.0, min(1.0, float(v["confidence"])))
    v.setdefault("indicators", [])
    v.setdefault("rationale", "")
    return v


def classify_email(record: dict, retries: int = 1) -> dict:
    """Classify a single email record.

    Args:
        record: Dict matching the Data Handoff Cheat Sheet:
                {"label": int, "features": {"url_count": int, "urls": [str]},
                 "content": {"body": str}}
        retries: Times to retry on bad output.

    Returns:
        Verdict dict: {"verdict", "confidence", "indicators", "rationale", "_meta"}
    """
    messages = build_messages(record)
    last_error = None

    for attempt in range(retries + 1):
        try:
            raw = call_ollama(messages)
            verdict = parse_verdict(raw)
            verdict["_meta"] = {"attempts": attempt + 1, "model": MODEL_NAME, "raw": raw}
            return verdict
        except (ValueError, json.JSONDecodeError) as e:
            last_error = e
            messages.append({
                "role": "user",
                "content": "Return ONLY the JSON object. No other text.",
            })

    return {
        "verdict": "ham",
        "confidence": 0.5,
        "indicators": [],
        "rationale": f"parse_failure: {last_error}",
        "_meta": {"attempts": retries + 1, "model": MODEL_NAME, "parse_failure": True},
    }


def classify_batch(records: list, verbose: bool = True) -> list:
    """Classify a list of records. Used by Person 4's eval harness."""
    verdicts = []
    for i, rec in enumerate(records):
        t0 = time.time()
        try:
            v = classify_email(rec)
        except requests.RequestException as e:
            v = {
                "verdict": "ham", "confidence": 0.5, "indicators": [],
                "rationale": f"call_failure: {e}",
                "_meta": {"call_failure": True, "model": MODEL_NAME},
            }
        v["_meta"]["latency_seconds"] = round(time.time() - t0, 2)
        verdicts.append(v)
        if verbose:
            print(f"[{i + 1}/{len(records)}] {v['verdict']} conf={v['confidence']:.2f} ({v['_meta'].get('latency_seconds')}s)")
    return verdicts


# ---------------- Smoke test / CLI ----------------
SMOKE_TEST_RECORD = {
    "label": 1,
    "features": {
        "url_count": 1,
        "urls": ["http://paypal-secure-login.net/verify"],
    },
    "content": {
        "body": (
            "From: PayPal Security <noreply@paypal-secure-login.net>\n"
            "Subject: Suspicious activity detected\n\n"
            "We detected unusual activity on your PayPal account. "
            "Click here to verify your identity within 24 hours or your account "
            "will be permanently suspended:\n\n"
            "http://paypal-secure-login.net/verify\n\n"
            "PayPal Security Team"
        ),
    },
}


def main():
    parser = argparse.ArgumentParser(description="LLM phishing detection client.")
    parser.add_argument("--smoke-test", action="store_true")
    parser.add_argument("--input", type=str, help="JSON file with one email record.")
    args = parser.parse_args()

    print(f"Endpoint: {GLOWS_URL}")
    print(f"Model:    {MODEL_NAME}")
    print()

    if args.smoke_test:
        print("Running smoke test...\n")
        t0 = time.time()
        verdict = classify_email(SMOKE_TEST_RECORD)
        elapsed = time.time() - t0
        # Don't dump raw response in pretty print
        display = {k: v for k, v in verdict.items() if k != "_meta"}
        display["_meta"] = {k: v for k, v in verdict["_meta"].items() if k != "raw"}
        print(f"Round-trip: {elapsed:.1f}s\n")
        print(json.dumps(display, indent=2))
        print()
        if verdict.get("_meta", {}).get("parse_failure"):
            print("FAIL: endpoint responded but JSON parsing failed.")
            print(f"Raw output: {verdict['_meta'].get('raw', 'N/A')}")
            sys.exit(1)
        if verdict["verdict"] == "phishing":
            print("PASS: endpoint works, valid JSON, correct verdict.")
            sys.exit(0)
        print(f"UNEXPECTED: got '{verdict['verdict']}' on a known phishing example.")
        sys.exit(2)

    elif args.input:
        with open(args.input) as f:
            record = json.load(f)
        verdict = classify_email(record)
        print(json.dumps({k: v for k, v in verdict.items() if k != "_meta"}, indent=2))

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
