"use client";

import { useCallback, useEffect, useState } from "react";
import { getMe, logoutSession } from "@/lib/api/auth";
import type { AuthUser } from "@/types/auth";
import {
  AUTH_CHANGED_EVENT,
  clearSession,
  getAccessToken,
  getSessionUser,
  saveSession,
} from "./session";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setUser(getSessionUser());
    setToken(getAccessToken());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "mixplus.accessToken" || e.key === "mixplus.user") {
        refresh();
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(AUTH_CHANGED_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(AUTH_CHANGED_EVENT, refresh);
    };
  }, [refresh]);

  // Validate opaque session token against API when present.
  useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken) return;

    let cancelled = false;
    void (async () => {
      try {
        const me = await getMe();
        if (cancelled) return;
        saveSession(accessToken, me);
        setUser(me);
        setToken(accessToken);
      } catch {
        if (cancelled) return;
        clearSession();
        setUser(null);
        setToken(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const logout = useCallback(() => {
    void logoutSession().catch(() => undefined);
    clearSession();
    setUser(null);
    setToken(null);
  }, []);

  return {
    user,
    token,
    ready,
    isAuthenticated: Boolean(token && user),
    logout,
    refresh,
  };
}
