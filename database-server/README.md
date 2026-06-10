# PhishGuard — Database Server

Handles user registration, login, and scan history storage for PhishGuard.
Uses SQLite so no external database software is needed.

## Requirements

- Python 3.9+

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

Then open `.env` and change the JWT secret to something random:

### 3. Run the server

```bash
python app.py
```

You should see:

### 4. Test it's working

Open your browser and go to:

You should see `{"status": "ok"}`.

## API Endpoints

### POST /auth/register
Create a new account.

**Request:**
```json
{ "username": "irma", "password": "mypassword" }
```

**Response:**
```json
{ "token": "...", "username": "irma" }
```

### POST /auth/login
Login with existing account.

**Request:**
```json
{ "username": "irma", "password": "mypassword" }
```

**Response:**
```json
{ "token": "...", "username": "irma" }
```

### GET /scans
Get scan history for logged in user.
Requires Authorization header: `Bearer <token>`

### POST /scans
Save a scan result.
Requires Authorization header: `Bearer <token>`

**Request:**
```json
{
  "verdict": "phishing",
  "confidence": 0.93,
  "indicators": [{"type": "lookalike_domain", "evidence": "paypal-secure-login.net"}],
  "rationale": "...",
  "email_body": "..."
}
```
