"use client";

import { useMemo, useState } from "react";
import type { CatalogCategoryOption } from "@/lib/api/catalog-lookups";
import {
  createSellerCategory,
  setSellerCategoryActive,
} from "@/lib/api/catalog-lookups";
import { childrenOf, pathToCategory } from "@/lib/category-tree";
import { wizardInputClass } from "./WizardStepChrome";

type Props = {
  categories: CatalogCategoryOption[];
  selectedId: string;
  selectedName: string;
  disabled?: boolean;
  onChange: (next: { id: string; name: string }) => void;
  onCategoriesChanged: (rows: CatalogCategoryOption[]) => void;
};

/**
 * Digikala-style cascading category picker with unlimited depth.
 * Seller can stop at any level or add a new child under the current node.
 */
export function CategoryTreePicker({
  categories,
  selectedId,
  selectedName,
  disabled,
  onChange,
  onCategoriesChanged,
}: Props) {
  const path = useMemo(
    () => (selectedId ? pathToCategory(categories, selectedId) : []),
    [categories, selectedId],
  );

  // One select per path level + trailing select when current node has children.
  const levels = useMemo(() => {
    const result: { parentId: string | null; options: CatalogCategoryOption[] }[] =
      [];
    let parentId: string | null = null;
    for (let i = 0; i <= path.length; i++) {
      const options = childrenOf(categories, parentId);
      if (i < path.length || options.length > 0) {
        result.push({ parentId, options });
      }
      if (i < path.length) {
        parentId = path[i]!.id;
      }
    }
    return result;
  }, [categories, path]);

  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addUnderId = path.length > 0 ? path[path.length - 1]!.id : null;

  async function handleCreate() {
    const title = newTitle.trim();
    if (!title) {
      setError("نام دسته جدید را وارد کنید");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const created = await createSellerCategory(title, addUnderId);
      if (!created) {
        setError("ساخت دسته ناموفق بود — وارد شوید یا بعداً تلاش کنید");
        return;
      }
      onCategoriesChanged([...categories, created]);
      onChange({ id: created.id, name: created.name });
      setNewTitle("");
      setAdding(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ساخت دسته");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      {levels.map((level, index) => {
        if (level.options.length === 0) return null;
        const selectValue = index < path.length ? path[index]!.id : "";

        return (
          <select
            key={`lvl-${index}-${level.parentId ?? "root"}`}
            className={wizardInputClass}
            disabled={disabled}
            value={selectValue}
            aria-label={index === 0 ? "دسته اصلی" : `زیردسته سطح ${index + 1}`}
            onChange={(e) => {
              const id = e.target.value;
              if (!id) {
                if (index === 0) {
                  onChange({ id: "", name: "" });
                  return;
                }
                const parent = path[index - 1]!;
                onChange({ id: parent.id, name: parent.name });
                return;
              }
              const match = categories.find((c) => c.id === id);
              if (match) onChange({ id: match.id, name: match.name });
            }}
          >
            <option value="">
              {index === 0 ? "انتخاب دسته…" : "— بدون زیردسته (همین سطح) —"}
            </option>
            {level.options.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        );
      })}

      {selectedName ? (
        <p className="text-[11px] leading-5 text-[var(--color-neutral-500)]">
          مسیر انتخاب‌شده:{" "}
          <span className="font-medium text-[var(--color-neutral-800)]">
            {path.map((p) => p.name).join(" › ") || selectedName}
          </span>
        </p>
      ) : null}

      {selectedId.startsWith("cat-s-") ? (
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => {
            void (async () => {
              setBusy(true);
              setError(null);
              const ok = await setSellerCategoryActive(selectedId, false);
              setBusy(false);
              if (!ok) {
                setError("غیرفعال‌سازی دسته ناموفق بود");
                return;
              }
              onCategoriesChanged(
                categories.filter((c) => c.id !== selectedId),
              );
              const parent = path.length > 1 ? path[path.length - 2]! : null;
              onChange(
                parent
                  ? { id: parent.id, name: parent.name }
                  : { id: "", name: "" },
              );
            })();
          }}
          className="text-xs font-medium text-[var(--color-hint-object-error)]"
        >
          غیرفعال کردن این دسته (ساخته‌شده توسط فروشنده)
        </button>
      ) : null}

      {!adding ? (
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => setAdding(true)}
          className="text-xs font-medium text-[var(--color-primary)]"
        >
          {addUnderId
            ? "افزودن زیردسته جدید زیر این دسته"
            : "افزودن دسته ریشه جدید"}
        </button>
      ) : (
        <div className="space-y-2 rounded-lg border border-[var(--color-neutral-100)] p-3">
          <p className="text-[11px] text-[var(--color-neutral-500)]">
            عمق نامحدود — دسته زیر{" "}
            {addUnderId
              ? path.map((p) => p.name).join(" › ")
              : "ریشه درخت"}{" "}
            ساخته می‌شود
          </p>
          <input
            className={wizardInputClass}
            value={newTitle}
            disabled={busy}
            placeholder="نام دسته جدید"
            onChange={(e) => setNewTitle(e.target.value)}
          />
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleCreate()}
              className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
            >
              {busy ? "…" : "ذخیره دسته"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setAdding(false);
                setError(null);
              }}
              className="text-xs text-[var(--color-neutral-500)]"
            >
              انصراف
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
