"use client";

import { useState } from "react";
import { AdminButton, AdminOutlineButton } from "@/components/admin/AdminUi";
import type { AdminVariant } from "@/types/admin";

type AdminVariantFormProps = {
  initial?: AdminVariant | null;
  onCancel: () => void;
  onSave: (variant: AdminVariant) => void;
};

const empty: AdminVariant = {
  id: "",
  productId: "",
  productTitle: "",
  sku: "",
  attributes: "",
  options: [
    { code: "color", name: "رنگ", value: "" },
    { code: "capacity", name: "ظرفیت", value: "" },
  ],
  price: 0,
  stock: 0,
  inStock: true,
};

/** Mock create/edit form matching the storefront variant contract. */
export function AdminVariantForm({
  initial,
  onCancel,
  onSave,
}: AdminVariantFormProps) {
  const [form, setForm] = useState<AdminVariant>(initial ?? empty);

  const updateOption = (index: number, value: string) => {
    setForm((prev) => {
      const options = prev.options.map((opt, i) =>
        i === index ? { ...opt, value } : opt,
      );
      return {
        ...prev,
        options,
        attributes: options
          .filter((o) => o.value)
          .map((o) => `${o.name}: ${o.value}`)
          .join(" · "),
      };
    });
  };

  return (
    <form
      className="space-y-4 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          ...form,
          id: form.id || `v-${Date.now()}`,
          inStock: form.stock > 0,
        });
      }}
    >
      <h3 className="text-sm font-bold text-[var(--color-neutral-900)]">
        {initial ? "ویرایش تنوع" : "تنوع جدید"}
      </h3>

      <label className="block space-y-1 text-sm">
        <span className="text-[var(--color-neutral-600)]">عنوان محصول</span>
        <input
          required
          value={form.productTitle}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, productTitle: e.target.value }))
          }
          className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
        />
      </label>

      <label className="block space-y-1 text-sm">
        <span className="text-[var(--color-neutral-600)]">SKU</span>
        <input
          required
          dir="ltr"
          value={form.sku}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, sku: e.target.value }))
          }
          className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        {form.options.map((opt, index) => (
          <label key={opt.code} className="block space-y-1 text-sm">
            <span className="text-[var(--color-neutral-600)]">{opt.name}</span>
            <input
              required
              value={opt.value}
              onChange={(e) => updateOption(index, e.target.value)}
              className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
              placeholder={opt.code === "color" ? "مثلاً استیل" : "مثلاً ۲۸ فوت"}
            />
          </label>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1 text-sm">
          <span className="text-[var(--color-neutral-600)]">قیمت (تومان)</span>
          <input
            required
            type="number"
            min={0}
            value={form.price || ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                price: Number(e.target.value) || 0,
              }))
            }
            className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-[var(--color-neutral-600)]">موجودی</span>
          <input
            required
            type="number"
            min={0}
            value={form.stock}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                stock: Number(e.target.value) || 0,
              }))
            }
            className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
          />
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <AdminOutlineButton type="button" onClick={onCancel}>
          انصراف
        </AdminOutlineButton>
        <AdminButton type="submit">ذخیره (mock)</AdminButton>
      </div>
    </form>
  );
}
