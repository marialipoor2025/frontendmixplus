"use client";

import { useEffect, useMemo, useState } from "react";
import type { CatalogCategoryOption } from "@/lib/api/catalog-lookups";
import { digiFallbackCategories } from "@/lib/seller/digi-category-fallback";
import { childrenOf, pathToCategory } from "@/lib/category-tree";

type Props = {
  open: boolean;
  categories: CatalogCategoryOption[];
  selectedId: string;
  selectedName: string;
  onClose: () => void;
  onConfirm: (next: {
    id: string;
    name: string;
    pathLabel: string;
  }) => void;
};

/**
 * Digikala CategorySelectionModal — search + 2-col drill-down + breadcrumb + ادامه.
 */
export function DigiCategorySelectionModal({
  open,
  categories,
  selectedId,
  selectedName,
  onClose,
  onConfirm,
}: Props) {
  const catalog = useMemo(() => {
    if (categories.length >= 8) return categories;
    // Prefer rich Digikala-like fallback when API tree is empty/shallow
    const fallback = digiFallbackCategories();
    if (!categories.length) return fallback;
    const ids = new Set(categories.map((c) => c.id));
    return [...categories, ...fallback.filter((f) => !ids.has(f.id))];
  }, [categories]);

  const [query, setQuery] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [pending, setPending] = useState<{ id: string; name: string } | null>(
    null,
  );

  useEffect(() => {
    if (!open) return;
    setQuery("");
    if (selectedId && catalog.some((c) => c.id === selectedId)) {
      const path = pathToCategory(catalog, selectedId);
      const parent = path.length > 1 ? path[path.length - 2]!.id : null;
      setParentId(parent);
      setPending({
        id: selectedId,
        name: selectedName || path.at(-1)?.name || "",
      });
    } else {
      setParentId(null);
      setPending(null);
    }
  }, [open, selectedId, selectedName, catalog]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const breadcrumb = useMemo(() => {
    if (pending?.id && catalog.some((c) => c.id === pending.id)) {
      return pathToCategory(catalog, pending.id);
    }
    if (parentId) return pathToCategory(catalog, parentId);
    return [];
  }, [catalog, parentId, pending]);

  const searchHits = useMemo(() => {
    const q = query.trim();
    if (!q) return null;
    return catalog.filter((c) => c.name.includes(q)).slice(0, 40);
  }, [catalog, query]);

  const listItems = useMemo(() => {
    if (searchHits) return searchHits;
    return childrenOf(catalog, parentId);
  }, [catalog, parentId, searchHits]);

  function hasChildren(id: string) {
    return childrenOf(catalog, id).length > 0;
  }

  function handleItemClick(item: CatalogCategoryOption) {
    if (!searchHits && hasChildren(item.id)) {
      setParentId(item.id);
      setPending(null);
      return;
    }
    setPending({ id: item.id, name: item.name });
  }

  function handleBreadcrumbClick(id: string | null) {
    setQuery("");
    setPending(null);
    setParentId(id);
  }

  if (!open) return null;

  const canContinue = Boolean(pending?.id);
  const pathLabel = breadcrumb.map((c) => c.name).join(" / ");

  return (
    <div className="digi-cat-modal-root" role="presentation">
      <button
        type="button"
        className="digi-cat-modal-scrim"
        aria-label="بستن"
        onClick={onClose}
      />
      <div
        className="digi-cat-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="digi-cat-modal-title"
      >
        <header className="digi-cat-modal__header">
          <button
            type="button"
            className="digi-cat-modal__close"
            aria-label="بستن"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
          <p id="digi-cat-modal-title" className="digi-cat-modal__title">
            انتخاب دسته‌بندی
          </p>
        </header>

        <div className="digi-cat-modal__body">
          <main className="digi-cat-modal__main">
            <label className="digi-cat-modal__search">
              <SearchIcon />
              <input
                type="text"
                placeholder="جست و جو"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </label>

            <div className="digi-cat-modal__breadcrumb">
              {breadcrumb.length > 0 ? (
                <>
                  <button
                    type="button"
                    className="digi-cat-modal__crumb"
                    onClick={() => handleBreadcrumbClick(null)}
                  >
                    همه دسته‌ها
                  </button>
                  {breadcrumb.map((c, i) => (
                    <span key={c.id} className="digi-cat-modal__crumb-wrap">
                      <span className="digi-cat-modal__crumb-sep" aria-hidden>
                        /
                      </span>
                      <button
                        type="button"
                        className="digi-cat-modal__crumb"
                        disabled={i === breadcrumb.length - 1 && Boolean(pending)}
                        onClick={() => {
                          if (hasChildren(c.id)) {
                            handleBreadcrumbClick(c.id);
                          }
                        }}
                      >
                        {c.name}
                      </button>
                    </span>
                  ))}
                </>
              ) : null}
            </div>

            <div className="digi-cat-modal__grid">
              {listItems.length === 0 ? (
                <p className="digi-cat-modal__empty">دسته‌ای یافت نشد</p>
              ) : (
                listItems.map((item) => {
                  const drill = !searchHits && hasChildren(item.id);
                  const selected = pending?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className="digi-cat-modal__item"
                      data-selected={selected ? "true" : "false"}
                      onClick={() => handleItemClick(item)}
                    >
                      <span>{item.name}</span>
                      {drill ? <ChevronLeftIcon /> : null}
                      {!drill && selected ? <CheckMiniIcon /> : null}
                    </button>
                  );
                })
              )}
            </div>
          </main>

          <div className="digi-cat-modal__footer">
            <button
              type="button"
              className="digi-btn-primary digi-cat-modal__continue"
              disabled={!canContinue}
              onClick={() => {
                if (!pending) return;
                onConfirm({
                  id: pending.id,
                  name: pending.name,
                  pathLabel: pathLabel || pending.name,
                });
                onClose();
              }}
            >
              ادامه
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14.7 5.3a1 1 0 0 1 0 1.4L9.4 12l5.3 5.3a1 1 0 1 1-1.4 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.4 0z" />
    </svg>
  );
}

function CheckMiniIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9.2 16.6 4.8 12.2l1.4-1.4 3 3 8-8 1.4 1.4z" />
    </svg>
  );
}
