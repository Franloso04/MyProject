const TOKEN_KEY = "auth_token";
const ORG_KEY = "organization";

export function saveSession(token, organization) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ORG_KEY, JSON.stringify(organization));
}

export function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ORG_KEY);
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function getOrganization() {
    const org = localStorage.getItem(ORG_KEY);
    return org ? JSON.parse(org) : null;
}

export function isLoggedIn() {
    return !!getToken();
}

export function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = "index.html";
    }
}

export function logout() {
    clearSession();
    window.location.href = "index.html";
}
