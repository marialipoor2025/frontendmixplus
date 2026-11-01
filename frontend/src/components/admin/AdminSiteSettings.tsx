"use client";

import { useEffect, useState } from "react";
import { AdminButton } from "@/components/admin/AdminUi";
import {
  getSiteSettings,
  saveSiteSettings,
  type SiteSettings,
} from "@/lib/api/site-settings";

/**
 * Marketplace-wide site config (blog URL, domain, …) — not seller-scoped.
 */
export function AdminSiteSettings() {
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void getSiteSettings().then(setForm);
  }, []);

  if (!form) {
    return (
      <p className="text-sm text-[var(--color-muted)]">در حال بارگذاری تنظیمات…</p>
    );
  }

  return (
    <section className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-4">
      <h3 className="text-sm font-bold text-[var(--color-neutral-900)]">
        تنظیمات عمومی سایت
      </h3>
      <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
        تنظیمات سراسری مارکت‌پلیس (مستقل از فروشنده) — مثلاً آدرس بلاگ
        Mixplusshop.ir
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {(
          [
            ["siteName", "نام سایت"],
            ["siteUrl", "آدرس سایت"],
            ["blogUrl", "آدرس بلاگ / مجله"],
            ["supportEmail", "ایمیل پشتیبانی"],
            ["defaultCurrency", "واحد پول پیش‌فرض"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block space-y-1 text-sm">
            <span className="text-[var(--color-neutral-600)]">{label}</span>
            <input
              dir="ltr"
              value={form[key]}
              onChange={(e) =>
                setForm((p) => (p ? { ...p, [key]: e.target.value } : p))
              }
              className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
            />
          </label>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <AdminButton
          type="button"
          disabled={saving}
          onClick={() => {
            void (async () => {
              setSaving(true);
              setNotice(null);
              const saved = await saveSiteSettings(form);
              setSaving(false);
              if (saved) {
                setForm(saved);
                setNotice("ذخیره شد");
              } else {
                setNotice("ذخیره ناموفق بود");
              }
            })();
          }}
        >
          ذخیره تنظیمات سایت
        </AdminButton>
        {notice ? (
          <span className="text-xs text-[var(--color-neutral-600)]">{notice}</span>
        ) : null}
      </div>
    </section>
  );
}
