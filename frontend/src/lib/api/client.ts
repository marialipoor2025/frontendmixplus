import { siteConfig } from "@/config/site";

type RequestOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined>;
  /** When true, attach Bearer token from localStorage (browser only). */
  auth?: boolean;
};

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

/**
 * Thin HTTP client. Frontend talks only through this layer so we can
 * switch from mocks → ASP.NET Core without touching UI components.
 */
export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { query, headers, auth, ...init } = options;
  const token = auth ? readBrowserToken() : null;

  const response = await fetch(buildUrl(path, query), {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
