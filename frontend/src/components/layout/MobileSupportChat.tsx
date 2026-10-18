"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import { getFooterSettings } from "@/lib/api/footer";
import {
  attachmentDisplayUrl,
  createChatSession,
  getChatSession,
  isVisitorSender,
  pollChatMessages,
  readStoredSessionId,
  sendVisitorMessage,
  storeSessionId,
  uploadChatAttachment,
  type ChatMessage,
  type ChatSession,
} from "@/lib/api/support-chat";

type MobileSupportChatProps = {
  open: boolean;
  onClose: () => void;
};

type View = "home" | "chat";

/**
 * RTL support chat: landing cards + live conversation (poll-based realtime).
 */
export function MobileSupportChat({ open, onClose }: MobileSupportChatProps) {
  const [view, setView] = useState<View>("home");
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hours, setHours] = useState(
    "از ساعت ۹ تا ۱۷ در روزهای کاری پاسخگوی شما هستیم",
  );
  const [phone, setPhone] = useState("۰۲۱-۶۱۹۳۰۰۰۰");
  const [phoneTel, setPhoneTel] = useState("+982161930000");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const lastStampRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    void getFooterSettings().then((settings) => {
      if (settings.headerHours) setHours(settings.headerHours);
      if (settings.headerPhone) setPhone(settings.headerPhone);
      if (settings.headerPhoneTel) setPhoneTel(settings.headerPhoneTel);
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const existing = readStoredSessionId();
    if (!existing) return;
    void (async () => {
      const live = await getChatSession(existing);
      if (!live || String(live.status) === "Closed" || live.status === 2) {
        storeSessionId(null);
        return;
      }
      setSession(live);
      setMessages(live.messages ?? []);
      setView("chat");
      const last = live.messages?.[live.messages.length - 1];
      lastStampRef.current = last?.createdAtUtc;
    })();
  }, [open]);

  useEffect(() => {
    if (!open || view !== "chat" || !session) return;
    const timer = window.setInterval(() => {
      void (async () => {
        const poll = await pollChatMessages(session.id, lastStampRef.current);
        if (!poll?.messages?.length) return;
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          const next = [...prev];
          for (const msg of poll.messages) {
            if (!ids.has(msg.id)) next.push(msg);
          }
          return next;
        });
        const last = poll.messages[poll.messages.length - 1];
        if (last) lastStampRef.current = last.createdAtUtc;
        if (poll.agentName) {
          setSession((s) => (s ? { ...s, agentName: poll.agentName } : s));
        }
      })();
    }, 1500);
    return () => window.clearInterval(timer);
  }, [open, view, session]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, view]);

  async function startChat() {
    setBusy(true);
    setError(null);
    try {
      const created = await createChatSession();
      if (!created) {
        setError("گفتگو در حالت آزمایشی در دسترس نیست");
        return;
      }
      setSession(created);
      setMessages(created.messages ?? []);
      lastStampRef.current =
        created.messages?.[created.messages.length - 1]?.createdAtUtc;
      setView("chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "شروع گفتگو ناموفق بود");
    } finally {
      setBusy(false);
    }
  }

  async function handleSend(attachment?: Awaited<
    ReturnType<typeof uploadChatAttachment>
  > | null) {
    if (!session) return;
    const text = draft.trim();
    if (!text && !attachment) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await sendVisitorMessage(session.id, text, attachment);
      if (updated) {
        setSession(updated);
        setMessages(updated.messages ?? []);
        const last = updated.messages?.[updated.messages.length - 1];
        if (last) lastStampRef.current = last.createdAtUtc;
      }
      setDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ارسال ناموفق بود");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" dir="rtl">
      <button
        type="button"
        aria-label="بستن"
        className="absolute inset-0 bg-black/35 lg:bg-black/20"
        onClick={onClose}
      />

      <div className="absolute inset-x-0 bottom-0 top-0 flex h-full max-h-full w-full flex-col overflow-hidden bg-white shadow-sm transition-all duration-200 lg:inset-auto lg:bottom-7 lg:end-7 lg:start-auto lg:top-auto lg:h-[39.5rem] lg:max-h-[calc(100vh-3.5rem)] lg:w-[360px] lg:rounded-2xl">
        <div className="shrink-0 bg-gradient-to-l from-[#5eb8f0] to-[var(--color-primary)] text-white">
          <div className="flex items-center justify-between gap-3 p-4">
            <button
              type="button"
              onClick={() => {
                if (view === "chat") setView("home");
                else onClose();
              }}
              className="cursor-pointer rounded-full p-1 transition hover:bg-blue-700/40"
              aria-label={view === "chat" ? "بازگشت" : "بستن گفتگو"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                {view === "chat" ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                )}
              </svg>
            </button>
            <Image
              src="/brand/mixplus-logo.svg"
              alt={siteConfig.nameFa}
              width={96}
              height={30}
              className="brightness-0 invert"
            />
            <span className="w-6" />
          </div>
          <div className="space-y-1 px-5 pb-4 text-xs font-medium sm:text-sm">
            <p>{hours}</p>
            <p>
              <span>شماره تماس: </span>
              <a
                href={`tel:${phoneTel}`}
                className="underline-offset-2 hover:underline"
                dir="ltr"
              >
                {phone}
              </a>
            </p>
          </div>
        </div>

        {view === "home" ? (
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-[var(--color-neutral-50)] p-4">
            <div className="rounded-xl bg-white p-4 text-sm shadow-sm">
              <h4 className="mb-1 font-bold text-[var(--color-neutral-900)]">
                استعلام قیمت برای شرکت و همکاران
              </h4>
              <p className="mb-4 text-[var(--color-muted)]">
                ارسال لیست کالاها جهت اعلام قیمت
              </p>
              <Link
                href="/enquiry"
                className="ms-auto inline-flex items-center justify-center gap-1 rounded-3xl border-2 border-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white"
                onClick={onClose}
              >
                درخواست پیش فاکتور
              </Link>
            </div>

            <div className="rounded-xl bg-white p-4 text-sm shadow-sm">
              <h4 className="mb-1 font-bold text-[var(--color-neutral-900)]">
                ارتباط با کارشناسان {siteConfig.nameFa}
              </h4>
              <p className="mb-3 text-[var(--color-muted)]">
                گفتگوی زنده با پشتیبانی — پیام و فایل بفرستید
              </p>
              <div className="mb-3 flex gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f4fc] text-sm font-bold text-[#1672dd]">
                  م
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fde8ee] text-sm font-bold text-[var(--color-primary)]">
                  پ
                </span>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => void startChat()}
                className="ms-auto inline-flex items-center justify-center gap-2 rounded-3xl bg-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
              >
                {busy ? "…" : "شروع گفتگو"}
              </button>
            </div>
            {error ? (
              <p className="text-xs text-[var(--dk-text-error)]">{error}</p>
            ) : null}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-[var(--color-neutral-100)] px-4 py-2 text-xs text-[var(--color-muted)]">
              <span>
                {session?.agentName
                  ? `کارشناس: ${session.agentName}`
                  : "در انتظار کارشناس / پاسخ خودکار"}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto bg-[var(--color-neutral-50)] px-3 py-3">
              {messages.map((msg) => {
                const mine = isVisitorSender(msg.sender);
                return (
                  <div
                    key={msg.id}
                    className={`flex max-w-[85%] flex-col gap-1 rounded-2xl px-3 py-2 text-sm leading-6 shadow-sm ${
                      mine
                        ? "self-end rounded-be-md bg-[var(--color-primary)] text-white"
                        : "self-start rounded-bs-md bg-white text-[var(--color-neutral-800)]"
                    }`}
                  >
                    {!mine ? (
                      <span className="text-[10px] font-bold opacity-70">
                        {msg.senderName}
                      </span>
                    ) : null}
                    {msg.text ? <p className="whitespace-pre-wrap">{msg.text}</p> : null}
                    {msg.attachment ? (
                      <a
                        href={attachmentDisplayUrl(msg.attachment)}
                        target="_blank"
                        rel="noreferrer"
                        className={`text-xs underline ${mine ? "text-white" : "text-[var(--color-secondary-700)]"}`}
                      >
                        {msg.attachment.fileName}
                      </a>
                    ) : null}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <form
              className="flex shrink-0 items-end gap-2 border-t border-[var(--color-neutral-100)] bg-white p-3"
              onSubmit={(e) => {
                e.preventDefault();
                void handleSend();
              }}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*,.pdf,.txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file || !session) return;
                  void (async () => {
                    setBusy(true);
                    setError(null);
                    try {
                      const uploaded = await uploadChatAttachment(
                        session.id,
                        file,
                      );
                      await handleSend(uploaded);
                    } catch (err) {
                      setError(
                        err instanceof Error ? err.message : "آپلود ناموفق",
                      );
                      setBusy(false);
                    }
                  })();
                }}
              />
              <button
                type="button"
                disabled={busy || !session}
                onClick={() => fileRef.current?.click()}
                className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-neutral-200)] text-[var(--color-neutral-600)] disabled:opacity-50"
                aria-label="پیوست"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.44 11.05l-8.49 8.49a5.5 5.5 0 01-7.78-7.78l8.49-8.49a3.5 3.5 0 014.95 4.95l-8.49 8.49a1.5 1.5 0 01-2.12-2.12l7.78-7.78"
                  />
                </svg>
              </button>
              <textarea
                rows={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="پیام خود را بنویسید…"
                className="max-h-28 min-h-10 flex-1 resize-none rounded-xl border border-[var(--color-neutral-200)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
              />
              <button
                type="submit"
                disabled={busy || !draft.trim()}
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-white disabled:opacity-50"
                aria-label="ارسال"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"
                  />
                </svg>
              </button>
            </form>
            {error ? (
              <p className="px-3 pb-2 text-xs text-[var(--dk-text-error)]">
                {error}
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
