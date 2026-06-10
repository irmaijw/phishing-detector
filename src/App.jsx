import { useState, useEffect } from "react";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import EmailInput from "./components/EmailInput";
import ResultsCard from "./components/ResultsCard";
import { logoutUser, getScans, saveScan, isLoggedIn, getSavedUsername } from "./api";
import "./App.css";

export default function App() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [result, setResult] = useState(null);
  const [lastEmailBody, setLastEmailBody] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Check if user is already logged in on page load
  useEffect(() => {
    if (isLoggedIn()) {
      setUser(getSavedUsername());
      setScreen("dashboard");
      loadHistory();
    }
  }, []);

  async function loadHistory() {
    setLoadingHistory(true);
    try {
      const scans = await getScans();
      setHistory(scans);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoadingHistory(false);
    }
  }

  function handleLogin(username) {
    setUser(username);
    setScreen("dashboard");
    loadHistory();
  }

  async function handleResult(verdict, emailBody) {
    setResult(verdict);
    setLastEmailBody(emailBody);
    setScreen("results");

    // Save scan to database
    try {
      await saveScan(verdict, emailBody);
      await loadHistory();
    } catch (err) {
      console.error("Failed to save scan:", err);
    }
  }

  function handleLogout() {
    logoutUser();
    setUser(null);
    setResult(null);
    setHistory([]);
    setScreen("login");
  }

  return (
    <div className="app">
      {screen === "login" && (
        <LoginPage onLogin={handleLogin} />
      )}
      {screen === "dashboard" && (
        <Dashboard
          user={user}
          history={history}
          loading={loadingHistory}
          onNewScan={() => setScreen("input")}
          onLogout={handleLogout}
        />
      )}
      {screen === "input" && (
        <EmailInput
          onResult={handleResult}
          onBack={() => setScreen("dashboard")}
        />
      )}
      {screen === "results" && (
        <ResultsCard
          result={result}
          onScanAnother={() => setScreen("input")}
          onDashboard={() => setScreen("dashboard")}
        />
      )}
    </div>
  );
}