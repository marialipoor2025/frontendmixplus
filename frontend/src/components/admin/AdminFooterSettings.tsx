"use client";

import { useEffect, useState } from "react";
import {
  AdminButton,
  AdminCard,
  AdminOutlineButton,
} from "@/components/admin/AdminUi";
import {
  getAdminFooterSettings,
  saveAdminFooterSettings,
  type FooterSettings,
} from "@/lib/api/footer";

/**
 * Toggle trust seals + Digikala partner logos shown in the public footer.
 */
export function AdminFooterSettings() {
  const [settings, setSettings] = useState<FooterSettings | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getAdminFooterSettings()
      .then((s) => {
        if (!cancelled) setSettings(s);
      })
      .catch(() => {
        if (!cancelled) setError("بارگذاری تنظیمات فوتر ناموفق بود");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!settings) {
    return (
      <AdminCard>
        <p className="text-sm text-[var(--color-muted)]">
          {error ?? "در حال بارگذاری تنظیمات فوتر…"}
        </p>
      </AdminCard>
    );
  }

  return (
    <AdminCard>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-[var(--color-neutral-900)]">
            تماس، ساعات کاری و فوتر
          </h2>
          <p className="text-xs text-[var(--color-muted)]">
            تلفن و ساعات پشتیبانی، به‌همراه نماد اعتماد و لوگوهای همکار
          </p>
        </div>
        <AdminButton
          type="button"
          disabled={busy}
          onClick={() => {
            void (async () => {
              setBusy(true);
              setNotice(null);
              setError(null);
              try {
                const saved = await saveAdminFooterSettings(settings);
                setSettings(saved);
                setNotice("تنظیمات فوتر ذخیره شد");
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : "ذخیره ناموفق بود",
                );
              } finally {
                setBusy(false);
              }
            })();
          }}
        >
          {busy ? "…" : "ذخیره فوتر"}
        </AdminButton>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1 text-xs">
          <span className="font-bold text-[var(--color-neutral-700)]">
            تلفن اصلی فوتر
          </span>
          <input
            className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
            value={settings.phonePrimary}
            onChange={(e) =>
              setSettings((s) =>
                s ? { ...s, phonePrimary: e.target.value } : s,
              )
            }
          />
        </label>
        <label className="block space-y-1 text-xs">
          <span className="font-bold text-[var(--color-neutral-700)]">
            تلفن دوم فوتر
          </span>
          <input
            className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
            value={settings.phoneSecondary}
            onChange={(e) =>
              setSettings((s) =>
                s ? { ...s, phoneSecondary: e.target.value } : s,
              )
            }
          />
        </label>
        <label className="block space-y-1 text-xs sm:col-span-2">
          <span className="font-bold text-[var(--color-neutral-700)]">
            ساعات کاری / در دسترس بودن (فوتر)
          </span>
          <input
            className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
            value={settings.hoursLine}
            onChange={(e) =>
              setSettings((s) => (s ? { ...s, hoursLine: e.target.value } : s))
            }
          />
        </label>
        <label className="block space-y-1 text-xs sm:col-span-2">
          <span className="font-bold text-[var(--color-neutral-700)]">
            ساعات پشتیبانی (نوار بالای هدر)
          </span>
          <input
            className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
            value={settings.headerHours}
            onChange={(e) =>
              setSettings((s) =>
                s ? { ...s, headerHours: e.target.value } : s,
              )
            }
          />
        </label>
        <label className="block space-y-1 text-xs">
          <span className="font-bold text-[var(--color-neutral-700)]">
            تلفن هدر (نمایش)
          </span>
          <input
            className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
            value={settings.headerPhone}
            onChange={(e) =>
              setSettings((s) =>
                s ? { ...s, headerPhone: e.target.value } : s,
              )
            }
          />
        </label>
        <label className="block space-y-1 text-xs">
          <span className="font-bold text-[var(--color-neutral-700)]">
            لینک tel: هدر
          </span>
          <input
            dir="ltr"
            className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2 font-mono text-xs"
            value={settings.headerPhoneTel}
            onChange={(e) =>
              setSettings((s) =>
                s ? { ...s, headerPhoneTel: e.target.value } : s,
              )
            }
          />
        </label>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 text-sm">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.showTrustSeals}
            onChange={(e) =>
              setSettings((s) =>
                s ? { ...s, showTrustSeals: e.target.checked } : s,
              )
            }
          />
          نمایش نمادهای اعتماد
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.showPartners}
            onChange={(e) =>
              setSettings((s) =>
                s ? { ...s, showPartners: e.target.checked } : s,
              )
            }
          />
          نمایش نوار لوگوهای همکار
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-xs font-bold text-[var(--color-neutral-700)]">
            نمادهای اعتماد
          </h3>
          <ul className="space-y-2">
            {settings.trustSeals.map((seal, index) => (
              <li
                key={seal.src}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--color-neutral-100)] p-2 text-xs"
              >
                <label className="inline-flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={seal.visible}
                    onChange={(e) => {
                      const visible = e.target.checked;
                      setSettings((s) => {
                        if (!s) return s;
                        const trustSeals = s.trustSeals.map((row, i) =>
                          i === index ? { ...row, visible } : row,
                        );
                        return { ...s, trustSeals };
                      });
                    }}
                  />
                  نمایش
                </label>
                <input
                  className="min-w-0 grow rounded border border-[var(--color-neutral-200)] px-2 py-1"
                  value={seal.label}
                  onChange={(e) => {
                    const label = e.target.value;
                    setSettings((s) => {
                      if (!s) return s;
                      const trustSeals = s.trustSeals.map((row, i) =>
                        i === index ? { ...row, label } : row,
                      );
                      return { ...s, trustSeals };
                    });
                  }}
                />
                <input
                  dir="ltr"
                  className="min-w-0 grow rounded border border-[var(--color-neutral-200)] px-2 py-1"
                  value={seal.src}
                  onChange={(e) => {
                    const src = e.target.value;
                    setSettings((s) => {
                      if (!s) return s;
                      const trustSeals = s.trustSeals.map((row, i) =>
                        i === index ? { ...row, src } : row,
                      );
                      return { ...s, trustSeals };
                    });
                  }}
                />
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-bold text-[var(--color-neutral-700)]">
            لوگوهای همکار / دیجی‌کالا
          </h3>
          <ul className="space-y-2">
            {settings.partners.map((partner, index) => (
              <li
                key={partner.icon + index}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--color-neutral-100)] p-2 text-xs"
              >
                <label className="inline-flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={partner.visible}
                    onChange={(e) => {
                      const visible = e.target.checked;
                      setSettings((s) => {
                        if (!s) return s;
                        const partners = s.partners.map((row, i) =>
                          i === index ? { ...row, visible } : row,
                        );
                        return { ...s, partners };
                      });
                    }}
                  />
                  نمایش
                </label>
                <input
                  className="min-w-0 grow rounded border border-[var(--color-neutral-200)] px-2 py-1"
                  value={partner.label}
                  onChange={(e) => {
                    const label = e.target.value;
                    setSettings((s) => {
                      if (!s) return s;
                      const partners = s.partners.map((row, i) =>
                        i === index ? { ...row, label } : row,
                      );
                      return { ...s, partners };
                    });
                  }}
                />
                <AdminOutlineButton
                  type="button"
                  className="!px-2 !py-1"
                  onClick={() =>
                    setSettings((s) =>
                      s
                        ? {
                            ...s,
                            partners: s.partners.filter((_, i) => i !== index),
                          }
                        : s,
                    )
                  }
                >
                  حذف
                </AdminOutlineButton>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {notice ? (
        <p className="mt-3 text-xs text-[var(--color-success)]">{notice}</p>
      ) : null}
      {error ? (
        <p className="mt-3 text-xs text-[var(--dk-text-error)]">{error}</p>
      ) : null}
    </AdminCard>
  );
}
