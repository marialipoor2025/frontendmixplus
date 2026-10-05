"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  AdminButton,
  AdminOutlineButton,
  AdminPageHeader,
  StatusPill,
} from "@/components/admin/AdminUi";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { pickVariantUrl, uploadMediaAsset } from "@/lib/api/media";
import { mockAdminMedia } from "@/lib/mocks/admin";
import type { AdminMedia } from "@/types/admin";

function toAdminMedia(
  id: string,
  name: string,
  previewUrl: string,
  sizeKb: number,
  variants?: AdminMedia["variants"],
  contentType?: string,
): AdminMedia {
  const isVideo = (contentType ?? "").startsWith("video/");
  return {
    id,
    name,
    type: isVideo ? "video" : "image",
    usedIn: "کتابخانه رسانه",
    sizeKb,
    previewUrl,
    contentType,
    variants,
  };
}

export default function AdminMediaPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<AdminMedia[]>(mockAdminMedia);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function onFilesSelected(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: AdminMedia[] = [];
      for (const file of Array.from(files)) {
        const asset = await uploadMediaAsset(file);
        uploaded.push(
          toAdminMedia(
            asset.id,
            asset.originalFileName,
            pickVariantUrl(asset, "thumb") || pickVariantUrl(asset, "card"),
            Math.max(1, Math.round(file.size / 1024)),
            asset.variants.map((v) => ({
              key: v.key,
              url: v.url,
              width: v.width,
              height: v.height,
            })),
            asset.contentType,
          ),
        );
      }
      setItems((prev) => [...uploaded, ...prev]);
      setNotice(`${uploaded.length} فایل آپلود شد (با نسخه‌های thumb/card/gallery)`);
      window.setTimeout(() => setNotice(null), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "آپلود ناموفق بود");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <RequireAdmin permission="media:manage">
      <AdminPageHeader
        title="مدیریت رسانه"
        description="آپلود تصویر محصول — نسخه‌های مختلف هنگام آپلود ساخته و روی دیسک ذخیره می‌شوند"
        actions={
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4"
              multiple
              className="hidden"
              onChange={(e) => void onFilesSelected(e.target.files)}
            />
            <AdminOutlineButton
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? "در حال آپلود…" : "آپلود رسانه"}
            </AdminOutlineButton>
          </>
        }
      />

      {notice ? (
        <p className="mb-3 rounded-lg bg-[var(--color-primary-soft)] px-3 py-2 text-sm text-[var(--color-primary)]">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div
        className="mb-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-neutral-300)] bg-white px-4 py-10 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void onFilesSelected(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <p className="text-sm font-medium text-[var(--color-neutral-800)]">
          فایل را اینجا رها کنید یا کلیک کنید
        </p>
        <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
          JPG / PNG / WebP — تولید خودکار thumb · card · gallery · original
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="overflow-hidden rounded-xl border border-[var(--color-neutral-200)] bg-white"
          >
            <div className="relative aspect-square bg-[var(--color-neutral-50)]">
              {item.type === "image" && item.previewUrl ? (
                <Image
                  src={item.previewUrl}
                  alt={item.name}
                  fill
                  className="object-contain p-3"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[var(--color-neutral-400)]">
                  ویدیو
                </div>
              )}
            </div>
            <div className="space-y-2 p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-sm font-medium text-[var(--color-neutral-900)]">
                  {item.name}
                </p>
                <StatusPill tone={item.type === "image" ? "info" : "warn"}>
                  {item.type === "image" ? "تصویر" : "ویدیو"}
                </StatusPill>
              </div>
              <p className="text-xs text-[var(--color-neutral-500)]">
                {item.sizeKb.toLocaleString("fa-IR")} کیلوبایت · {item.usedIn}
              </p>
              {item.variants?.length ? (
                <div className="flex flex-wrap gap-1">
                  {item.variants.map((v) => (
                    <span
                      key={v.key}
                      className="rounded bg-[var(--color-neutral-100)] px-1.5 py-0.5 text-[10px] text-[var(--color-neutral-600)]"
                    >
                      {v.key} {v.width}×{v.height}
                    </span>
                  ))}
                </div>
              ) : null}
              <AdminButton
                type="button"
                className="w-full"
                onClick={() => {
                  setItems((prev) => prev.filter((x) => x.id !== item.id));
                }}
              >
                حذف از لیست
              </AdminButton>
            </div>
          </li>
        ))}
      </ul>
    </RequireAdmin>
  );
}
