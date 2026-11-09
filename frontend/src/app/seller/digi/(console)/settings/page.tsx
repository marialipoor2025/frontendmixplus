"use client";

import { useEffect, useState } from "react";
import {
  DigiAlert,
  DigiBadge,
  DigiButton,
  DigiCard,
  DigiPageHeader,
  DigiSearchInput,
} from "@/components/seller/digi/digiUi";
import {
  getSellerMe,
  updateSellerProfile,
  type SellerMe,
} from "@/lib/api/seller";

export default function DigiSellerSettingsPage() {
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
      <p className="text-sm text-[var(--digi-muted)]">در حال بارگذاری…</p>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      <DigiPageHeader
        title="تنظیمات فروشگاه"
        description="نام و شناسه عمومی فروشگاه خود را برای نمایش به خریداران تنظیم کنید"
      />

      {error ? <DigiAlert>{error}</DigiAlert> : null}
      {notice ? <DigiAlert tone="info">{notice}</DigiAlert> : null}

      <DigiCard>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <DigiBadge tone={me?.isActive ? "success" : "warn"}>
            {me?.status || (me?.isActive ? "فعال" : "در انتظار")}
          </DigiBadge>
          {me?.id ? (
            <span className="text-[11px] text-[var(--digi-muted)]" dir="ltr">
              {me.id}
            </span>
          ) : null}
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-[var(--digi-text)]">
            نام فروشگاه
          </span>
          <DigiSearchInput
            className="!max-w-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثلاً میکس پلاس شاپ"
          />
        </label>

        <label className="mt-4 block space-y-1.5">
          <span className="text-xs font-medium text-[var(--digi-text)]">
            شناسه عمومی (slug)
          </span>
          <DigiSearchInput
            className="!max-w-none"
            dir="ltr"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="my-shop"
          />
        </label>

        <div className="mt-5 flex flex-wrap gap-2">
          <DigiButton disabled={busy || !name.trim()} onClick={() => void handleSave()}>
            {busy ? "در حال ذخیره…" : "ذخیره تغییرات"}
          </DigiButton>
        </div>
      </DigiCard>
    </div>
  );
}
