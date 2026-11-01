"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AdminButton, AdminOutlineButton } from "@/components/admin/AdminUi";
import { pickVariantUrl, uploadMediaAsset } from "@/lib/api/media";
import { flatCategoryOptionsWithDepth } from "@/lib/category-tree";
import type { AdminCategory } from "@/types/admin";

type Props = {
  initial?: AdminCategory | null;
  parents: AdminCategory[];
  onCancel: () => void;
  onSave: (category: AdminCategory) => void;
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06FF-]/g, "")
    .replace(/-+/g, "-");
}

const empty: AdminCategory = {
  id: "",
  name: "",
  parent: "—",
  parentId: null,
  slug: "",
  href: "",
  sortOrder: 0,
  isActive: true,
  productCount: 0,
};

export function AdminCategoryForm({
  initial,
  parents,
  onCancel,
  onSave,
}: Props) {
  const [form, setForm] = useState<AdminCategory>(initial ?? empty);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!slugTouched) {
      const slug = slugify(form.name);
      setForm((p) => ({
        ...p,
        slug,
        href: p.href || (slug ? `/category/${slug}` : ""),
      }));
    }
  }, [form.name, slugTouched]);

  const parentOptions = useMemo(() => {
    const flat = parents
      .filter((p) => p.id !== form.id)
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        parentId: p.parentId ?? null,
      }));
    return flatCategoryOptionsWithDepth(flat).filter((o) => o.id !== form.id);
  }, [parents, form.id]);

  return (
    <form
      className="space-y-4 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4"
      onSubmit={(e) => {
        e.preventDefault();
        const parentLabel =
          parentOptions.find((p) => p.id === form.parentId)?.label ?? "—";
        onSave({
          ...form,
          id: form.id || `c-${Date.now()}`,
          parent: parentLabel,
          href: form.href || `/category/${form.slug}`,
        });
      }}
    >
      <h3 className="text-sm font-bold text-[var(--color-neutral-900)]">
        {initial ? "ویرایش دسته" : "دسته جدید"}
      </h3>
      <p className="text-xs text-[var(--color-neutral-500)]">
        ساختار دیجی‌کالا پایه است؛ می‌توانید در هر عمقی والد انتخاب یا ریشه جدید بسازید.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1 text-sm">
          <span className="text-[var(--color-neutral-600)]">نام</span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-[var(--color-neutral-600)]">والد (عمق نامحدود)</span>
          <select
            value={form.parentId ?? ""}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                parentId: e.target.value || null,
              }))
            }
            className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
          >
            <option value="">— ریشه —</option>
            {parentOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-[var(--color-neutral-600)]">اسلاگ</span>
          <input
            required
            dir="ltr"
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setForm((p) => ({ ...p, slug: e.target.value }));
            }}
            className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-[var(--color-neutral-600)]">مسیر (href)</span>
          <input
            dir="ltr"
            value={form.href}
            onChange={(e) => setForm((p) => ({ ...p, href: e.target.value }))}
            className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
            placeholder="/category/slug"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-[var(--color-neutral-600)]">ترتیب</span>
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                sortOrder: Number(e.target.value) || 0,
              }))
            }
            className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
          />
        </label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) =>
              setForm((p) => ({ ...p, isActive: e.target.checked }))
            }
          />
          فعال
        </label>
        <div className="space-y-2 text-sm sm:col-span-2">
          <span className="text-[var(--color-neutral-600)]">تصویر دسته</span>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex size-16 items-center justify-center overflow-hidden rounded-full bg-[var(--color-neutral-100)]">
              {form.imageUrl ? (
                <Image
                  src={form.imageUrl}
                  alt=""
                  width={64}
                  height={64}
                  unoptimized
                  className="size-16 object-contain"
                />
              ) : (
                <span className="text-[10px] text-[var(--color-neutral-400)]">
                  بدون تصویر
                </span>
              )}
            </div>
            <label className="cursor-pointer rounded-lg border border-[var(--color-neutral-200)] px-3 py-2 text-xs font-medium hover:bg-[var(--color-neutral-50)]">
              {uploading ? "در حال آپلود…" : "آپلود تصویر"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  void (async () => {
                    setUploading(true);
                    setUploadError(null);
                    try {
                      const asset = await uploadMediaAsset(file);
                      const url =
                        pickVariantUrl(asset, "card") ||
                        pickVariantUrl(asset, "thumb") ||
                        pickVariantUrl(asset, "original");
                      if (url) {
                        setForm((p) => ({ ...p, imageUrl: url }));
                      }
                    } catch (err) {
                      setUploadError(
                        err instanceof Error ? err.message : "آپلود ناموفق بود",
                      );
                    } finally {
                      setUploading(false);
                    }
                  })();
                }}
              />
            </label>
            {form.imageUrl ? (
              <button
                type="button"
                className="text-xs text-[var(--color-hint-object-error)]"
                onClick={() =>
                  setForm((p) => ({ ...p, imageUrl: undefined }))
                }
              >
                حذف تصویر
              </button>
            ) : null}
          </div>
          <label className="block space-y-1">
            <span className="text-[11px] text-[var(--color-neutral-500)]">
              یا آدرس مستقیم تصویر
            </span>
            <input
              dir="ltr"
              value={form.imageUrl ?? ""}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  imageUrl: e.target.value || undefined,
                }))
              }
              className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
              placeholder="https://…"
            />
          </label>
          {uploadError ? (
            <p className="text-xs text-[var(--color-hint-object-error)]">
              {uploadError}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <AdminButton type="submit">ذخیره</AdminButton>
        <AdminOutlineButton type="button" onClick={onCancel}>
          انصراف
        </AdminOutlineButton>
      </div>
    </form>
  );
}
