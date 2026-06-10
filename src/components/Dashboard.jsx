export default function Dashboard({ user, history, loading, onNewScan, onLogout }) {
  const total = history.length;
  const phishing = history.filter((h) => h.verdict === "phishing").length;
  const safe = total - phishing;

  return (
    <div style={{ width: "100%", maxWidth: 680 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: "#1a2235", border: "1px solid #1e2d45",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <svg width="18" height="18" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 16 }}>PhishGuard</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "var(--muted)", fontSize: 13 }}>Hi, {user}</span>
          <button className="btn btn-ghost" style={{ padding: "6px 14px", fontSize: 13 }} onClick={onLogout}>
            Sign out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
        {[
          { label: "Total scans", value: total, color: "var(--text)" },
          { label: "Phishing found", value: phishing, color: "#ef4444" },
          { label: "Safe emails", value: safe, color: "#22c55e" },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "1rem 1.25rem"
          }}>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 600, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <h2 style={{ fontSize: 15, fontWeight: 600 }}>Recent scans</h2>
          <button className="btn btn-primary" style={{ padding: "8px 18px", fontSize: 13 }} onClick={onNewScan}>
            + New scan
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "2.5rem 0", color: "var(--muted)", fontSize: 14 }}>
            <span style={{
              width: 20, height: 20, border: "2px solid var(--border)",
              borderTopColor: "var(--accent)", borderRadius: "50%",
              animation: "spin 0.7s linear infinite", display: "inline-block",
              marginBottom: 10
            }}/>
            <div>Loading your scan history...</div>
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2.5rem 0", color: "var(--muted)", fontSize: 14 }}>
            No scans yet. Click "New scan" to analyse an email.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {history.map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "var(--bg3)", borderRadius: 8, padding: "10px 14px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                    background: item.verdict === "phishing" ? "var(--danger-bg)" : "var(--success-bg)",
                    color: item.verdict === "phishing" ? "#f87171" : "#4ade80",
                    textTransform: "uppercase", letterSpacing: "0.05em"
                  }}>
                    {item.verdict}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>
                    {Math.round(item.confidence * 100)}% confidence
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>
                    {item.indicators?.length || 0} indicator{item.indicators?.length !== 1 ? "s" : ""}
                  </span>
                  {item.scanned_at && (
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>
                      {new Date(item.scanned_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}