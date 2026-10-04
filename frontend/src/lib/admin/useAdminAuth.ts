"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  ADMIN_AUTH_CHANGED_EVENT,
  clearAdminSession,
  getAdminAccessToken,
  getAdminSessionUser,
} from "@/lib/admin/session";
import type { AdminUser } from "@/types/admin";

type Snapshot = {
  user: AdminUser | null;
  token: string | null;
};

const SERVER_SNAPSHOT: Snapshot = { user: null, token: null };

let clientSnapshot: Snapshot = SERVER_SNAPSHOT;

function subscribe(onStoreChange: () => void) {
  window.addEventListener(ADMIN_AUTH_CHANGED_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(ADMIN_AUTH_CHANGED_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot(): Snapshot {
  const user = getAdminSessionUser();
  const token = getAdminAccessToken();
  const prev = clientSnapshot;
  if (prev.token === token && prev.user === user) {
    return prev;
  }
  // Compare by serialized identity when object reference changes but content matches.
  if (
    prev.token === token &&
    ((prev.user === null && user === null) ||
      (prev.user !== null &&
        user !== null &&
        prev.user.id === user.id &&
        prev.user.email === user.email &&
        prev.user.role === user.role))
  ) {
    return prev;
  }
  clientSnapshot = { user, token };
  return clientSnapshot;
}

function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
}

export function useAdminAuth() {
  const { user, token } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const logout = useCallback(() => {
    clearAdminSession();
  }, []);

  return {
    ready: true,
    user,
    token,
    isAuthenticated: Boolean(token && user),
    logout,
  };
}
