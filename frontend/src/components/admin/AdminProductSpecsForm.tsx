"use client";

import { useState } from "react";
import { AdminButton, AdminOutlineButton } from "@/components/admin/AdminUi";
import type {
  AdminProductSpecAttribute,
  AdminProductSpecGroup,
  AdminProductSpecs,
} from "@/types/admin";

type Props = {
  initial?: AdminProductSpecs | null;
  onCancel: () => void;
  onSave: (doc: AdminProductSpecs) => void;
};

function emptyAttr(): AdminProductSpecAttribute {
  return { id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, label: "", values: [""] };
}

function emptyGroup(): AdminProductSpecGroup {
  return {
    id: `g-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: "مشخصات کلی",
    previewCount: 5,
    attributes: [emptyAttr()],
  };
}

const emptyDoc = (): AdminProductSpecs => ({
  productKey: "",
  productTitle: "",
  groups: [emptyGroup()],
});

/**
 * Product-scoped specs editor — mirrors PDP ProductSpecGroup structure.
 */
export function AdminProductSpecsForm({ initial, onCancel, onSave }: Props) {
  const [form, setForm] = useState<AdminProductSpecs>(initial ?? emptyDoc());

  function updateGroup(index: number, patch: Partial<AdminProductSpecGroup>) {
    setForm((prev) => ({
      ...prev,
      groups: prev.groups.map((g, i) => (i === index ? { ...g, ...patch } : g)),
    }));
  }

  function updateAttr(
    groupIndex: number,
    attrIndex: number,
    patch: Partial<AdminProductSpecAttribute>,
  ) {
    setForm((prev) => ({
      ...prev,
      groups: prev.groups.map((g, gi) => {
        if (gi !== groupIndex) return g;
        return {
          ...g,
          attributes: g.attributes.map((a, ai) =>
            ai === attrIndex ? { ...a, ...patch } : a,
          ),
        };
      }),
    }));
  }

  return (
    <form
      className="space-y-4 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          ...form,
          productKey: form.productKey.trim() || form.productTitle.trim(),
          groups: form.groups.map((g) => ({
            ...g,
            attributes: g.attributes
              .filter((a) => a.label.trim())
              .map((a) => ({
                ...a,
                values: a.values.map((v) => v.trim()).filter(Boolean),
              }))
              .filter((a) => a.values.length > 0),
          })),
        });
      }}
    >
      <h3 className="text-sm font-bold text-[var(--color-neutral-900)]">
        مشخصات محصول (گروه‌ها و ویژگی‌ها)
      </h3>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1 text-sm">
          <span className="text-[var(--color-neutral-600)]">کلید / اسلاگ محصول</span>
          <input
            required
            dir="ltr"
            value={form.productKey}
            onChange={(e) =>
              setForm((p) => ({ ...p, productKey: e.target.value }))
            }
            className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
            placeholder="samsung-rf28"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-[var(--color-neutral-600)]">عنوان محصول</span>
          <input
            required
            value={form.productTitle}
            onChange={(e) =>
              setForm((p) => ({ ...p, productTitle: e.target.value }))
            }
            className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
          />
        </label>
      </div>

      {form.groups.map((group, gi) => (
        <div
          key={group.id}
          className="space-y-3 rounded-lg border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-3"
        >
          <div className="flex flex-wrap items-end gap-2">
            <label className="min-w-[12rem] flex-1 space-y-1 text-sm">
              <span className="text-[var(--color-neutral-600)]">عنوان گروه</span>
              <input
                required
                value={group.title}
                onChange={(e) => updateGroup(gi, { title: e.target.value })}
                className="w-full rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 py-2"
              />
            </label>
            <label className="w-28 space-y-1 text-sm">
              <span className="text-[var(--color-neutral-600)]">پیش‌نمایش</span>
              <input
                type="number"
                min={1}
                value={group.previewCount ?? 5}
                onChange={(e) =>
                  updateGroup(gi, {
                    previewCount: Number(e.target.value) || 5,
                  })
                }
                className="w-full rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 py-2"
              />
            </label>
            <AdminOutlineButton
              type="button"
              onClick={() =>
                setForm((p) => ({
                  ...p,
                  groups: p.groups.filter((_, i) => i !== gi),
                }))
              }
            >
              حذف گروه
            </AdminOutlineButton>
          </div>

          {group.attributes.map((attr, ai) => (
            <div
              key={attr.id}
              className="grid gap-2 rounded-md border border-[var(--color-neutral-200)] bg-white p-2 sm:grid-cols-[1fr_1.4fr_auto]"
            >
              <input
                required
                placeholder="برچسب (مثلاً گرید انرژی)"
                value={attr.label}
                onChange={(e) => updateAttr(gi, ai, { label: e.target.value })}
                className="rounded-lg border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              />
              <input
                required
                placeholder="مقادیر با | جدا شوند"
                value={attr.values.join(" | ")}
                onChange={(e) =>
                  updateAttr(gi, ai, {
                    values: e.target.value
                      .split("|")
                      .map((v) => v.trim())
                      .filter(Boolean),
                  })
                }
                className="rounded-lg border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              />
              <AdminOutlineButton
                type="button"
                onClick={() =>
                  updateGroup(gi, {
                    attributes: group.attributes.filter((_, i) => i !== ai),
                  })
                }
              >
                حذف
              </AdminOutlineButton>
            </div>
          ))}

          <AdminOutlineButton
            type="button"
            onClick={() =>
              updateGroup(gi, {
                attributes: [...group.attributes, emptyAttr()],
              })
            }
          >
            افزودن ویژگی
          </AdminOutlineButton>
        </div>
      ))}

      <AdminOutlineButton
        type="button"
        onClick={() =>
          setForm((p) => ({ ...p, groups: [...p.groups, emptyGroup()] }))
        }
      >
        افزودن گروه
      </AdminOutlineButton>

      <div className="flex flex-wrap gap-2">
        <AdminButton type="submit">ذخیره مشخصات محصول</AdminButton>
        <AdminOutlineButton type="button" onClick={onCancel}>
          انصراف
        </AdminOutlineButton>
      </div>
    </form>
  );
}
