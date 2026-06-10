PhishGuard - AI-Powered Phishing Detection App

PhishGuard is an AI-powered phishing detection tool built for SOC analysts. This demo showcases the full application we built as a team Proof of Concept (PoC).

🔍 What PhishGuard does:
- Analyses email content and detects phishing attempts using a large language model (LLM)
- Returns a verdict (phishing or safe), confidence score, indicators, and rationale
- Saves scan history per user with a real database

🛠️ Tech Stack:
- Frontend: React + Vite
- Backend: Python + Flask
- AI Engine: GPT-OSS 20B via Ollama on Glows.ai
- Database: SQLite + Flask-JWT for user authentication

📋 Features shown in this demo:
- User registration and login
- Email analysis with AI verdict
- Confidence score and indicator breakdown
- Scan history dashboard

👩‍💻 Built by:
- Frontend & Integration: 溫艷艷
- LLM Detection Engine: 黃愛弟 & 施發梅
- Data to train: 陳友平

🔗 GitHub Repository Demo:
https://youtu.be/XFeo4iZXgag


#phishing #cybersecurity #AI #React #Python #SOC #LLM #MachineLearning #WebDevelopment

## Project Structure

phishing-detector/
├── src/                          ← React frontend
│   ├── components/
│   │   ├── LoginPage.jsx         ← Login & registration
│   │   ├── Dashboard.jsx         ← Scan history & stats
│   │   ├── EmailInput.jsx        ← Email submission form
│   │   └── ResultsCard.jsx       ← Verdict display
│   ├── api.js                    ← Database server API calls
│   ├── App.jsx                   ← Main app & routing
│   └── App.css                   ← Global styles
├── backend/                      ← LLM classification server
│   ├── server.py                 ← Flask API wrapping llm_client
│   ├── llm_client.py             ← LLM detection engine
│   ├── requirements.txt
│   └── .env.example
├── database-server/              ← User auth & scan history
│   ├── app.py                    ← Flask API for auth & scans
│   ├── database.py               ← SQLite setup
│   ├── requirements.txt
│   └── .env.example
├── .env                          ← Frontend environment variables
├── .gitignore
└── README.md