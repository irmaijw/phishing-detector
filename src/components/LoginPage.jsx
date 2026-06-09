import { useState } from "react";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }
    setError("");
    onLogin(username.trim());
  }

  return (
    <div style={{ width: "100%", maxWidth: 420 }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 48, height: 48, borderRadius: 12,
          background: "#1a2235", border: "1px solid #1e2d45", marginBottom: 16
        }}>
          <svg width="24" height="24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>PhishGuard</h1>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>SOC phishing detection tool</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label className="label">Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className="label">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div style={{
              background: "var(--danger-bg)", border: "1px solid #3f1515",
              borderRadius: 8, padding: "10px 14px",
              color: "#f87171", fontSize: 13, marginBottom: 16
            }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}