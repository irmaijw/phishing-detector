import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:11434";

export default function EmailInput({ onResult, onBack }) {
  const [body, setBody] = useState("");
  const [urls, setUrls] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function extractUrls(text) {
    const matches = text.match(/https?:\/\/[^\s]+/g) || [];
    return [...new Set(matches)];
  }

  async function handleAnalyse() {
    if (!body.trim()) {
      setError("Please paste an email body before analysing.");
      return;
    }
    setError("");
    setLoading(true);

    const autoUrls = extractUrls(body);
    const manualUrls = urls.split("\n").map((u) => u.trim()).filter(Boolean);
    const allUrls = [...new Set([...autoUrls, ...manualUrls])];

    const record = {
      features: { url_count: allUrls.length, urls: allUrls },
      content: { body: body.trim() },
    };

    try {
      const res = await fetch(`${API_URL}/api/classify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      onResult(data);
    } catch (err) {
      setError(`Could not reach the backend: ${err.message}. Make sure your friend's server is running.`);
    } finally {
      setLoading(false);
    }
  }

  const charCount = body.length;

  return (
    <div style={{ width: "100%", maxWidth: 680 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
        <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 13 }} onClick={onBack}>
          ← Back
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 600 }}>Analyse email</h1>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <label className="label" style={{ margin: 0 }}>Email body</label>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>{charCount} chars</span>
        </div>
        <textarea
          rows={12}
          placeholder={"Paste the full email here — including From, Subject, and body text.\n\nExample:\nFrom: PayPal <noreply@paypal-secure.net>\nSubject: Your account is suspended\n\nClick here to verify your account..."}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          style={{ resize: "vertical", lineHeight: 1.6 }}
        />
        {extractUrls(body).length > 0 && (
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
            {extractUrls(body).length} URL{extractUrls(body).length !== 1 ? "s" : ""} detected automatically
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <label className="label">Additional URLs (optional)</label>
        <textarea
          rows={3}
          placeholder={"Add any extra URLs found in the email, one per line.\nMost URLs are detected automatically from the body above."}
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          style={{ resize: "none" }}
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

      <button
        className="btn btn-primary"
        style={{ width: "100%", padding: "12px", fontSize: 15 }}
        onClick={handleAnalyse}
        disabled={loading || !body.trim()}
      >
        {loading ? (
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)",
              borderTopColor: "#fff", borderRadius: "50%",
              animation: "spin 0.7s linear infinite", display: "inline-block"
            }}/>
            Analysing…
          </span>
        ) : "Analyse email"}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}