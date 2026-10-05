"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AdminOutlineButton } from "@/components/admin/AdminUi";
import { pickVariantUrl, uploadMediaAsset } from "@/lib/api/media";
import type { ProductMediaItem } from "@/types/admin-product";

type Props = {
  items: ProductMediaItem[];
  onChange: (items: ProductMediaItem[]) => void;
};

/**
 * Multi-image gallery editor for admin product form.
 * First item is the primary card image; order = PDP gallery order.
 */
export function ProductMediaManager({ items, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      const next = [...items];
      for (const file of Array.from(files)) {
        const asset = await uploadMediaAsset(file);
        next.push({
          id: asset.id,
          url: pickVariantUrl(asset, "gallery") || pickVariantUrl(asset, "card"),
          thumbUrl: pickVariantUrl(asset, "thumb") || pickVariantUrl(asset, "card"),
          alt: asset.originalFileName,
          isPrimary: next.length === 0,
        });
      }
      if (next.length && !next.some((x) => x.isPrimary)) {
        next[0] = { ...next[0]!, isPrimary: true };
      }
      onChange(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "آپلود ناموفق بود");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function setPrimary(id: string) {
    const marked = items.map((item) => ({
      ...item,
      isPrimary: item.id === id,
    }));
    const primary = marked.find((x) => x.isPrimary);
    const rest = marked.filter((x) => !x.isPrimary);
    onChange(primary ? [primary, ...rest] : marked);
  }

  function move(id: string, dir: -1 | 1) {
    const index = items.findIndex((x) => x.id === id);
    if (index < 0) return;
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const [row] = next.splice(index, 1);
    next.splice(target, 0, row!);
    onChange(next);
  }

  function remove(id: string) {
    const next = items.filter((x) => x.id !== id);
    if (next.length && !next.some((x) => x.isPrimary)) {
      next[0] = { ...next[0]!, isPrimary: true };
    }
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-[var(--color-neutral-800)]">
            گالری تصاویر محصول
          </p>
          <p className="text-xs text-[var(--color-neutral-500)]">
            تصویر اول / اصلی روی کارت محصول نمایش داده می‌شود
          </p>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => void onFiles(e.target.files)}
          />
          <AdminOutlineButton
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? "آپلود…" : "افزودن تصویر"}
          </AdminOutlineButton>
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      {items.length === 0 ? (
        <button
          type="button"
          className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-neutral-300)] bg-[var(--color-neutral-50)] px-4 py-8 text-center"
          onClick={() => inputRef.current?.click()}
        >
          <span className="text-sm text-[var(--color-neutral-700)]">
            هنوز تصویری اضافه نشده
          </span>
          <span className="mt-1 text-xs text-[var(--color-neutral-500)]">
            JPG / PNG / WebP — نسخه‌های thumb/card/gallery خودکار ساخته می‌شوند
          </span>
        </button>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {items.map((item, index) => (
            <li
              key={item.id}
              className={[
                "flex gap-3 rounded-xl border bg-white p-2",
                item.isPrimary
                  ? "border-[var(--color-primary)]"
                  : "border-[var(--color-neutral-200)]",
              ].join(" ")}
            >
              <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-[var(--color-neutral-50)]">
                <Image
                  src={item.thumbUrl || item.url}
                  alt={item.alt}
                  fill
                  className="object-contain p-1"
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-xs font-medium text-[var(--color-neutral-800)]">
                    {item.alt}
                  </p>
                  {item.isPrimary ? (
                    <span className="shrink-0 rounded bg-[var(--color-primary-soft)] px-1.5 py-0.5 text-[10px] text-[var(--color-primary)]">
                      اصلی
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-1">
                  {!item.isPrimary ? (
                    <button
                      type="button"
                      className="rounded border border-[var(--color-neutral-200)] px-2 py-0.5 text-[10px] text-[var(--color-neutral-700)]"
                      onClick={() => setPrimary(item.id)}
                    >
                      اصلی
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="rounded border border-[var(--color-neutral-200)] px-2 py-0.5 text-[10px] text-[var(--color-neutral-700)] disabled:opacity-40"
                    disabled={index === 0}
                    onClick={() => move(item.id, -1)}
                  >
                    بالا
                  </button>
                  <button
                    type="button"
                    className="rounded border border-[var(--color-neutral-200)] px-2 py-0.5 text-[10px] text-[var(--color-neutral-700)] disabled:opacity-40"
                    disabled={index === items.length - 1}
                    onClick={() => move(item.id, 1)}
                  >
                    پایین
                  </button>
                  <button
                    type="button"
                    className="rounded border border-red-200 px-2 py-0.5 text-[10px] text-red-600"
                    onClick={() => remove(item.id)}
                  >
                    حذف
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
