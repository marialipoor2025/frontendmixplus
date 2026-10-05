"use client";

import { useEffect, useState } from "react";
import { AdminButton, AdminOutlineButton } from "@/components/admin/AdminUi";
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

  const parentOptions = parents.filter((p) => p.id !== form.id);

  return (
    <form
      className="space-y-4 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4"
      onSubmit={(e) => {
        e.preventDefault();
        const parent = parentOptions.find((p) => p.id === form.parentId);
        onSave({
          ...form,
          id: form.id || `c-${Date.now()}`,
          parent: parent?.name ?? "—",
          href: form.href || `/category/${form.slug}`,
        });
      }}
    >
      <h3 className="text-sm font-bold text-[var(--color-neutral-900)]">
        {initial ? "ویرایش دسته" : "دسته جدید"}
      </h3>

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
          <span className="text-[var(--color-neutral-600)]">والد</span>
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
                {p.name}
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
        <label className="block space-y-1 text-sm sm:col-span-2">
          <span className="text-[var(--color-neutral-600)]">آدرس تصویر</span>
          <input
            dir="ltr"
            value={form.imageUrl ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, imageUrl: e.target.value || undefined }))
            }
            className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
          />
        </label>
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
