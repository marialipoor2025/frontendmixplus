"use client";

import { useCallback, useEffect, useState } from "react";
import type { AuthUser } from "@/types/auth";
import {
  AUTH_CHANGED_EVENT,
  clearSession,
  getAccessToken,
  getSessionUser,
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

  const logout = useCallback(() => {
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
