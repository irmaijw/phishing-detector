const DB_URL = import.meta.env.VITE_DB_URL || "http://localhost:5001";

function getToken() {
  return localStorage.getItem("token");
}

export async function registerUser(username, password) {
  const res = await fetch(`${DB_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed");
  localStorage.setItem("token", data.token);
  localStorage.setItem("username", data.username);
  return data;
}

export async function loginUser(username, password) {
  const res = await fetch(`${DB_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  localStorage.setItem("token", data.token);
  localStorage.setItem("username", data.username);
  return data;
}

export function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
}

export async function getScans() {
  const res = await fetch(`${DB_URL}/scans`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load scans");
  return data;
}

export async function saveScan(verdict, emailBody) {
  const res = await fetch(`${DB_URL}/scans`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      verdict: verdict.verdict,
      confidence: verdict.confidence,
      indicators: verdict.indicators,
      rationale: verdict.rationale,
      email_body: emailBody,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save scan");
  return data;
}

export function getSavedUsername() {
  return localStorage.getItem("username");
}

export function isLoggedIn() {
  return !!localStorage.getItem("token");
}