"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AdminButton, AdminCard } from "@/components/admin/AdminUi";
import { loginAdmin, MOCK_ADMIN_ACCOUNTS } from "@/lib/admin/login";
import { ROLE_LABELS } from "@/lib/admin/permissions";
import { saveAdminSession } from "@/lib/admin/session";
import { useAdminAuth } from "@/lib/admin/useAdminAuth";

export function AdminLoginForm() {
  const router = useRouter();
  const { ready, isAuthenticated } = useAdminAuth();
  const [email, setEmail] = useState("admin@mixplus.ir");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && isAuthenticated) {
      router.replace("/admin");
    }
  }, [ready, isAuthenticated, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const session = await loginAdmin(email, password);
      saveAdminSession(session.accessToken, session.user);
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ورود ناموفق بود");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 inline-flex rounded-lg bg-gradient-to-l from-[#1672dd] to-[#ed1944] px-4 py-2 text-base font-black text-white">
          MixPlus
        </div>
        <h1 className="text-lg font-bold text-[var(--color-neutral-900)]">
          ورود به پنل مدیریت
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          دسترسی امن مدیران و نقش‌های عملیاتی
        </p>
      </div>

      <AdminCard>
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[var(--color-muted)]">
              ایمیل
            </span>
            <input
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-neutral-650)]"
              autoComplete="username"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[var(--color-muted)]">
              رمز عبور
            </span>
            <input
              type="password"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-neutral-650)]"
              autoComplete="current-password"
              required
            />
          </label>
          {error ? (
            <p className="text-xs font-medium text-[var(--dk-text-error)]">{error}</p>
          ) : null}
          <AdminButton type="submit" className="w-full" disabled={submitting}>
            {submitting ? "در حال ورود…" : "ورود به پنل"}
          </AdminButton>
        </form>
      </AdminCard>

      <div className="mt-4 rounded-xl border border-dashed border-[var(--color-border)] bg-white p-3 text-xs text-[var(--color-muted)]">
        <p className="mb-2 font-medium text-[var(--color-neutral-700)]">
          حساب‌های آزمایشی (موقت)
        </p>
        <ul className="space-y-1" dir="ltr">
          {MOCK_ADMIN_ACCOUNTS.map((a) => (
            <li key={a.email}>
              {a.email} / {a.password} — {ROLE_LABELS[a.role]}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
