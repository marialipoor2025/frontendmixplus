"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  registerSeller,
  tryGetSellerMe,
  type SellerMe,
} from "@/lib/api/seller";
import { getAccessToken, getSessionUser } from "@/lib/auth/session";
import { useAuth } from "@/lib/auth/useAuth";

export function RequireSeller({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, ready } = useAuth();
  const [seller, setSeller] = useState<SellerMe | null>(null);
  const [needsRegister, setNeedsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [shopName, setShopName] = useState("");
  const [registering, setRegistering] = useState(false);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (!ready) return;

    if (!isAuthenticated || !getAccessToken()) {
      checkedRef.current = false;
      setSeller(null);
      setNeedsRegister(false);
      setLoading(false);
      router.replace("/seller/login?returnUrl=/seller/dashboard");
      return;
    }

    // Avoid re-fetch loops when auth `user` object identity changes after /api/auth/me.
    if (checkedRef.current && (seller || needsRegister || error)) {
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
          setNeedsRegister(false);
          setError(null);
          return;
        }

        setSeller(null);
        setNeedsRegister(true);
        setError(null);
        const sessionUser = getSessionUser();
        const hint =
          sessionUser?.displayName?.replace(/\*/g, "").trim() ||
          sessionUser?.phone ||
          sessionUser?.email ||
          "";
        if (hint && hint.length >= 2) {
          setShopName((prev) => prev || `فروشگاه ${hint}`);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        checkedRef.current = false;
        const message =
          err instanceof Error ? err.message : "دسترسی فروشنده تأیید نشد";
        setSeller(null);
        setNeedsRegister(false);
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // Intentionally omit router/user — unstable identities caused an infinite loading loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- gate only on auth readiness
  }, [ready, isAuthenticated]);

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    const name = shopName.trim();
    if (name.length < 2) {
      setError("نام فروشگاه را وارد کنید");
      return;
    }

    setRegistering(true);
    setError(null);
    try {
      const me = await registerSeller(name);
      setSeller(me);
      setNeedsRegister(false);
      checkedRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "ثبت فروشگاه ناموفق بود");
    } finally {
      setRegistering(false);
    }
  }

  if (!ready || loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-[var(--color-muted)]">
        در حال بررسی دسترسی فروشنده…
      </div>
    );
  }

  if (needsRegister) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-base font-bold text-[var(--color-neutral-900)]">
          ثبت فروشگاه در میکس‌پلاس
        </p>
        <p className="text-sm leading-7 text-[var(--color-muted)]">
          با همین حساب (موبایل یا ایمیل) فروشگاه خود را بسازید و محصولات را اضافه
          کنید. هر فروشنده‌ای می‌تواند ثبت‌نام کند.
        </p>
        <form
          onSubmit={(e) => void handleRegister(e)}
          className="mt-2 w-full space-y-3 text-start"
        >
          <label className="block text-xs text-[var(--color-neutral-500)]">
            نام فروشگاه
            <input
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              disabled={registering}
              dir="rtl"
              lang="fa"
              autoComplete="organization"
              className="mt-1 w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2.5 text-sm"
              placeholder="مثلاً فروشگاه لوازم خانگی آریا"
              autoFocus
            />
          </label>
          {error ? (
            <p className="text-sm text-[var(--color-hint-object-error)]">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={registering}
            className="flex h-11 w-full items-center justify-center rounded-lg bg-[var(--color-primary)] text-sm font-medium text-white disabled:opacity-60"
          >
            {registering ? "در حال ثبت…" : "ایجاد فروشگاه و ورود به پنل"}
          </button>
        </form>
        <Link
          href="/seller/login"
          className="text-xs text-[var(--color-secondary-500)]"
        >
          ورود با حساب دیگر
        </Link>
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
