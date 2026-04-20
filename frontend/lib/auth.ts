import type { AuthResponse, User } from "@/lib/types";

const TOKEN_KEY = "luxury-car-saas-token";
const USER_KEY = "luxury-car-saas-user";
const AUTH_EVENT = "auth-change";

function canUseStorage() {
  return typeof window !== "undefined";
}

function notifyAuthChange() {
  if (!canUseStorage()) {
    return;
  }

  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function saveToken(token: string) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(TOKEN_KEY, token);
  notifyAuthChange();
}

export function getStoredToken(): string | null {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function saveUser(user: User) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifyAuthChange();
}

export function getStoredUser(): User | null {
  if (!canUseStorage()) {
    return null;
  }

  const rawUser = window.localStorage.getItem(USER_KEY);
  return rawUser ? (JSON.parse(rawUser) as User) : null;
}

export function storeAuthSession(payload: AuthResponse) {
  if (!canUseStorage()) {
    return;
  }

  saveToken(payload.access_token);
  saveUser(payload.user);
}

export function removeToken() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
  notifyAuthChange();
}

export function removeUser() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(USER_KEY);
  notifyAuthChange();
}

export function clearAuthSession() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  notifyAuthChange();
}

export function isLoggedIn() {
  return Boolean(getStoredToken() && getStoredUser());
}

export function isAdmin(user: User | null) {
  return user?.role === "admin";
}

export function canManageCars(user: User | null) {
  return user?.role === "admin" || user?.role === "dealer";
}

export { AUTH_EVENT };

