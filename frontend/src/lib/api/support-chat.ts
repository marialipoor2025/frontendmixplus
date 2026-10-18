import { siteConfig } from "@/config/site";
import { apiClient } from "@/lib/api/client";

export type ChatSender = "Visitor" | "Agent" | "Bot" | "System" | number;

export type ChatAttachment = {
  id: string;
  fileName: string;
  contentType: string;
  url: string;
  sizeBytes: number;
};

export type ChatMessage = {
  id: string;
  sessionId: string;
  sender: ChatSender;
  senderName: string;
  text: string;
  attachment?: ChatAttachment | null;
  createdAtUtc: string;
};

export type ChatSession = {
  id: string;
  visitorId: string;
  visitorName?: string | null;
  status: "Open" | "Assigned" | "Closed" | number | string;
  agentId?: string | null;
  agentName?: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
  messages: ChatMessage[];
};

export type ChatAgent = {
  id: string;
  displayName: string;
  isOnline: boolean;
  lastSeenAtUtc: string;
};

const VISITOR_KEY = "mixplus.chatVisitorId";
const SESSION_KEY = "mixplus.chatSessionId";
const AGENT_KEY = "mixplus.supportAgent";

function enabled() {
  return !siteConfig.useMocks && Boolean(siteConfig.apiBaseUrl);
}

function absoluteUrl(path: string) {
  if (!path) return path;
  if (path.startsWith("http")) return path;
  const base = siteConfig.apiBaseUrl.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID().replace(/-/g, "");
      window.localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID().replace(/-/g, "");
  }
}

export function readStoredSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function storeSessionId(id: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (id) window.localStorage.setItem(SESSION_KEY, id);
    else window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export function readStoredAgent(): ChatAgent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AGENT_KEY);
    return raw ? (JSON.parse(raw) as ChatAgent) : null;
  } catch {
    return null;
  }
}

export function storeAgent(agent: ChatAgent | null) {
  if (typeof window === "undefined") return;
  try {
    if (agent) window.localStorage.setItem(AGENT_KEY, JSON.stringify(agent));
    else window.localStorage.removeItem(AGENT_KEY);
  } catch {
    // ignore
  }
}

export function isVisitorSender(sender: ChatSender): boolean {
  return sender === "Visitor" || sender === 0;
}

export function attachmentDisplayUrl(attachment: ChatAttachment): string {
  return absoluteUrl(attachment.url);
}

export async function createChatSession(
  visitorName?: string,
): Promise<ChatSession | null> {
  if (!enabled()) return null;
  const visitorId = getOrCreateVisitorId();
  const session = await apiClient<ChatSession>("/api/support/chat/sessions", {
    method: "POST",
    body: JSON.stringify({ visitorId, visitorName: visitorName || null }),
  });
  storeSessionId(session.id);
  return {
    ...session,
    messages: session.messages ?? [],
  };
}

export async function getChatSession(
  sessionId: string,
): Promise<ChatSession | null> {
  if (!enabled()) return null;
  try {
    const session = await apiClient<ChatSession>(
      `/api/support/chat/sessions/${encodeURIComponent(sessionId)}`,
    );
    return { ...session, messages: session.messages ?? [] };
  } catch {
    return null;
  }
}

export async function pollChatMessages(
  sessionId: string,
  after?: string,
): Promise<{
  sessionId: string;
  status: string;
  agentName?: string | null;
  messages: ChatMessage[];
} | null> {
  if (!enabled()) return null;
  try {
    return await apiClient(
      `/api/support/chat/sessions/${encodeURIComponent(sessionId)}/messages`,
      {
        query: after ? { after } : undefined,
      },
    );
  } catch {
    return null;
  }
}

export async function sendVisitorMessage(
  sessionId: string,
  text: string,
  attachment?: ChatAttachment | null,
): Promise<ChatSession | null> {
  if (!enabled()) return null;
  return apiClient<ChatSession>(
    `/api/support/chat/sessions/${encodeURIComponent(sessionId)}/messages`,
    {
      method: "POST",
      body: JSON.stringify({
        text,
        senderName: "مشتری",
        attachment: attachment ?? null,
      }),
    },
  );
}

export async function uploadChatAttachment(
  sessionId: string,
  file: File,
): Promise<ChatAttachment> {
  const base = siteConfig.apiBaseUrl.replace(/\/$/, "");
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(
    `${base}/api/support/chat/sessions/${encodeURIComponent(sessionId)}/attachments`,
    {
      method: "POST",
      body: form,
      cache: "no-store",
    },
  );
  if (!response.ok) {
    let message = "آپلود ناموفق بود";
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload?.error) message = payload.error;
    } catch {
      // keep default
    }
    throw new Error(message);
  }
  return response.json() as Promise<ChatAttachment>;
}

export async function listOnlineAgents(): Promise<ChatAgent[]> {
  if (!enabled()) return [];
  try {
    return await apiClient<ChatAgent[]>("/api/support/agents", {
      query: { onlineOnly: true },
    });
  } catch {
    return [];
  }
}

export async function registerSupportAgent(
  displayName: string,
  agentId?: string,
): Promise<ChatAgent> {
  const agent = await apiClient<ChatAgent>("/api/support/agents/register", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ displayName, agentId: agentId ?? null }),
  });
  storeAgent(agent);
  return agent;
}

export async function heartbeatSupportAgent(
  agentId: string,
): Promise<ChatAgent | null> {
  try {
    const agent = await apiClient<ChatAgent>(
      `/api/support/agents/${encodeURIComponent(agentId)}/heartbeat`,
      { method: "POST", auth: true },
    );
    storeAgent(agent);
    return agent;
  } catch {
    return null;
  }
}

export async function listAdminChatSessions(): Promise<ChatSession[]> {
  if (!enabled()) return [];
  try {
    return await apiClient<ChatSession[]>("/api/admin/support/chat/sessions", {
      auth: true,
    });
  } catch {
    return [];
  }
}

export async function claimChatSession(
  sessionId: string,
  agentId: string,
): Promise<ChatSession | null> {
  return apiClient<ChatSession>(
    `/api/admin/support/chat/sessions/${encodeURIComponent(sessionId)}/claim`,
    {
      method: "POST",
      auth: true,
      body: JSON.stringify({ agentId }),
    },
  );
}

export async function sendAgentMessage(
  sessionId: string,
  agentId: string,
  text: string,
): Promise<ChatSession | null> {
  return apiClient<ChatSession>(
    `/api/admin/support/chat/sessions/${encodeURIComponent(sessionId)}/messages`,
    {
      method: "POST",
      auth: true,
      body: JSON.stringify({ agentId, text }),
    },
  );
}

export async function closeChatSession(
  sessionId: string,
): Promise<ChatSession | null> {
  return apiClient<ChatSession>(
    `/api/admin/support/chat/sessions/${encodeURIComponent(sessionId)}/close`,
    {
      method: "POST",
      auth: true,
    },
  );
}
