"use client";

import { useEffect, useState } from "react";
import { AdminButton, AdminOutlineButton } from "@/components/admin/AdminUi";
import type { AdminBrand } from "@/types/admin";

type Props = {
  initial?: AdminBrand | null;
  onCancel: () => void;
  onSave: (brand: AdminBrand) => void;
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06FF-]/g, "")
    .replace(/-+/g, "-");
}

const empty: AdminBrand = {
  id: "",
  name: "",
  slug: "",
  logoUrl: "",
  productCount: 0,
  status: "active",
};

export function AdminBrandForm({ initial, onCancel, onSave }: Props) {
  const [form, setForm] = useState<AdminBrand>(initial ?? empty);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));

  useEffect(() => {
    if (!slugTouched) {
      setForm((p) => ({ ...p, slug: slugify(form.name) }));
    }
  }, [form.name, slugTouched]);

  return (
    <form
      className="space-y-4 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ ...form, id: form.id || `b-${Date.now()}` });
      }}
    >
      <h3 className="text-sm font-bold text-[var(--color-neutral-900)]">
        {initial ? "ویرایش برند" : "برند جدید"}
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
        <label className="block space-y-1 text-sm sm:col-span-2">
          <span className="text-[var(--color-neutral-600)]">لوگو (URL)</span>
          <input
            dir="ltr"
            value={form.logoUrl ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, logoUrl: e.target.value }))
            }
            className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.status === "active"}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                status: e.target.checked ? "active" : "hidden",
              }))
            }
          />
          فعال
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
