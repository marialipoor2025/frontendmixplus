"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AdminButton,
  AdminCard,
  AdminOutlineButton,
  AdminPageHeader,
} from "@/components/admin/AdminUi";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import {
  claimChatSession,
  closeChatSession,
  heartbeatSupportAgent,
  isVisitorSender,
  listAdminChatSessions,
  registerSupportAgent,
  readStoredAgent,
  sendAgentMessage,
  type ChatAgent,
  type ChatSession,
} from "@/lib/api/support-chat";

export default function AdminSupportChatPage() {
  const [agent, setAgent] = useState<ChatAgent | null>(null);
  const [name, setName] = useState("کارشناس پشتیبانی");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const active = useMemo(
    () => sessions.find((s) => s.id === activeId) ?? null,
    [sessions, activeId],
  );

  useEffect(() => {
    const stored = readStoredAgent();
    if (stored) {
      setAgent(stored);
      setName(stored.displayName);
    }
  }, []);

  useEffect(() => {
    if (!agent) return;
    const beat = window.setInterval(() => {
      void heartbeatSupportAgent(agent.id);
    }, 30_000);
    void heartbeatSupportAgent(agent.id);
    return () => window.clearInterval(beat);
  }, [agent]);

  useEffect(() => {
    if (!agent) return;
    const refresh = () => {
      void listAdminChatSessions().then((rows) => {
        setSessions(rows);
        if (activeId && !rows.some((r) => r.id === activeId)) {
          setActiveId(rows[0]?.id ?? null);
        } else if (!activeId && rows[0]) {
          setActiveId(rows[0].id);
        }
      });
    };
    refresh();
    const timer = window.setInterval(refresh, 2000);
    return () => window.clearInterval(timer);
  }, [agent, activeId]);

  return (
    <RequireAdmin permission="cms:manage">
      <AdminPageHeader
        title="گفتگوی پشتیبانی"
        description="ثبت به‌عنوان کارشناس آنلاین، پذیرش گفتگو و پاسخ زنده"
      />

      <AdminCard className="mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block min-w-[200px] grow space-y-1 text-sm">
            <span>نام نمایشی کارشناس</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
            />
          </label>
          <AdminButton
            type="button"
            onClick={() => {
              void (async () => {
                setError(null);
                try {
                  const registered = await registerSupportAgent(
                    name,
                    agent?.id,
                  );
                  setAgent(registered);
                  setNotice("شما آنلاین شدید و در رجیستری کارشناسان ثبت شدید");
                } catch (err) {
                  setError(
                    err instanceof Error ? err.message : "ثبت کارشناس ناموفق",
                  );
                }
              })();
            }}
          >
            {agent ? "بروزرسانی / آنلاین" : "ثبت به‌عنوان کارشناس"}
          </AdminButton>
          {agent ? (
            <span className="text-xs text-[var(--color-success)]">
              آنلاین — {agent.displayName}
            </span>
          ) : null}
        </div>
      </AdminCard>

      {!agent ? (
        <p className="text-sm text-[var(--color-muted)]">
          برای مشاهده و پاسخ به گفتگوها ابتدا به‌عنوان کارشناس ثبت شوید.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]" dir="rtl">
          <AdminCard padded={false}>
            <ul className="divide-y divide-[var(--color-neutral-100)]">
              {sessions.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-[var(--color-muted)]">
                  گفتگوی بازی نیست
                </li>
              ) : (
                sessions.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(s.id)}
                      className={`flex w-full flex-col gap-0.5 px-4 py-3 text-start text-sm ${
                        activeId === s.id
                          ? "bg-[var(--color-neutral-50)]"
                          : "hover:bg-[var(--color-neutral-50)]"
                      }`}
                    >
                      <span className="font-bold">
                        {s.visitorName || "مشتری"}
                      </span>
                      <span className="text-xs text-[var(--color-muted)]">
                        {s.agentName
                          ? `کارشناس: ${s.agentName}`
                          : "بدون کارشناس"}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </AdminCard>

          <AdminCard className="flex min-h-[420px] flex-col">
            {!active ? (
              <p className="text-sm text-[var(--color-muted)]">
                یک گفتگو را انتخاب کنید
              </p>
            ) : (
              <>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-neutral-100)] pb-3">
                  <div className="text-sm">
                    <p className="font-bold">
                      {active.visitorName || "مشتری"}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">
                      وضعیت: {String(active.status)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <AdminOutlineButton
                      type="button"
                      onClick={() => {
                        void claimChatSession(active.id, agent.id).then(
                          (updated) => {
                            if (updated) {
                              setSessions((prev) =>
                                prev.map((s) =>
                                  s.id === updated.id ? updated : s,
                                ),
                              );
                            }
                          },
                        );
                      }}
                    >
                      پذیرش
                    </AdminOutlineButton>
                    <AdminOutlineButton
                      type="button"
                      onClick={() => {
                        void closeChatSession(active.id).then((updated) => {
                          if (updated) {
                            setSessions((prev) =>
                              prev.filter((s) => s.id !== updated.id),
                            );
                            setActiveId(null);
                          }
                        });
                      }}
                    >
                      پایان
                    </AdminOutlineButton>
                  </div>
                </div>

                <div className="mb-3 flex max-h-[320px] flex-1 flex-col gap-2 overflow-y-auto rounded-lg bg-[var(--color-neutral-50)] p-3">
                  {(active.messages ?? []).map((msg) => {
                    const visitor = isVisitorSender(msg.sender);
                    return (
                      <div
                        key={msg.id}
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                          visitor
                            ? "self-start bg-white"
                            : "self-end bg-[var(--color-primary)] text-white"
                        }`}
                      >
                        <p className="mb-0.5 text-[10px] opacity-70">
                          {msg.senderName}
                        </p>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    );
                  })}
                </div>

                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!draft.trim()) return;
                    void (async () => {
                      const updated = await sendAgentMessage(
                        active.id,
                        agent.id,
                        draft.trim(),
                      );
                      if (updated) {
                        setSessions((prev) =>
                          prev.map((s) =>
                            s.id === updated.id ? updated : s,
                          ),
                        );
                        setDraft("");
                      }
                    })();
                  }}
                >
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="پاسخ کارشناس…"
                    className="min-w-0 flex-1 rounded-lg border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
                  />
                  <AdminButton type="submit">ارسال</AdminButton>
                </form>
              </>
            )}
          </AdminCard>
        </div>
      )}

      {notice ? (
        <p className="mt-3 text-xs text-[var(--color-success)]">{notice}</p>
      ) : null}
      {error ? (
        <p className="mt-3 text-xs text-[var(--dk-text-error)]">{error}</p>
      ) : null}
    </RequireAdmin>
  );
}
