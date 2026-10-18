import { siteConfig } from "@/config/site";

type RequestOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined>;
  /** When true, attach Bearer token from localStorage (browser only). */
  auth?: boolean;
  /**
   * When true, attach anonymous cart token (`X-Guest-Token`) so guests can
   * use cart APIs without login. Still sends Bearer when available.
   */
  guestCart?: boolean;
};

const GUEST_CART_KEY = "mixplus.guestCartToken";

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const base = siteConfig.apiBaseUrl.replace(/\/$/, "");
  const url = new URL(path.startsWith("http") ? path : `${base}${path}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

function readBrowserToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem("mixplus.accessToken");
  } catch {
    return null;
  }
}

/** Persistent anonymous cart id for guest ATC / cart page. */
export function getOrCreateGuestCartToken(): string {
  if (typeof window === "undefined") return "";
  try {
    let token = window.localStorage.getItem(GUEST_CART_KEY);
    if (!token || token.length < 8) {
      token =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID().replace(/-/g, "")
          : `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
      window.localStorage.setItem(GUEST_CART_KEY, token);
    }
    return token;
  } catch {
    return "";
  }
}

export function peekGuestCartToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(GUEST_CART_KEY);
  } catch {
    return null;
  }
}

/**
 * Thin HTTP client. Frontend talks only through this layer so we can
 * switch from mocks → ASP.NET Core without touching UI components.
 */
export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { query, headers, auth, guestCart, ...init } = options;
  const token = auth || guestCart ? readBrowserToken() : null;
  const guestToken =
    guestCart && !token ? getOrCreateGuestCartToken() : null;
  // Merge on login: send both Bearer + guest token.
  const mergeGuest =
    guestCart && token ? peekGuestCartToken() : null;

  const response = await fetch(buildUrl(path, query), {
    ...init,
    headers: {
      Accept: "application/json; charset=utf-8",
      "Content-Type": "application/json; charset=utf-8",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(guestToken || mergeGuest
        ? { "X-Guest-Token": guestToken || mergeGuest || "" }
        : {}),
      ...headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `API ${response.status}: ${path}`;
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload?.error) message = payload.error;
    } catch {
      // keep default message
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
