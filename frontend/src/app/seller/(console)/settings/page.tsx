"use client";

import { useEffect, useState } from "react";
import {
  AdminButton,
  AdminOutlineButton,
} from "@/components/admin/AdminUi";
import {
  getSellerMe,
  updateSellerProfile,
  type SellerMe,
} from "@/lib/api/seller";

export default function SellerSettingsPage() {
  const [me, setMe] = useState<SellerMe | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const row = await getSellerMe();
        if (cancelled) return;
        setMe(row);
        setName(row.name);
        setSlug(row.slug ?? "");
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "بارگذاری ناموفق بود");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    setBusy(true);
    setNotice(null);
    setError(null);
    try {
      const saved = await updateSellerProfile({
        name: name.trim(),
        slug: slug.trim() || undefined,
      });
      setMe(saved);
      setName(saved.name);
      setSlug(saved.slug ?? "");
      setNotice("اطلاعات فروشگاه ذخیره شد");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره ناموفق بود");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-[var(--color-muted)]">در حال بارگذاری…</p>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <h1 className="text-lg font-bold text-[var(--color-neutral-900)]">
          تنظیمات فروشگاه
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          نام و شناسه عمومی فروشگاه خود را ویرایش کنید
        </p>
      </div>

      <form
        className="max-w-lg space-y-4 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSave();
        }}
      >
        <label className="block space-y-1 text-sm">
          <span className="text-[var(--color-neutral-600)]">نام فروشگاه</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
            required
            minLength={2}
            maxLength={120}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-[var(--color-neutral-600)]">اسلاگ (اختیاری)</span>
          <input
            dir="ltr"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
            placeholder="my-shop"
          />
        </label>
        {me ? (
          <p className="text-xs text-[var(--color-muted)]">
            وضعیت: {me.isActive ? "فعال" : "غیرفعال"} · شناسه:{" "}
            <span dir="ltr">{me.id}</span>
          </p>
        ) : null}
        <div className="flex gap-2">
          <AdminButton type="submit" disabled={busy || name.trim().length < 2}>
            {busy ? "…" : "ذخیره"}
          </AdminButton>
          <AdminOutlineButton
            type="button"
            disabled={busy || !me}
            onClick={() => {
              if (!me) return;
              setName(me.name);
              setSlug(me.slug ?? "");
              setNotice(null);
              setError(null);
            }}
          >
            بازنشانی
          </AdminOutlineButton>
        </div>
        {notice ? (
          <p className="text-xs text-[var(--color-success)]">{notice}</p>
        ) : null}
        {error ? (
          <p className="text-xs text-[var(--dk-text-error)]">{error}</p>
        ) : null}
      </form>
    </div>
  );
}
