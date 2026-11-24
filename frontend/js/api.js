// Change API_BASE when deploying to live backend URL
const API_BASE = "http://localhost:8000/api";

function getToken() {
  return localStorage.getItem("token");
}

function setToken(token) {
  localStorage.setItem("token", token);
}

function clearToken() {
  localStorage.removeItem("token");
}

// Safe text helper so raw HTML/script never executes as markup
function setSafeText(el, text) {
  if (!el) return;
  el.textContent = text ?? "";
}

function showMessage(el, message, type = "info") {
  if (!el) return;
  el.className = `status-msg ${type}`;
  el.textContent = message;
}

function hideMessage(el) {
  if (!el) return;
  el.className = "status-msg";
  el.textContent = "";
}

async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (res.status === 401) {
    clearToken();
    if (!window.location.pathname.endsWith("index.html")) {
      window.location.href = "index.html";
    }
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const errMsg = data?.error?.message || data?.detail || `Request failed (${res.status})`;
    throw new Error(errMsg);
  }

  return data;
}