"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState, type FormEvent } from "react";
import { siteConfig } from "@/config/site";
import { getAdminStaffMe } from "@/lib/api/admin/staff";
import { resendOtp, startOtp, verifyOtp } from "@/lib/api/auth";
import { saveAdminSession } from "@/lib/admin/session";
import { saveSession } from "@/lib/auth/session";

type Step = "username" | "otp";
type LoginMode = "customer" | "seller" | "admin";

function isLikelyUsername(value: string) {
  const v = value.trim();
  if (!v) return false;
  const compact = v.replace(/[\s-]/g, "");
  const mobile = /^(?:\+98|0)?9\d{9}$/.test(compact);
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  return mobile || email;
}

/** Only allow same-origin relative paths (blocks open redirects). */
function safeReturnUrl(raw: string | null): string | null {
  if (!raw) return null;
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }
  if (!decoded.startsWith("/") || decoded.startsWith("//")) return null;
  return decoded;
}

type LoginFormCardProps = {
  /** Used when `returnUrl` query is absent (e.g. seller portal login). */
  defaultReturnUrl?: string;
  /** customer / seller share storefront session; admin also resolves staff role. */
  mode?: LoginMode;
  title?: string;
  subtitle?: string;
};

/**
 * Shared OTP auth card for customer, seller, and admin (Identity + Melipayamak).
 */
export function LoginFormCard({
  defaultReturnUrl,
  mode = "customer",
  title,
  subtitle,
}: LoginFormCardProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const usernameId = useId();
  const codeId = useId();
  const returnUrl =
    safeReturnUrl(searchParams.get("returnUrl")) ??
    safeReturnUrl(defaultReturnUrl ?? null);

  const [step, setStep] = useState<Step>("username");
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [masked, setMasked] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [resendIn]);

  async function handleUsernameSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = username.trim();

    if (!value) {
      setError("لطفاً این قسمت را خالی نگذارید");
      return;
    }
    if (!isLikelyUsername(value)) {
      setError("شماره موبایل یا ایمیل وارد شده صحیح نیست");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const result = await startOtp(value);
      setChallengeId(result.challengeId);
      setMasked(result.maskedDestination);
      setDevCode(result.devCode ?? null);
      setResendIn(result.resendAvailableInSeconds || 60);
      setCode("");
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOtpSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!challengeId) return;

    const trimmed = code.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      setError("کد باید ۶ رقم باشد");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const result = await verifyOtp(challengeId, trimmed);
      saveSession(result.accessToken, result.user);

      if (mode === "admin") {
        const staff = await getAdminStaffMe(result.accessToken);
        saveAdminSession(result.accessToken, staff);
        router.replace(returnUrl ?? "/admin");
      } else if (mode === "seller") {
        router.replace(returnUrl ?? "/seller/dashboard");
      } else {
        router.replace(returnUrl ?? "/profile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (!challengeId || resendIn > 0 || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const result = await resendOtp(challengeId);
      setChallengeId(result.challengeId);
      setMasked(result.maskedDestination);
      setDevCode(result.devCode ?? null);
      setResendIn(result.resendAvailableInSeconds || 60);
      setCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  }

  const backHref = step === "otp" ? undefined : "/";

  return (
    <div className="w-full max-w-[420px] rounded-2xl border border-[#e0e0e2] bg-white px-5 py-6 font-sans sm:px-8 sm:py-8">
      <header className="relative mb-8 flex min-h-10 items-center justify-center">
        {step === "otp" ? (
          <button
            type="button"
            aria-label="بازگشت"
            onClick={() => {
              setStep("username");
              setError(null);
              setCode("");
            }}
            className="absolute start-0 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center text-[#0c0c0c] transition hover:opacity-70"
          >
            <BackArrow />
          </button>
        ) : (
          <Link
            href={backHref!}
            aria-label="بازگشت"
            className="absolute start-0 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center text-[#0c0c0c] transition hover:opacity-70"
          >
            <BackArrow />
          </Link>
        )}

        <Link
          href="/"
          aria-label={`لوگوی ${siteConfig.nameFa}`}
          className="inline-flex items-center justify-center"
        >
          <Image
            src="/brand/mixplus-logo.svg"
            alt={siteConfig.name}
            width={148}
            height={40}
            priority
            className="h-9 w-auto object-contain sm:h-10"
          />
        </Link>
      </header>

      {step === "username" ? (
        <>
          <h1 className="text-base font-bold leading-8 text-[#0c0c0c] sm:text-[15px]">
            {title ?? `ورود یا ثبت‌نام در ${siteConfig.nameFa}`}
          </h1>
          <p className="mt-2 text-sm font-medium leading-7 text-[#81858b]">
            {subtitle ??
              (mode === "admin"
                ? "شماره موبایل مدیر را وارد کنید؛ کد یک‌بارمصرف پیامک می‌شود"
                : "لطفا شماره موبایل یا ایمیل خود را وارد کنید")}
          </p>

          <form className="mt-5" onSubmit={handleUsernameSubmit} noValidate>
            <GradientInputShell error={Boolean(error)}>
              <input
                id={usernameId}
                name="username"
                type="text"
                inputMode="email"
                autoComplete="username"
                autoFocus
                dir="rtl"
                value={username}
                disabled={submitting}
                placeholder="شماره موبایل یا پست الکترونیک"
                aria-invalid={Boolean(error)}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full rounded-[7px] bg-white px-3 py-3.5 text-sm font-medium text-[#0c0c0c] outline-none placeholder:text-[#a1a3a8] disabled:opacity-70"
              />
            </GradientInputShell>

            <ErrorText error={error} />

            <SubmitButton submitting={submitting}>
              {submitting ? "لطفاً صبر کنید…" : `ورود به ${siteConfig.nameFa}`}
            </SubmitButton>
          </form>
        </>
      ) : (
        <>
          <h1 className="text-base font-bold leading-8 text-[#0c0c0c] sm:text-[15px]">
            کد تایید را وارد کنید
          </h1>
          <p className="mt-2 text-sm font-medium leading-7 text-[#81858b]">
            کد ارسال‌شده به <span dir="ltr">{masked}</span> را وارد کنید
          </p>

          {devCode ? (
            <p className="mt-3 rounded-lg bg-[#f0f0f1] px-3 py-2 text-xs font-medium text-[#62666d]">
              حالت آزمایشی — کد:{" "}
              <span className="font-bold tracking-widest text-[#0c0c0c]" dir="ltr">
                {devCode}
              </span>
            </p>
          ) : null}

          <form className="mt-5" onSubmit={handleOtpSubmit} noValidate>
            <GradientInputShell error={Boolean(error)}>
              <input
                id={codeId}
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                dir="ltr"
                maxLength={6}
                value={code}
                disabled={submitting}
                placeholder="------"
                aria-invalid={Boolean(error)}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                  if (error) setError(null);
                }}
                className="w-full rounded-[7px] bg-white px-3 py-3.5 text-center text-lg font-bold tracking-[0.35em] text-[#0c0c0c] outline-none placeholder:tracking-[0.35em] placeholder:text-[#a1a3a8] disabled:opacity-70"
              />
            </GradientInputShell>

            <ErrorText error={error} />

            <SubmitButton submitting={submitting}>
              {submitting ? "لطفاً صبر کنید…" : "تایید"}
            </SubmitButton>
          </form>

          <button
            type="button"
            disabled={resendIn > 0 || submitting}
            onClick={handleResend}
            className="mt-4 w-full text-center text-xs font-medium text-[#19bfd3] disabled:text-[#a1a3a8]"
          >
            {resendIn > 0 ? `ارسال مجدد تا ${resendIn} ثانیه` : "ارسال مجدد کد"}
          </button>
        </>
      )}

      {step === "username" ? (
        <p className="mt-6 text-xs font-medium leading-6 text-[#81858b]">
          ورود شما به معنای پذیرش{" "}
          <Link href="/page/terms" className="text-[#19bfd3] hover:underline">
            شرایط {siteConfig.nameFa}
          </Link>{" "}
          و{" "}
          <Link href="/page/privacy" className="text-[#19bfd3] hover:underline">
            قوانین حریم‌خصوصی
          </Link>{" "}
          است
        </p>
      ) : null}
    </div>
  );
}

function BackArrow() {
  return (
    <svg aria-hidden width="24" height="24" viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient
          id="mixplusArrowGrad"
          x1="4"
          y1="12"
          x2="20"
          y2="12"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#1672dd" />
          <stop offset="100%" stopColor="#ed1944" />
        </linearGradient>
      </defs>
      {/* Full arrow with shaft/tail → (RTL back) */}
      <path
        d="M5 12h12.5M13 6.5 19.5 12 13 17.5"
        stroke="url(#mixplusArrowGrad)"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GradientInputShell({
  children,
  error,
}: {
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-lg p-px transition",
        error
          ? "bg-[#d32f2f]"
          : "bg-gradient-to-l from-[#1672dd] to-[#ed1944]",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function ErrorText({ error }: { error: string | null }) {
  return (
    <span className="mt-2 block min-h-5 text-xs font-medium text-[#b2001a]" aria-live="polite">
      {error}
    </span>
  );
}

function SubmitButton({
  children,
  submitting,
}: {
  children: React.ReactNode;
  submitting: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className="mt-1 flex w-full items-center justify-center rounded-lg bg-gradient-to-l from-[#1672dd] to-[#ed1944] px-4 py-3.5 text-sm font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {children}
    </button>
  );
}
