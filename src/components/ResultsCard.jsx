export default function ResultsCard({ result, onScanAnother, onDashboard }) {
  if (!result) return null;

  const isPhishing = result.verdict === "phishing";
  const confidence = Math.round((result.confidence || 0) * 100);

  return (
    <div style={{ width: "100%", maxWidth: 680 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
        <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 13 }} onClick={onDashboard}>
          ← Dashboard
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 600 }}>Analysis result</h1>
      </div>

      <div style={{
        background: isPhishing ? "var(--danger-bg)" : "var(--success-bg)",
        border: `1px solid ${isPhishing ? "#3f1515" : "#0f3320"}`,
        borderRadius: 12, padding: "1.5rem", marginBottom: 12,
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 10,
            background: isPhishing ? "#2d0f0f" : "#0a2010",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            {isPhishing ? (
              <svg width="24" height="24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            ) : (
              <svg width="24" height="24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
            )}
          </div>
          <div>
            <div style={{
              fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
              textTransform: "uppercase", color: isPhishing ? "#f87171" : "#4ade80",
              marginBottom: 4
            }}>
              {isPhishing ? "Phishing detected" : "Email is safe"}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: isPhishing ? "#f87171" : "#4ade80" }}>
              {confidence}% confidence
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Indicators
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, color: "var(--text)" }}>
            {result.indicators?.length || 0}
          </div>
        </div>
      </div>

      {result.rationale && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="label">Rationale</div>
          <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.7 }}>{result.rationale}</p>
        </div>
      )}

      {result.indicators?.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="label" style={{ marginBottom: 12 }}>Indicators found</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {result.indicators.map((ind, i) => (
              <div key={i} style={{
                background: "var(--bg3)", borderRadius: 8, padding: "10px 14px",
                borderLeft: `3px solid ${isPhishing ? "#ef4444" : "#22c55e"}`
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, textTransform: "uppercase",
                  letterSpacing: "0.06em", color: isPhishing ? "#f87171" : "#4ade80",
                  marginBottom: 4
                }}>
                  {ind.type?.replace(/_/g, " ")}
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)", fontStyle: "italic" }}>
                  "{ind.evidence}"
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn btn-primary" style={{ flex: 1, padding: "11px" }} onClick={onScanAnother}>
          Scan another email
        </button>
        <button className="btn btn-ghost" style={{ flex: 1, padding: "11px" }} onClick={onDashboard}>
          Back to dashboard
        </button>
      </div>
    </div>
  );
}