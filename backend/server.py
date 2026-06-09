"""
server.py - Flask API server that wraps llm_client.py

Your friend runs this to expose the /api/classify endpoint
that the React frontend calls.

Setup:
    pip install -r requirements.txt
    copy .env.example to .env and fill in your values

Run:
    python server.py
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from llm_client import classify_email

load_dotenv()

app = Flask(__name__)
CORS(app)


@app.route("/api/classify", methods=["POST"])
def classify():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No JSON body received"}), 400

    content = data.get("content", {})
    features = data.get("features", {})

    if not content.get("body"):
        return jsonify({"error": "Missing email body in content.body"}), 400

    record = {
        "content": content,
        "features": features,
    }

    try:
        result = classify_email(record)
        result.pop("_meta", None)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting PhishGuard backend on port {port}")
    print(f"Classify endpoint: http://localhost:{port}/api/classify")
    app.run(host="0.0.0.0", port=port, debug=True)