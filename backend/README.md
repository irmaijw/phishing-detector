# PhishGuard — Backend

This is the backend server for PhishGuard. It wraps the LLM phishing detection engine (`llm_client.py`) and exposes it as an API that the React frontend can call.

## Requirements

- Python 3.9+
- A running Glows.ai instance with the `gpt-oss:20b` model

## Setup

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure environment variables

Copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

Then open `.env` and fill in your Glows.ai details:

### 3. Run the server

```bash
python server.py
```

You should see:

Starting PhishGuard backend on port 5000
Classify endpoint: http://localhost:5000/api/classify

### 4. Test it's working

Open your browser and go to:

http://localhost:5000/api/health

You should see `{"status": "ok"}`.

## API

### POST /api/classify

Accepts an email record and returns a verdict.

**Request:**
```json
{
  "features": { "url_count": 1, "urls": ["http://..."] },
  "content": { "body": "email text here" }
}
```

**Response:**
```json
{
  "verdict": "phishing",
  "confidence": 0.93,
  "indicators": [{ "type": "lookalike_domain", "evidence": "paypal-secure-login.net" }],
  "rationale": "..."
}
```

### GET /api/health

Returns `{"status": "ok"}` if the server is running.

## Smoke test

To test the LLM connection directly without the frontend:

```bash
python llm_client.py --smoke-test
```

