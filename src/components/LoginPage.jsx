import { useState } from "react";
import { loginUser, registerUser } from "../api";

export default function LoginPage({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (isRegister && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await registerUser(username.trim(), password.trim());
      } else {
        await loginUser(username.trim(), password.trim());
      }
      onLogin(username.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

      {/* Toggle tabs */}
      <div style={{
        display: "flex", background: "var(--bg3)",
        borderRadius: 10, padding: 4, marginBottom: 16,
        border: "1px solid var(--border)"
      }}>
        {["Login", "Register"].map((tab) => (
          <button
            key={tab}
            onClick={() => { setIsRegister(tab === "Register"); setError(""); }}
            style={{
              flex: 1, padding: "8px", border: "none", borderRadius: 8,
              fontSize: 14, fontWeight: 500, cursor: "pointer",
              background: (tab === "Register") === isRegister ? "var(--bg2)" : "transparent",
              color: (tab === "Register") === isRegister ? "var(--text)" : "var(--muted)",
              transition: "all 0.15s"
            }}
          >
            {tab}
          </button>
        ))}
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
          <div style={{ marginBottom: isRegister ? 16 : 20 }}>
            <label className="label">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {isRegister && (
            <div style={{ marginBottom: 20 }}>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          {error && (
            <div style={{
              background: "var(--danger-bg)", border: "1px solid #3f1515",
              borderRadius: 8, padding: "10px 14px",
              color: "#f87171", fontSize: 13, marginBottom: 16
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff", borderRadius: "50%",
                  animation: "spin 0.7s linear infinite", display: "inline-block"
                }}/>
                {isRegister ? "Creating account..." : "Signing in..."}
              </span>
            ) : (isRegister ? "Create account" : "Sign in")}
          </button>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}