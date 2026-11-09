"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { registerSeller } from "@/lib/api/seller";

type SellerKind = "individual" | "company";

type StepId = "kind" | "shop" | "address" | "done";

const STEPS: {
  id: StepId;
  group: string;
  title: string;
}[] = [
  { id: "kind", group: "اطلاعات", title: "وضعیت فروشنده" },
  { id: "shop", group: "اطلاعات", title: "اطلاعات فروشگاه" },
  { id: "address", group: "آدرس", title: "آدرس فروشگاه" },
  { id: "done", group: "ورود به پنل", title: "ورود به پنل" },
];

export function SellerOnboarding({
  defaultShopName = "",
}: {
  defaultShopName?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<StepId>("kind");
  const [kind, setKind] = useState<SellerKind | null>(null);
  const [shopName, setShopName] = useState(defaultShopName);
  const [city, setCity] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  async function finishAndEnter(e?: FormEvent) {
    e?.preventDefault();
    const name = shopName.trim();
    if (name.length < 2) {
      setError("نام فروشگاه را وارد کنید");
      setStep("shop");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await registerSeller(name);
      setStep("done");
      router.replace("/seller/digi/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ثبت فروشگاه ناموفق بود");
      setStep("shop");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="mx-auto grid min-h-dvh max-w-[1100px] gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_240px] lg:py-10"
      dir="rtl"
      data-seller-onboarding
    >
      <main className="min-w-0">
        {step === "kind" ? (
          <section className="space-y-5">
            <h1 className="text-lg font-bold text-[var(--color-neutral-900)] lg:text-xl">
              وضعیت خود را انتخاب کنید
            </h1>
            <div className="grid gap-4 md:grid-cols-2">
              <KindCard
                title="فروشنده حقیقی"
                description="فرد حقیقی با مشخصات شخصی — مناسب فروشگاه‌های شخصی و کسب‌وکارهای کوچک بدون شرکت ثبت‌شده."
                selected={kind === "individual"}
                cta="فروشنده حقیقی هستم"
                onSelect={() => {
                  setKind("individual");
                  setStep("shop");
                }}
              />
              <KindCard
                title="فروشنده حقوقی"
                description="شرکت یا موسسه ثبت‌شده — مناسب برندها و فروشگاه‌هایی که شناسه حقوقی دارند."
                selected={kind === "company"}
                cta="فروشنده حقوقی هستم"
                onSelect={() => {
                  setKind("company");
                  setStep("shop");
                }}
              />
            </div>
          </section>
        ) : null}

        {step === "shop" ? (
          <section className="space-y-5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep("kind")}
                className="text-sm text-[var(--color-primary)]"
              >
                بازگشت
              </button>
              <h1 className="text-lg font-bold text-[var(--color-neutral-900)] lg:text-xl">
                لطفاً اطلاعات فروشگاه را وارد کنید
              </h1>
            </div>

            <div className="rounded-xl border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-4 py-3 text-sm leading-7 text-[var(--color-neutral-700)]">
              نام فروشگاه در صفحه محصول و لیست فروشندگان نمایش داده می‌شود. بعداً
              از تنظیمات قابل ویرایش است.
            </div>

            <form
              className="space-y-4 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4 lg:p-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (shopName.trim().length < 2) {
                  setError("نام فروشگاه الزامی است");
                  return;
                }
                setError(null);
                setStep("address");
              }}
            >
              <label className="block text-xs text-[var(--color-neutral-500)]">
                نام فروشگاه <span className="text-red-500">*</span>
                <input
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  dir="rtl"
                  lang="fa"
                  autoComplete="organization"
                  className="mt-1 w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2.5 text-sm"
                  placeholder="مثلاً فروشگاه لوازم خانگی آریا"
                  autoFocus
                />
              </label>
              <p className="text-xs text-[var(--color-muted)]">
                نوع انتخاب‌شده:{" "}
                {kind === "company" ? "فروشنده حقوقی" : "فروشنده حقیقی"}
              </p>
              {error ? (
                <p className="text-sm text-[var(--color-hint-object-error)]">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center rounded-lg bg-[var(--color-primary)] text-sm font-medium text-white sm:w-auto sm:px-8"
              >
                ادامه
              </button>
            </form>
          </section>
        ) : null}

        {step === "address" ? (
          <section className="space-y-5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep("shop")}
                className="text-sm text-[var(--color-primary)]"
              >
                بازگشت
              </button>
              <h1 className="text-lg font-bold text-[var(--color-neutral-900)] lg:text-xl">
                آدرس فروشگاه (اختیاری)
              </h1>
            </div>
            <form
              className="space-y-4 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4 lg:p-5"
              onSubmit={(e) => void finishAndEnter(e)}
            >
              <label className="block text-xs text-[var(--color-neutral-500)]">
                شهر
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2.5 text-sm"
                  placeholder="مثلاً تهران"
                />
              </label>
              <label className="block text-xs text-[var(--color-neutral-500)]">
                آدرس
                <textarea
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2.5 text-sm"
                  placeholder="آدرس محل فعالیت یا انبار (اختیاری در این فاز)"
                />
              </label>
              {error ? (
                <p className="text-sm text-[var(--color-hint-object-error)]">
                  {error}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-11 items-center justify-center rounded-lg bg-[var(--color-primary)] px-6 text-sm font-medium text-white disabled:opacity-60"
                >
                  {submitting ? "در حال ثبت…" : "ایجاد فروشگاه و ورود به پنل"}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => void finishAndEnter()}
                  className="flex h-11 items-center justify-center rounded-lg border border-[var(--color-neutral-200)] px-6 text-sm font-medium disabled:opacity-60"
                >
                  رد کردن آدرس و ادامه
                </button>
              </div>
            </form>
          </section>
        ) : null}

        {step === "done" ? (
          <p className="py-16 text-center text-sm text-[var(--color-muted)]">
            در حال ورود به پنل…
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3 text-xs text-[var(--color-secondary-500)]">
          <Link href="/seller/login">ورود با حساب دیگر</Link>
          <Link href="/sellers/join">راهنمای فروشنده شو</Link>
        </div>
      </main>

      <aside className="order-first lg:order-last">
        <nav
          aria-label="مراحل ثبت‌نام فروشنده"
          className="sticky top-4 rounded-xl border border-[var(--color-neutral-200)] bg-white p-3"
        >
          <p className="mb-3 px-2 text-[11px] font-medium text-[var(--color-muted)]">
            مسیر ثبت‌نام
          </p>
          <ol className="relative space-y-1 border-r border-[var(--color-neutral-100)] pr-3">
            {STEPS.map((item, index) => {
              const done = index < stepIndex;
              const active = item.id === step;
              const locked = index > stepIndex + (step === "kind" ? 1 : 0);
              return (
                <li key={item.id}>
                  <div
                    className={[
                      "rounded-lg px-3 py-2.5 transition",
                      active
                        ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                        : done
                          ? "text-[var(--color-neutral-800)]"
                          : "text-[var(--color-muted)]",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                          done
                            ? "bg-emerald-500 text-white"
                            : active
                              ? "bg-[var(--color-primary)] text-white"
                              : "bg-[var(--color-neutral-100)] text-[var(--color-muted)]",
                        ].join(" ")}
                        aria-hidden
                      >
                        {done ? "✓" : locked && !active ? "•" : index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] text-[var(--color-muted)]">
                          {item.group}
                        </p>
                        <p className="truncate text-xs font-medium">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
      </aside>
    </div>
  );
}

function KindCard({
  title,
  description,
  selected,
  cta,
  onSelect,
}: {
  title: string;
  description: string;
  selected: boolean;
  cta: string;
  onSelect: () => void;
}) {
  return (
    <article
      className={[
        "flex flex-col rounded-xl border bg-white p-4 transition lg:p-5",
        selected
          ? "border-[var(--color-primary)] shadow-sm"
          : "border-[var(--color-neutral-200)]",
      ].join(" ")}
    >
      <div className="mb-4 h-28 rounded-lg bg-gradient-to-br from-[var(--color-primary-soft)] to-[var(--color-neutral-50)]" />
      <h2 className="text-base font-bold text-[var(--color-neutral-900)]">
        {title}
      </h2>
      <p className="mt-2 flex-1 text-sm leading-7 text-[var(--color-muted)]">
        {description}
      </p>
      <button
        type="button"
        onClick={onSelect}
        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] text-sm font-medium text-white"
      >
        {cta}
        <span aria-hidden>‹</span>
      </button>
    </article>
  );
}
