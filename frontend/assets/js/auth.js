export function saveSession(sessionData) {
  localStorage.setItem("session", JSON.stringify(sessionData));
}

export function getSession() {
  const raw = localStorage.getItem("session");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("session");
  localStorage.removeItem("selected_event");
  window.location.href = "./index.html";
}

export function getToken() {
  const session = getSession();
  return session?.token || null;
}

export function requireAuth() {
  const session = getSession();
  const token = getToken();
  if (!session || !token) {
    window.location.href = "./index.html";
  }
}

export function setSelectedEvent(event) {
  localStorage.setItem("selected_event", JSON.stringify(event));
}

export function getSelectedEvent() {
  const raw = localStorage.getItem("selected_event");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
