"use client";

import { useState } from "react";
import type { ProductSpecAttribute, ProductSpecGroup } from "@/types/product-detail";
import type { SellerProductDraft } from "@/types/seller-wizard";
import { SELLER_WIZARD_STEPS } from "@/lib/seller/wizard-steps";
import { PdpComponentPreview } from "../PdpComponentPreview";
import {
  WizardNavButtons,
  WizardStepChrome,
  wizardInputClass,
} from "../WizardStepChrome";

type Props = {
  draft: SellerProductDraft;
  onSave: (specs: ProductSpecGroup[]) => Promise<void> | void;
  onBack?: () => void;
  onSkip?: () => void;
};

const UNIT_SUGGESTIONS = [
  "سانتی‌متر",
  "میلی‌متر",
  "متر",
  "کیلوگرم",
  "گرم",
  "لیتر",
  "وات",
  "اینچ",
  "ولت",
];

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
}

function emptyAttr(): ProductSpecAttribute {
  return { id: uid("a"), label: "", values: [""], unit: "" };
}

function emptyGroup(): ProductSpecGroup {
  return {
    id: uid("g"),
    title: "مشخصات کلی",
    previewCount: 5,
    attributes: [emptyAttr()],
  };
}

/** Split trailing known unit from a previously saved "value unit" string. */
function hydrateAttr(attr: ProductSpecAttribute): ProductSpecAttribute {
  if (attr.unit?.trim()) {
    return { ...attr, unit: attr.unit.trim(), values: [...attr.values] };
  }
  const raw = (attr.values[0] ?? "").trim();
  if (!raw) return { ...attr, unit: "" };
  const known = [...UNIT_SUGGESTIONS].sort((a, b) => b.length - a.length);
  for (const unit of known) {
    if (raw.endsWith(` ${unit}`)) {
      return {
        ...attr,
        unit,
        values: [raw.slice(0, raw.length - unit.length - 1).trim()],
      };
    }
  }
  return { ...attr, unit: attr.unit ?? "" };
}

function hydrateGroups(groups: ProductSpecGroup[]): ProductSpecGroup[] {
  return groups.map((g) => ({
    ...g,
    attributes: g.attributes.map(hydrateAttr),
  }));
}

function reorder<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) {
    return list;
  }
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
}

export function SpecsStep({ draft, onSave, onBack, onSkip }: Props) {
  const [groups, setGroups] = useState<ProductSpecGroup[]>(
    draft.specs.length ? hydrateGroups(draft.specs) : [emptyGroup()],
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragAttr, setDragAttr] = useState<{
    groupId: string;
    index: number;
  } | null>(null);
  const [overAttr, setOverAttr] = useState<{
    groupId: string;
    index: number;
  } | null>(null);

  async function handleSave() {
    const cleaned = groups
      .map((g) => ({
        ...g,
        title: g.title.trim(),
        attributes: g.attributes
          .filter((a) => a.label.trim())
          .map((a) => {
            const unit = (a.unit ?? "").trim();
            const values = a.values
              .map((v) => v.trim())
              .filter(Boolean)
              .map((v) => (unit ? `${v} ${unit}` : v));
            return {
              id: a.id,
              label: a.label.trim(),
              values,
              unit: unit || undefined,
            };
          })
          .filter((a) => a.values.length > 0),
      }))
      .filter((g) => g.title && g.attributes.length > 0);

    setError(null);
    setSaving(true);
    try {
      await onSave(cleaned);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره ناموفق بود");
    } finally {
      setSaving(false);
    }
  }

  function moveAttr(groupId: string, from: number, to: number) {
    setGroups((prev) =>
      prev.map((g) =>
        g.id !== groupId
          ? g
          : { ...g, attributes: reorder(g.attributes, from, to) },
      ),
    );
  }

  const stepMeta = SELLER_WIZARD_STEPS.find((s) => s.id === "specs");
  const previewDraft = { ...draft, specs: groups };

  return (
    <WizardStepChrome
      title={stepMeta?.title ?? "جدول مشخصات"}
      hint={stepMeta?.pdpHint ?? ""}
      pdpComponent={stepMeta?.pdpComponent}
      aside={<PdpComponentPreview draft={previewDraft} stepId="specs" />}
      footer={
        <WizardNavButtons
          onBack={onBack}
          onSkip={onSkip}
          onSaveContinue={() => void handleSave()}
          saving={saving}
        />
      }
    >
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      <p className="text-[11px] text-[var(--color-neutral-500)]">
        ردیف‌ها را با دستگیره بکشید تا ترتیب در پیش‌نمایش عوض شود
      </p>

      <button
        type="button"
        onClick={() => setGroups((prev) => [...prev, emptyGroup()])}
        className="rounded-lg border border-[var(--color-neutral-200)] px-3 py-1.5 text-xs"
      >
        + گروه مشخصات
      </button>

      {groups.map((group, gi) => (
        <div
          key={group.id}
          className="space-y-2 rounded-lg border border-[var(--color-neutral-100)] p-3"
        >
          <div className="flex items-center gap-2">
            <input
              className={wizardInputClass}
              value={group.title}
              onChange={(e) =>
                setGroups((prev) =>
                  prev.map((g, i) =>
                    i === gi ? { ...g, title: e.target.value } : g,
                  ),
                )
              }
              placeholder="عنوان گروه (مثلاً مشخصات کلی)"
            />
            <button
              type="button"
              className="shrink-0 text-xs text-red-600"
              onClick={() => setGroups((prev) => prev.filter((_, i) => i !== gi))}
            >
              حذف
            </button>
          </div>

          {group.attributes.map((attr, ai) => {
            const isDragging =
              dragAttr?.groupId === group.id && dragAttr.index === ai;
            const isOver =
              overAttr?.groupId === group.id && overAttr.index === ai;
            return (
              <div
                key={attr.id}
                draggable
                onDragStart={() => setDragAttr({ groupId: group.id, index: ai })}
                onDragEnd={() => {
                  setDragAttr(null);
                  setOverAttr(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragAttr?.groupId === group.id) {
                    setOverAttr({ groupId: group.id, index: ai });
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragAttr?.groupId === group.id) {
                    moveAttr(group.id, dragAttr.index, ai);
                  }
                  setDragAttr(null);
                  setOverAttr(null);
                }}
                className={[
                  "grid gap-2 rounded-md sm:grid-cols-[auto_1.2fr_1fr_1fr_auto]",
                  isDragging ? "opacity-50" : "",
                  isOver ? "ring-2 ring-[var(--color-primary)]/40" : "",
                ].join(" ")}
              >
                <button
                  type="button"
                  className="cursor-grab px-1 text-[var(--color-neutral-400)] active:cursor-grabbing"
                  title="جابه‌جایی"
                  aria-label="جابه‌جایی ردیف"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  ⋮⋮
                </button>
                <input
                  className={wizardInputClass}
                  value={attr.label}
                  placeholder="ویژگی (مثلاً ارتفاع)"
                  onChange={(e) =>
                    setGroups((prev) =>
                      prev.map((g, i) => {
                        if (i !== gi) return g;
                        return {
                          ...g,
                          attributes: g.attributes.map((a, j) =>
                            j === ai ? { ...a, label: e.target.value } : a,
                          ),
                        };
                      }),
                    )
                  }
                />
                <input
                  className={wizardInputClass}
                  value={attr.values[0] ?? ""}
                  placeholder="مقدار (مثلاً ۸۰)"
                  onChange={(e) =>
                    setGroups((prev) =>
                      prev.map((g, i) => {
                        if (i !== gi) return g;
                        return {
                          ...g,
                          attributes: g.attributes.map((a, j) =>
                            j === ai ? { ...a, values: [e.target.value] } : a,
                          ),
                        };
                      }),
                    )
                  }
                />
                <input
                  className={wizardInputClass}
                  list="seller-spec-units"
                  value={attr.unit ?? ""}
                  placeholder="واحد (سانتی‌متر)"
                  onChange={(e) =>
                    setGroups((prev) =>
                      prev.map((g, i) => {
                        if (i !== gi) return g;
                        return {
                          ...g,
                          attributes: g.attributes.map((a, j) =>
                            j === ai ? { ...a, unit: e.target.value } : a,
                          ),
                        };
                      }),
                    )
                  }
                />
                <button
                  type="button"
                  className="text-xs text-red-600"
                  onClick={() =>
                    setGroups((prev) =>
                      prev.map((g, i) =>
                        i !== gi
                          ? g
                          : {
                              ...g,
                              attributes: g.attributes.filter((_, j) => j !== ai),
                            },
                      ),
                    )
                  }
                >
                  ×
                </button>
              </div>
            );
          })}

          <datalist id="seller-spec-units">
            {UNIT_SUGGESTIONS.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>

          <button
            type="button"
            className="text-xs text-[var(--color-primary)]"
            onClick={() =>
              setGroups((prev) =>
                prev.map((g, i) =>
                  i === gi
                    ? { ...g, attributes: [...g.attributes, emptyAttr()] }
                    : g,
                ),
              )
            }
          >
            + ردیف
          </button>
        </div>
      ))}
    </WizardStepChrome>
  );
}
