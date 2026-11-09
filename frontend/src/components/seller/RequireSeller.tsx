"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { tryGetSellerMe, type SellerMe } from "@/lib/api/seller";
import { getAccessToken } from "@/lib/auth/session";
import { useAuth } from "@/lib/auth/useAuth";

export function RequireSeller({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, ready } = useAuth();
  const [seller, setSeller] = useState<SellerMe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (!ready) return;

    if (!isAuthenticated || !getAccessToken()) {
      checkedRef.current = false;
      setSeller(null);
      setLoading(false);
      router.replace("/seller/login?returnUrl=/seller/dashboard");
      return;
    }

    if (checkedRef.current && (seller || error)) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    checkedRef.current = true;
    setLoading(true);

    void tryGetSellerMe()
      .then((me) => {
        if (cancelled) return;
        if (me) {
          setSeller(me);
          setError(null);
          return;
        }

        setSeller(null);
        setError(null);
        router.replace("/seller/onboarding");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        checkedRef.current = false;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- gate only on auth readiness
  }, [ready, isAuthenticated]);

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
        <div className="flex flex-wrap justify-center gap-2">
          <Link
            href="/seller/onboarding"
            className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white"
          >
            تکمیل ثبت‌نام فروشگاه
          </Link>
          <Link
            href="/seller/login"
            className="rounded-lg border border-[var(--color-neutral-200)] px-4 py-2 text-sm font-medium"
          >
            ورود مجدد
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
