"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { getSellerMe, type SellerMe } from "@/lib/api/seller";
import { getAccessToken } from "@/lib/auth/session";
import { useAuth } from "@/lib/auth/useAuth";

export function RequireSeller({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, ready } = useAuth();
  const [seller, setSeller] = useState<SellerMe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;

    if (!isAuthenticated || !getAccessToken()) {
      router.replace("/seller/login?returnUrl=/seller/dashboard");
      return;
    }

    let cancelled = false;
    setLoading(true);
    void getSellerMe()
      .then((me) => {
        if (!cancelled) {
          setSeller(me);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "دسترسی فروشنده تأیید نشد";
        setSeller(null);
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ready, isAuthenticated, router]);

  if (!ready || loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-[var(--color-muted)]">
        در حال بررسی دسترسی فروشنده…
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-base font-bold text-[var(--color-neutral-900)]">
          دسترسی پنل فروشنده
        </p>
        <p className="text-sm text-[var(--color-muted)]">
          {error ?? "حساب فروشنده برای این کاربر فعال نیست."}
        </p>
        <Link
          href="/seller/login"
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white"
        >
          ورود مجدد
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
