"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState, type FormEvent } from "react";
import { siteConfig } from "@/config/site";
import { getAdminStaffMe } from "@/lib/api/admin/staff";
import {
  confirmForgotPassword,
  loginWithPassword,
  resendOtp,
  startForgotPassword,
  startOtp,
  verifyOtp,
} from "@/lib/api/auth";
import { saveAdminSession } from "@/lib/admin/session";
import { saveSession } from "@/lib/auth/session";
import type { VerifyOtpResponse } from "@/types/auth";

type Step =
  | "username"
  | "method"
  | "otp"
  | "password"
  | "forgot-otp"
  | "forgot-password";
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
 * Shared auth card: OTP or password login + forgot-password (Identity).
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
  const passwordId = useId();
  const newPasswordId = useId();
  const returnUrl =
    safeReturnUrl(searchParams.get("returnUrl")) ??
    safeReturnUrl(defaultReturnUrl ?? null);

  const [step, setStep] = useState<Step>("username");
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
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

  async function finishLogin(result: VerifyOtpResponse) {
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
  }

  function validateUsername(): string | null {
    const value = username.trim();
    if (!value) return "لطفاً این قسمت را خالی نگذارید";
    if (!isLikelyUsername(value)) return "شماره موبایل یا ایمیل وارد شده صحیح نیست";
    return null;
  }

  function handleUsernameSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const err = validateUsername();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep("method");
  }

  async function beginOtpLogin() {
    const err = validateUsername();
    if (err) {
      setError(err);
      setStep("username");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const result = await startOtp(username.trim());
      setChallengeId(result.challengeId);
      setMasked(result.maskedDestination);
      setDevCode(result.devCode ?? null);
      setResendIn(result.resendAvailableInSeconds || 60);
      setCode("");
      setStep("otp");
    } catch (e) {
      setError(e instanceof Error ? e.message : "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.");
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
      await finishLogin(await verifyOtp(challengeId, trimmed));
    } catch (err) {
      setError(err instanceof Error ? err.message : "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password.length < 6) {
      setError("رمز عبور باید حداقل ۶ کاراکتر باشد");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await finishLogin(await loginWithPassword(username.trim(), password));
    } catch (err) {
      setError(err instanceof Error ? err.message : "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  }

  async function beginForgotPassword() {
    const err = validateUsername();
    if (err) {
      setError(err);
      setStep("username");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const result = await startForgotPassword(username.trim());
      setChallengeId(result.challengeId);
      setMasked(result.maskedDestination);
      setDevCode(result.devCode ?? null);
      setResendIn(result.resendAvailableInSeconds || 60);
      setCode("");
      setNewPassword("");
      setStep("forgot-otp");
    } catch (e) {
      setError(e instanceof Error ? e.message : "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleForgotOtpContinue(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      setError("کد باید ۶ رقم باشد");
      return;
    }
    setError(null);
    setStep("forgot-password");
  }

  async function handleForgotPasswordConfirm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!challengeId) return;
    if (newPassword.length < 6) {
      setError("رمز عبور جدید باید حداقل ۶ کاراکتر باشد");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await finishLogin(
        await confirmForgotPassword(challengeId, code.trim(), newPassword),
      );
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
      const result =
        step === "forgot-otp" || step === "forgot-password"
          ? await startForgotPassword(username.trim())
          : await resendOtp(challengeId);
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

  function goBack() {
    setError(null);
    if (step === "method") {
      setStep("username");
      return;
    }
    if (step === "otp" || step === "password") {
      setStep("method");
      setCode("");
      setPassword("");
      return;
    }
    if (step === "forgot-otp") {
      setStep("password");
      setCode("");
      return;
    }
    if (step === "forgot-password") {
      setStep("forgot-otp");
      setNewPassword("");
    }
  }

  const showBack = step !== "username";

  return (
    <div className="w-full max-w-[420px] rounded-2xl border border-[#e0e0e2] bg-white px-5 py-6 font-sans sm:px-8 sm:py-8">
      <header className="relative mb-8 flex min-h-10 items-center justify-center">
        {showBack ? (
          <button
            type="button"
            aria-label="بازگشت"
            onClick={goBack}
            className="absolute start-0 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center text-[#0c0c0c] transition hover:opacity-70"
          >
            <BackArrow />
          </button>
        ) : (
          <Link
            href="/"
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
                ? "شماره موبایل مدیر را وارد کنید"
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
            <SubmitButton submitting={submitting}>ادامه</SubmitButton>
          </form>
        </>
      ) : null}

      {step === "method" ? (
        <>
          <h1 className="text-base font-bold leading-8 text-[#0c0c0c] sm:text-[15px]">
            نحوه ورود را انتخاب کنید
          </h1>
          <p className="mt-2 text-sm font-medium leading-7 text-[#81858b]">
            ورود برای <span dir="ltr">{username.trim()}</span>
          </p>
          <div className="mt-5 space-y-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => void beginOtpLogin()}
              className="flex w-full items-center justify-center rounded-lg bg-gradient-to-l from-[#1672dd] to-[#ed1944] px-4 py-3.5 text-sm font-bold text-white transition hover:brightness-105 disabled:opacity-70"
            >
              {submitting ? "لطفاً صبر کنید…" : "ورود با کد یک‌بارمصرف"}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                setError(null);
                setPassword("");
                setStep("password");
              }}
              className="flex w-full items-center justify-center rounded-lg border border-[#e0e0e2] bg-white px-4 py-3.5 text-sm font-bold text-[#0c0c0c] transition hover:bg-[#f5f5f5] disabled:opacity-70"
            >
              ورود با رمز عبور
            </button>
          </div>
          <ErrorText error={error} />
        </>
      ) : null}

      {step === "otp" ? (
        <>
          <h1 className="text-base font-bold leading-8 text-[#0c0c0c] sm:text-[15px]">
            کد تایید را وارد کنید
          </h1>
          <p className="mt-2 text-sm font-medium leading-7 text-[#81858b]">
            کد ارسال‌شده به <span dir="ltr">{masked}</span> را وارد کنید
          </p>
          {devCode ? <DevCodeBanner code={devCode} /> : null}
          <form className="mt-5" onSubmit={handleOtpSubmit} noValidate>
            <OtpInput
              id={codeId}
              value={code}
              error={Boolean(error)}
              disabled={submitting}
              onChange={(v) => {
                setCode(v);
                if (error) setError(null);
              }}
            />
            <ErrorText error={error} />
            <SubmitButton submitting={submitting}>
              {submitting ? "لطفاً صبر کنید…" : "تایید"}
            </SubmitButton>
          </form>
          <ResendButton
            resendIn={resendIn}
            submitting={submitting}
            onClick={() => void handleResend()}
          />
        </>
      ) : null}

      {step === "password" ? (
        <>
          <h1 className="text-base font-bold leading-8 text-[#0c0c0c] sm:text-[15px]">
            رمز عبور را وارد کنید
          </h1>
          <p className="mt-2 text-sm font-medium leading-7 text-[#81858b]">
            ورود با رمز برای <span dir="ltr">{username.trim()}</span>
          </p>
          <form className="mt-5" onSubmit={handlePasswordSubmit} noValidate>
            <GradientInputShell error={Boolean(error)}>
              <input
                id={passwordId}
                name="password"
                type="password"
                autoComplete="current-password"
                autoFocus
                dir="ltr"
                value={password}
                disabled={submitting}
                placeholder="رمز عبور"
                aria-invalid={Boolean(error)}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full rounded-[7px] bg-white px-3 py-3.5 text-sm font-medium text-[#0c0c0c] outline-none placeholder:text-[#a1a3a8] disabled:opacity-70"
              />
            </GradientInputShell>
            <ErrorText error={error} />
            <SubmitButton submitting={submitting}>
              {submitting ? "لطفاً صبر کنید…" : "ورود"}
            </SubmitButton>
          </form>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void beginForgotPassword()}
            className="mt-4 w-full text-center text-xs font-medium text-[#19bfd3] disabled:text-[#a1a3a8]"
          >
            فراموشی رمز عبور
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void beginOtpLogin()}
            className="mt-2 w-full text-center text-xs font-medium text-[#81858b] hover:text-[#19bfd3] disabled:text-[#a1a3a8]"
          >
            ورود با کد یک‌بارمصرف
          </button>
        </>
      ) : null}

      {step === "forgot-otp" ? (
        <>
          <h1 className="text-base font-bold leading-8 text-[#0c0c0c] sm:text-[15px]">
            بازیابی رمز عبور
          </h1>
          <p className="mt-2 text-sm font-medium leading-7 text-[#81858b]">
            کد ارسال‌شده به <span dir="ltr">{masked}</span> را وارد کنید
          </p>
          {devCode ? <DevCodeBanner code={devCode} /> : null}
          <form className="mt-5" onSubmit={handleForgotOtpContinue} noValidate>
            <OtpInput
              id={codeId}
              value={code}
              error={Boolean(error)}
              disabled={submitting}
              onChange={(v) => {
                setCode(v);
                if (error) setError(null);
              }}
            />
            <ErrorText error={error} />
            <SubmitButton submitting={submitting}>ادامه</SubmitButton>
          </form>
          <ResendButton
            resendIn={resendIn}
            submitting={submitting}
            onClick={() => void handleResend()}
          />
        </>
      ) : null}

      {step === "forgot-password" ? (
        <>
          <h1 className="text-base font-bold leading-8 text-[#0c0c0c] sm:text-[15px]">
            رمز عبور جدید را تنظیم کنید
          </h1>
          <p className="mt-2 text-sm font-medium leading-7 text-[#81858b]">
            حداقل ۶ کاراکتر
          </p>
          <form className="mt-5" onSubmit={handleForgotPasswordConfirm} noValidate>
            <GradientInputShell error={Boolean(error)}>
              <input
                id={newPasswordId}
                name="newPassword"
                type="password"
                autoComplete="new-password"
                autoFocus
                dir="ltr"
                value={newPassword}
                disabled={submitting}
                placeholder="رمز عبور جدید"
                aria-invalid={Boolean(error)}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full rounded-[7px] bg-white px-3 py-3.5 text-sm font-medium text-[#0c0c0c] outline-none placeholder:text-[#a1a3a8] disabled:opacity-70"
              />
            </GradientInputShell>
            <ErrorText error={error} />
            <SubmitButton submitting={submitting}>
              {submitting ? "لطفاً صبر کنید…" : "ثبت رمز و ورود"}
            </SubmitButton>
          </form>
        </>
      ) : null}

      {step === "username" || step === "method" ? (
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

function DevCodeBanner({ code }: { code: string }) {
  return (
    <p className="mt-3 rounded-lg bg-[#f0f0f1] px-3 py-2 text-xs font-medium text-[#62666d]">
      حالت آزمایشی — کد:{" "}
      <span className="font-bold tracking-widest text-[#0c0c0c]" dir="ltr">
        {code}
      </span>
    </p>
  );
}

function OtpInput({
  id,
  value,
  error,
  disabled,
  onChange,
}: {
  id: string;
  value: string;
  error: boolean;
  disabled: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <GradientInputShell error={error}>
      <input
        id={id}
        name="code"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        autoFocus
        dir="ltr"
        maxLength={6}
        value={value}
        disabled={disabled}
        placeholder="------"
        aria-invalid={error}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
        className="w-full rounded-[7px] bg-white px-3 py-3.5 text-center text-lg font-bold tracking-[0.35em] text-[#0c0c0c] outline-none placeholder:tracking-[0.35em] placeholder:text-[#a1a3a8] disabled:opacity-70"
      />
    </GradientInputShell>
  );
}

function ResendButton({
  resendIn,
  submitting,
  onClick,
}: {
  resendIn: number;
  submitting: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={resendIn > 0 || submitting}
      onClick={onClick}
      className="mt-4 w-full text-center text-xs font-medium text-[#19bfd3] disabled:text-[#a1a3a8]"
    >
      {resendIn > 0 ? `ارسال مجدد تا ${resendIn} ثانیه` : "ارسال مجدد کد"}
    </button>
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
