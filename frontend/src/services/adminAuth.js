// Admin session helpers. The JWT from /api/admin/login is kept in
// localStorage; these helpers read it and tell whether it is still valid.

const TOKEN_KEY = "admin_token";
const USER_KEY = "admin_user";

// Fired when the session ends (logout or a 401 from the API) so the
// admin route guard can redirect to the login page.
export const AUTH_EVENT = "admin-auth-changed";

const decodePayload = (token) => {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

export const getAdminToken = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    const payload = decodePayload(token);
    // Treat malformed or expired tokens as no token
    if (!payload || (payload.exp && payload.exp * 1000 <= Date.now())) {
      clearAdminSession();
      return null;
    }
    return token;
  } catch {
    return null;
  }
};

export const getAdminUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
};

export const saveAdminSession = (token, admin) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(admin || {}));
  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const clearAdminSession = () => {
  const hadToken = localStorage.getItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  if (hadToken) window.dispatchEvent(new Event(AUTH_EVENT));
};
