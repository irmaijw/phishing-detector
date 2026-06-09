"""
app.py - Flask API server for user auth and scan history

Endpoints:
    POST /auth/register   - create a new account
    POST /auth/login      - login, returns a token
    GET  /scans           - get current user's scan history
    POST /scans           - save a scan result
    GET  /api/health      - check server is running
"""

import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from database import get_db, init_db

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "change-this-secret")
jwt = JWTManager(app)


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    db = get_db()
    try:
        existing = db.execute(
            "SELECT id FROM users WHERE username = ?", (username,)
        ).fetchone()

        if existing:
            return jsonify({"error": "Username already taken"}), 409

        password_hash = generate_password_hash(password)
        db.execute(
            "INSERT INTO users (username, password_hash) VALUES (?, ?)",
            (username, password_hash)
        )
        db.commit()

        token = create_access_token(identity=username)
        return jsonify({"token": token, "username": username}), 201

    finally:
        db.close()


@app.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    db = get_db()
    try:
        user = db.execute(
            "SELECT * FROM users WHERE username = ?", (username,)
        ).fetchone()

        if not user or not check_password_hash(user["password_hash"], password):
            return jsonify({"error": "Invalid username or password"}), 401

        token = create_access_token(identity=username)
        return jsonify({"token": token, "username": username})

    finally:
        db.close()


@app.route("/scans", methods=["GET"])
@jwt_required()
def get_scans():
    username = get_jwt_identity()
    db = get_db()
    try:
        user = db.execute(
            "SELECT id FROM users WHERE username = ?", (username,)
        ).fetchone()

        scans = db.execute(
            "SELECT * FROM scans WHERE user_id = ? ORDER BY scanned_at DESC",
            (user["id"],)
        ).fetchall()

        result = []
        for scan in scans:
            result.append({
                "id": scan["id"],
                "verdict": scan["verdict"],
                "confidence": scan["confidence"],
                "indicators": json.loads(scan["indicators"]),
                "rationale": scan["rationale"],
                "email_body": scan["email_body"],
                "scanned_at": scan["scanned_at"],
            })

        return jsonify(result)

    finally:
        db.close()


@app.route("/scans", methods=["POST"])
@jwt_required()
def save_scan():
    username = get_jwt_identity()
    data = request.get_json()

    verdict = data.get("verdict")
    confidence = data.get("confidence")
    indicators = data.get("indicators", [])
    rationale = data.get("rationale", "")
    email_body = data.get("email_body", "")

    if not verdict or confidence is None:
        return jsonify({"error": "verdict and confidence are required"}), 400

    db = get_db()
    try:
        user = db.execute(
            "SELECT id FROM users WHERE username = ?", (username,)
        ).fetchone()

        db.execute(
            """INSERT INTO scans
               (user_id, verdict, confidence, indicators, rationale, email_body)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (
                user["id"],
                verdict,
                confidence,
                json.dumps(indicators),
                rationale,
                email_body,
            )
        )
        db.commit()
        return jsonify({"message": "Scan saved successfully"}), 201

    finally:
        db.close()


if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5001))
    print(f"Starting PhishGuard database server on port {port}")
    print(f"Register: http://localhost:{port}/auth/register")
    print(f"Login:    http://localhost:{port}/auth/login")
    print(f"Scans:    http://localhost:{port}/scans")
    app.run(host="0.0.0.0", port=port, debug=True)