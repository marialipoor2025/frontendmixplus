"use client";

import { useState } from "react";
import { AdminButton, AdminOutlineButton } from "@/components/admin/AdminUi";
import type { AdminSpec } from "@/types/admin";

type Props = {
  initial?: AdminSpec | null;
  onCancel: () => void;
  onSave: (spec: AdminSpec) => void;
};

const empty: AdminSpec = {
  id: "",
  name: "",
  group: "عمومی",
  unit: "—",
  category: "",
};

/** Catalog attribute definition (reusable label/unit/group). */
export function AdminSpecForm({ initial, onCancel, onSave }: Props) {
  const [form, setForm] = useState<AdminSpec>(initial ?? empty);

  return (
    <form
      className="space-y-4 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ ...form, id: form.id || `s-${Date.now()}` });
      }}
    >
      <h3 className="text-sm font-bold text-[var(--color-neutral-900)]">
        {initial ? "ویرایش ویژگی" : "ویژگی جدید"}
      </h3>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1 text-sm">
          <span className="text-[var(--color-neutral-600)]">نام ویژگی</span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-[var(--color-neutral-600)]">گروه</span>
          <input
            required
            value={form.group}
            onChange={(e) => setForm((p) => ({ ...p, group: e.target.value }))}
            className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-[var(--color-neutral-600)]">واحد</span>
          <input
            value={form.unit}
            onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
            className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
            placeholder="لیتر، وات، —"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-[var(--color-neutral-600)]">دسته‌بندی</span>
          <input
            required
            value={form.category}
            onChange={(e) =>
              setForm((p) => ({ ...p, category: e.target.value }))
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
