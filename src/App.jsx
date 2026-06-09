import { useState } from "react";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import EmailInput from "./components/EmailInput";
import ResultsCard from "./components/ResultsCard";
import "./App.css";

export default function App() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  function handleLogin(username) {
    setUser(username);
    setScreen("dashboard");
  }

  function handleResult(verdict) {
    setHistory((prev) => [verdict, ...prev]);
    setResult(verdict);
    setScreen("results");
  }

  function handleLogout() {
    setUser(null);
    setResult(null);
    setHistory([]);
    setScreen("login");
  }

  return (
    <div className="app">
      {screen === "login" && <LoginPage onLogin={handleLogin} />}
      {screen === "dashboard" && (
        <Dashboard
          user={user}
          history={history}
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