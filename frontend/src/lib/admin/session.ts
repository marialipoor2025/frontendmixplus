import type { AdminUser } from "@/types/admin";

const TOKEN_KEY = "mixplus.admin.accessToken";
const USER_KEY = "mixplus.admin.user";
export const ADMIN_AUTH_CHANGED_EVENT = "mixplus:admin-auth-changed";

function notify() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ADMIN_AUTH_CHANGED_EVENT));
}

export function saveAdminSession(accessToken: string, user: AdminUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, accessToken);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  notify();
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  notify();
}

export function getAdminAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getAdminSessionUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}
