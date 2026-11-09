"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DigiCategorySelectionModal } from "@/components/seller/digi/DigiCategorySelectionModal";
import {
  listCatalogBrandOptions,
  listCatalogCategoryOptions,
  type CatalogBrandOption,
  type CatalogCategoryOption,
} from "@/lib/api/catalog-lookups";
import { pickVariantUrl, uploadMediaAsset } from "@/lib/api/media";
import {
  createSellerProduct,
  saveSellerProductBasics,
  saveSellerProductMedia,
  saveSellerProductSpecs,
} from "@/lib/api/seller-wizard";
import { digiAttrFieldsForCategory } from "@/lib/seller/digi-attribute-schemas";
import {
  digiDivisionOptions,
  digiMefaOptions,
  digiProductTypesForCategory,
} from "@/lib/seller/digi-category-fallback";
import {
  DIGI_CREATE_STEPS,
  digiStepIndex,
  parseDigiStep,
  prevDigiStep,
  type DigiCreateStepId,
} from "@/lib/seller/digi-create-steps";
import {
  ensureDraft,
  markStep,
  removeDraft,
  saveDraft,
  slugifyTitle,
} from "@/lib/seller/wizard-draft";
import type { ProductMediaItem } from "@/types/admin-product";
import type { ProductSpecGroup } from "@/types/product-detail";
import type { SellerProductBasics, SellerProductDraft } from "@/types/seller-wizard";

const CUSTOM = "__custom__";

function generalCompletion(b: SellerProductBasics): number {
  const checks = [
    Boolean(b.brandName?.trim()),
    Boolean((b.productTypes?.length ?? 0) > 0),
    Boolean(b.model?.trim()),
    Boolean(b.division?.trim()),
    Boolean(b.origin),
    Boolean(b.mefaId?.trim()),
    Boolean(b.packageLength?.trim()),
    Boolean(b.packageWidth?.trim()),
    Boolean(b.packageHeight?.trim()),
    Boolean(b.packageWeight?.trim()),
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

type Props = {
  productId?: string | null;
  initialStep?: string | null;
  basePath?: string;
};

/**
 * Digikala ProductCreationLayout create/1 — five locked steps with ادامه / مرحله قبل.
 */
export function DigiProductCreateWizard({
  productId,
  initialStep,
  basePath = "/seller/digi/products",
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState<DigiCreateStepId>(
    parseDigiStep(initialStep),
  );
  const [draft, setDraft] = useState<SellerProductDraft | null>(null);
  const [brands, setBrands] = useState<CatalogBrandOption[]>([]);
  const [categories, setCategories] = useState<CatalogCategoryOption[]>([]);
  const [lookupsLoading, setLookupsLoading] = useState(true);
  const [brandMode, setBrandMode] = useState<"pick" | "custom">("pick");
  const [gallery, setGallery] = useState<ProductMediaItem[]>([]);
  const [specs, setSpecs] = useState<ProductSpecGroup[]>([]);
  const [attrValues, setAttrValues] = useState<Record<string, string>>({});
  const [advantageDraft, setAdvantageDraft] = useState("");
  const [disadvantageDraft, setDisadvantageDraft] = useState("");
  const [aiTokens] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<"me" | "cf">("me");
  const [uploadBusy, setUploadBusy] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const local = ensureDraft(productId ?? undefined);
    setDraft(local);
    setGallery(local.gallery);
    setSpecs(local.specs);
    const seed: Record<string, string> = {};
    for (const g of local.specs) {
      for (const a of g.attributes) {
        seed[a.id] = a.values.filter(Boolean).join("، ");
      }
    }
    setAttrValues(seed);
    setStep(parseDigiStep(initialStep));
    setLoading(false);
  }, [productId, initialStep]);

  useEffect(() => {
    let cancelled = false;
    setLookupsLoading(true);
    void Promise.all([
      listCatalogBrandOptions(),
      listCatalogCategoryOptions(),
    ]).then(([b, c]) => {
      if (cancelled) return;
      setBrands(b);
      setCategories(c);
      setLookupsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function syncUrl(id: string, next: DigiCreateStepId) {
    if (typeof window === "undefined") return;
    const path = `${basePath}/new?draft=${encodeURIComponent(id)}&step=${next}`;
    window.history.replaceState(window.history.state, "", path);
  }

  function go(next: DigiCreateStepId) {
    setStep(next);
    setError(null);
    if (draft) syncUrl(draft.id, next);
  }

  function patchBasics(
    patch: Partial<SellerProductDraft["basics"]>,
  ): SellerProductDraft | null {
    if (!draft) return null;
    const next = saveDraft({
      ...draft,
      basics: { ...draft.basics, ...patch },
    });
    setDraft(next);
    return next;
  }

  async function handleContinue() {
    if (!draft) return;
    setError(null);
    setBusy(true);
    try {
      if (step === "category") {
        if (!draft.basics.categoryId && !draft.basics.categoryName.trim()) {
          setError("لطفا یک دسته‌بندی انتخاب کنید");
          return;
        }
        setDraft(markStep(draft, "basics", "draft"));
        go("general");
        return;
      }

      if (step === "general") {
        const b = draft.basics;
        if (!b.brandName.trim()) {
          setError("برند یا نام سازنده کالا الزامی است");
          return;
        }
        if (!(b.productTypes?.length)) {
          setError("نوع کالا را انتخاب کنید");
          return;
        }
        if (!b.model?.trim()) {
          setError("مدل کالا الزامی است");
          return;
        }
        if (!b.division?.trim()) {
          setError("دسته‌بندی کالا را انتخاب کنید");
          return;
        }
        if (!b.origin) {
          setError("مبدا کالا را انتخاب کنید");
          return;
        }
        if (!b.mefaId?.trim()) {
          setError("شناسه کالا را انتخاب کنید");
          return;
        }
        if (
          !b.packageLength?.trim() ||
          !b.packageWidth?.trim() ||
          !b.packageHeight?.trim() ||
          !b.packageWeight?.trim()
        ) {
          setError("ابعاد و وزن بسته‌بندی را کامل کنید");
          return;
        }
        setDraft(markStep(draft, "basics", "draft"));
        go("specs");
        return;
      }

      if (step === "specs") {
        const fields = digiAttrFieldsForCategory(draft.basics.categoryName);
        const missing = fields.find(
          (f) => f.required && !(attrValues[f.id] ?? "").trim(),
        );
        if (missing) {
          setError(`لطفا «${missing.label}» را تکمیل کنید`);
          return;
        }
        const group: ProductSpecGroup = {
          id: `specs-${draft.basics.categoryId || "cat"}`,
          title: "مشخصات",
          previewCount: 8,
          attributes: fields.map((f) => ({
            id: f.id,
            label: f.label,
            values: (attrValues[f.id] ?? "")
              .split("،")
              .map((s) => s.trim())
              .filter(Boolean),
            unit: f.unit ?? "",
          })),
        };
        const withSpecs = saveDraft({ ...draft, specs: [group] });
        setDraft(markStep(withSpecs, "specs", "draft"));
        setSpecs([group]);
        go("title");
        return;
      }

      if (step === "title") {
        if (!draft.basics.title.trim()) {
          setError("عنوان محصول الزامی است");
          return;
        }
        const slug =
          draft.basics.slug.trim() ||
          slugifyTitle(draft.basics.title) ||
          `product-${Date.now().toString(36)}`;
        const basics = {
          ...draft.basics,
          title: draft.basics.title.trim(),
          slug: slug.toLowerCase(),
          brandId:
            draft.basics.brandId ||
            `b-${slugifyTitle(draft.basics.brandName)}`,
          brandName: draft.basics.brandName.trim(),
          categoryId:
            draft.basics.categoryId ||
            (draft.basics.categoryName
              ? `c-${slugifyTitle(draft.basics.categoryName)}`
              : ""),
          categoryName: draft.basics.categoryName.trim(),
          isPublished: false,
        };

        const created = draft.isLocalOnly
          ? await createSellerProduct(draft, basics)
          : await saveSellerProductBasics(draft, basics);

        let next = markStep({ ...created, specs }, "basics", "saved");
        if (specs.some((g) => g.attributes.some((a) => a.label.trim()))) {
          if (!next.isLocalOnly) {
            next = await saveSellerProductSpecs(next, specs);
          } else {
            next = saveDraft({ ...next, specs });
          }
          next = markStep(next, "specs", "saved");
        }

        if (draft.isLocalOnly && !next.isLocalOnly) {
          removeDraft(draft.id);
        }
        setDraft(next);
        setGallery(next.gallery);
        syncUrl(next.id, "gallery");
        setStep("gallery");
        return;
      }

      if (step === "gallery") {
        if (draft.isLocalOnly) {
          setError("ابتدا عنوان را ذخیره کنید تا محصول روی سرور ساخته شود");
          return;
        }
        const result = await saveSellerProductMedia(draft.id, gallery);
        setDraft(markStep(result, "gallery", "saved"));
        router.push(`${basePath}/${encodeURIComponent(result.id)}/manage`);
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره ناموفق بود");
    } finally {
      setBusy(false);
    }
  }

  function handleBack() {
    const prev = prevDigiStep(step);
    if (prev) go(prev);
    else router.push(`${basePath}/create/initial`);
  }

  async function handlePhotoFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploadBusy(true);
    setError(null);
    try {
      const next = [...gallery];
      for (const file of Array.from(files)) {
        const lower = file.name.toLowerCase();
        if (!lower.endsWith(".jpg") && !lower.endsWith(".jpeg")) {
          setError("فقط فرمت jpg یا JPEG مجاز است");
          continue;
        }
        if (file.size > 6 * 1024 * 1024) {
          setError("حجم هر عکس باید کمتر از ۶ مگابایت باشد");
          continue;
        }
        const asset = await uploadMediaAsset(file);
        next.push({
          id: asset.id,
          url:
            pickVariantUrl(asset, "gallery") || pickVariantUrl(asset, "card"),
          thumbUrl:
            pickVariantUrl(asset, "thumb") || pickVariantUrl(asset, "card"),
          alt: asset.originalFileName,
          isPrimary: next.length === 0,
        });
      }
      if (next.length && !next.some((x) => x.isPrimary)) {
        next[0] = { ...next[0]!, isPrimary: true };
      }
      setGallery(next);
      if (draft) {
        setDraft(saveDraft({ ...draft, gallery: next }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "آپلود ناموفق بود");
    } finally {
      setUploadBusy(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  }

  if (loading || !draft) {
    return (
      <p className="text-sm text-[var(--color-text-low-emphasis)]">
        در حال بارگذاری…
      </p>
    );
  }

  const currentIdx = digiStepIndex(step);
  const brandSelectValue =
    brandMode === "custom"
      ? CUSTOM
      : brands.some((b) => b.id === draft.basics.brandId)
        ? draft.basics.brandId
        : "";

  return (
    <div className="digi-create-flow">
      <div className="digi-create-flow__head">
        <div>
          <h1 className="digi-create-flow__title">ثبت کالا</h1>
          <p className="digi-create-flow__subtitle">
            اینجا می‌توانید کالای خود را برای فروش ثبت کنید
          </p>
        </div>
        <Link
          href={`${basePath}/create/initial`}
          className="text-xs text-[var(--color-text-low-emphasis)] hover:text-[var(--color-text-primary)]"
        >
          تغییر روش ثبت
        </Link>
      </div>

      <nav className="digi-timeline" aria-label="مراحل ثبت کالا">
        {DIGI_CREATE_STEPS.map((s, i) => {
          const state =
            i < currentIdx ? "done" : i === currentIdx ? "active" : "locked";
          const isLast = i === DIGI_CREATE_STEPS.length - 1;
          return (
            <div key={s.id} className="digi-timeline__seg">
              <button
                type="button"
                className="digi-timeline__item"
                data-state={state}
                disabled={i > currentIdx}
                onClick={() => {
                  if (i <= currentIdx) go(s.id);
                }}
              >
                <span className="digi-timeline__icon" aria-hidden>
                  {state === "done" ? (
                    <CheckIcon />
                  ) : state === "active" ? (
                    <InfoIcon />
                  ) : (
                    <LockIcon />
                  )}
                </span>
                <h6 className="digi-timeline__label">{s.title}</h6>
              </button>
              {!isLast ? (
                <div className="digi-timeline__bar" data-state={state}>
                  <div className="digi-timeline__bar-inner" />
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="digi-create-flow__card">
        {error ? (
          <p className="mb-4 rounded-lg border border-[var(--color-hint-object-error)] bg-[var(--color-bg-error)] px-3 py-2 text-sm text-[var(--color-hint-object-error)]">
            {error}
          </p>
        ) : null}

        {step === "category" ? (
          <section className="space-y-4">
            <button
              type="button"
              className="digi-create-select-row"
              onClick={() => setCategoryModalOpen(true)}
            >
              <p className="digi-create-select-row__label">
                {draft.basics.categoryPath?.trim() ||
                  draft.basics.categoryName.trim() ||
                  "لطفا یک دسته‌بندی انتخاب کنید"}
              </p>
              <span className="digi-create-select-row__action">انتخاب</span>
            </button>
            <DigiCategorySelectionModal
              open={categoryModalOpen}
              categories={categories}
              selectedId={draft.basics.categoryId}
              selectedName={draft.basics.categoryName}
              onClose={() => setCategoryModalOpen(false)}
              onConfirm={({ id, name, pathLabel }) =>
                patchBasics({
                  categoryId: id,
                  categoryName: name,
                  categoryPath: pathLabel,
                })
              }
            />
          </section>
        ) : null}

        {step === "general" ? (
          <section className="digi-general">
            <div>
              <label className="digi-general__field">
                <span className="digi-general__required">برند یا نام سازنده کالا</span>
                <select
                  className="digi-create-input"
                  value={brandSelectValue}
                  disabled={lookupsLoading}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === CUSTOM) {
                      setBrandMode("custom");
                      patchBasics({
                        brandId: "",
                        brandName: draft.basics.brandName,
                      });
                      return;
                    }
                    setBrandMode("pick");
                    const match = brands.find((b) => b.id === v);
                    patchBasics({
                      brandId: match?.id ?? "",
                      brandName: match?.name ?? "",
                    });
                  }}
                >
                  <option value="">انتخاب کنید</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                  <option value={CUSTOM}>سایر (ورود دستی)</option>
                </select>
              </label>
              {brandMode === "custom" ? (
                <input
                  className="digi-create-input mt-2"
                  value={draft.basics.brandName}
                  onChange={(e) =>
                    patchBasics({ brandName: e.target.value, brandId: "" })
                  }
                  placeholder="نام برند جدید"
                />
              ) : null}
              <button
                type="button"
                className="digi-general__text-btn"
                onClick={() => {
                  setBrandMode("custom");
                  patchBasics({ brandId: "", brandName: "" });
                }}
              >
                ثبت برند جدید
              </button>
            </div>

            <hr className="digi-general__divider" />

            <div className="digi-general__grid">
              <label className="digi-general__field">
                <span className="digi-general__required">نوع کالا</span>
                <select
                  className="digi-create-input digi-create-input--muted"
                  value={draft.basics.productTypes?.[0] ?? ""}
                  onChange={(e) =>
                    patchBasics({
                      productTypes: e.target.value ? [e.target.value] : [],
                    })
                  }
                >
                  <option value="">انتخاب کنید</option>
                  {digiProductTypesForCategory(draft.basics.categoryName).map(
                    (t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="digi-general__field">
                <span className="digi-general__required">مدل کالا</span>
                <input
                  className="digi-create-input"
                  name="model"
                  value={draft.basics.model ?? ""}
                  onChange={(e) => patchBasics({ model: e.target.value })}
                  placeholder=""
                />
              </label>

              <label className="digi-general__field">
                <span className="digi-general__required">دسته‌بندی کالا</span>
                <select
                  className="digi-create-input digi-create-input--muted"
                  value={draft.basics.division ?? ""}
                  onChange={(e) => patchBasics({ division: e.target.value })}
                >
                  <option value="">انتخاب کنید</option>
                  {digiDivisionOptions().map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>

              <label className="digi-general__field">
                <span className="digi-general__required">مبدا کالا</span>
                <select
                  className="digi-create-input digi-create-input--muted"
                  value={draft.basics.origin ?? ""}
                  onChange={(e) =>
                    patchBasics({
                      origin:
                        e.target.value === "iranian" ||
                        e.target.value === "foreign"
                          ? e.target.value
                          : "",
                    })
                  }
                >
                  <option value="">انتخاب کنید</option>
                  <option value="iranian">ایرانی</option>
                  <option value="foreign">غیرایرانی</option>
                </select>
              </label>
            </div>

            <hr className="digi-general__divider" />

            <div className="digi-general__block">
              <span className="digi-general__h5">شناسه کالا</span>
              <span className="digi-general__hint">توضیحات شناسه کالا</span>
              <div className="digi-general__radios">
                <label className="digi-general__radio">
                  <input
                    type="radio"
                    name="category_mefa_type"
                    checked={(draft.basics.mefaType ?? "general") === "general"}
                    onChange={() => patchBasics({ mefaType: "general" })}
                  />
                  <span>شناسه عمومی</span>
                </label>
                <label className="digi-general__radio">
                  <input
                    type="radio"
                    name="category_mefa_type"
                    checked={draft.basics.mefaType === "exclusive"}
                    onChange={() => patchBasics({ mefaType: "exclusive" })}
                  />
                  <span>شناسه اختصاصی</span>
                </label>
              </div>
              <label className="digi-general__field">
                <span className="digi-general__required">
                  {(draft.basics.mefaType ?? "general") === "general"
                    ? "شناسه عمومی"
                    : "شناسه اختصاصی"}
                </span>
                <select
                  className="digi-create-input digi-create-input--muted"
                  value={draft.basics.mefaId ?? ""}
                  onChange={(e) => patchBasics({ mefaId: e.target.value })}
                >
                  <option value="">انتخاب کنید</option>
                  {digiMefaOptions().map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <hr className="digi-general__divider" />

            <div className="digi-general__block">
              <span className="digi-general__h5">بسته‌بندی</span>
              <span className="digi-general__hint">
                این بخش برای انبار مهم است و به مشتری نمایش داده نمی‌شود
              </span>
              <div className="digi-general__grid digi-general__grid--pack">
                <div className="digi-general__dims">
                  <span className="digi-general__required">ابعاد بسته‌بندی</span>
                  <div className="digi-general__dims-row">
                    <label className="digi-general__dim">
                      <input
                        className="digi-create-input"
                        dir="ltr"
                        inputMode="numeric"
                        placeholder="طول"
                        value={draft.basics.packageLength ?? ""}
                        onChange={(e) =>
                          patchBasics({ packageLength: e.target.value })
                        }
                      />
                      <span>سانتی‌متر</span>
                    </label>
                    <label className="digi-general__dim">
                      <input
                        className="digi-create-input"
                        dir="ltr"
                        inputMode="numeric"
                        placeholder="عرض"
                        value={draft.basics.packageWidth ?? ""}
                        onChange={(e) =>
                          patchBasics({ packageWidth: e.target.value })
                        }
                      />
                      <span>سانتی‌متر</span>
                    </label>
                    <label className="digi-general__dim">
                      <input
                        className="digi-create-input"
                        dir="ltr"
                        inputMode="numeric"
                        placeholder="ارتفاع"
                        value={draft.basics.packageHeight ?? ""}
                        onChange={(e) =>
                          patchBasics({ packageHeight: e.target.value })
                        }
                      />
                      <span>سانتی‌متر</span>
                    </label>
                  </div>
                </div>
                <label className="digi-general__field">
                  <span className="digi-general__required">
                    وزن کالا با بسته‌بندی
                  </span>
                  <div className="digi-general__dim">
                    <input
                      className="digi-create-input"
                      dir="ltr"
                      inputMode="numeric"
                      placeholder="وزن"
                      value={draft.basics.packageWeight ?? ""}
                      onChange={(e) =>
                        patchBasics({ packageWeight: e.target.value })
                      }
                    />
                    <span>گرم</span>
                  </div>
                </label>
              </div>
            </div>

            <hr className="digi-general__divider" />

            <div className="digi-general__progress-wrap">
              <span className="digi-general__progress-title">
                اطلاعات تکمیل شده توسط شما:{" "}
                {generalCompletion(draft.basics).toLocaleString("fa-IR")}٪
              </span>
              <div className="digi-general__progressbar">
                <div
                  className="digi-general__progressbar-fill"
                  style={{ width: `${generalCompletion(draft.basics)}%` }}
                  data-empty={
                    generalCompletion(draft.basics) === 0 ? "true" : "false"
                  }
                />
              </div>
            </div>
          </section>
        ) : null}

        {step === "specs" ? (
          <section className="digi-attrs">
            <div>
              <span className="digi-attrs__title">مشخصات</span>
            </div>
            <div className="digi-attrs__grid">
              {digiAttrFieldsForCategory(draft.basics.categoryName).map(
                (field) => (
                  <label key={field.id} className="digi-attrs__field">
                    <span
                      className={
                        field.required
                          ? "digi-general__required"
                          : "digi-attrs__label"
                      }
                    >
                      {field.label}
                    </span>
                    {field.kind === "text" ? (
                      <div className="digi-attrs__input-wrap">
                        <input
                          className="digi-create-input"
                          name={`attributes.${field.id}`}
                          value={attrValues[field.id] ?? ""}
                          onChange={(e) =>
                            setAttrValues((prev) => ({
                              ...prev,
                              [field.id]: e.target.value,
                            }))
                          }
                        />
                        {field.unit ? (
                          <span className="digi-attrs__unit">{field.unit}</span>
                        ) : null}
                      </div>
                    ) : (
                      <select
                        className="digi-create-input digi-create-input--muted"
                        name={`attributes.${field.id}`}
                        value={attrValues[field.id] ?? ""}
                        onChange={(e) =>
                          setAttrValues((prev) => ({
                            ...prev,
                            [field.id]: e.target.value,
                          }))
                        }
                      >
                        <option value="">انتخاب کنید</option>
                        {(field.options ?? []).map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}
                    {field.helper ? (
                      <p className="digi-attrs__helper">{field.helper}</p>
                    ) : null}
                  </label>
                ),
              )}
            </div>
          </section>
        ) : null}

        {step === "title" ? (
          <section className="digi-title-step">
            <div>
              <div className="digi-title-step__h5">عنوان کالا</div>
              <div className="digi-title-step__lead">
                عنوان کالا توسط هوش مصنوعی و براساس مشخصات محصول و استانداردهای
                دیجی‌کالا تولید شده است.
              </div>
              <div className="digi-title-step__ai-row">
                <button
                  type="button"
                  className="digi-title-step__ai-btn"
                  onClick={() => {
                    const nature =
                      draft.basics.productTypes?.[0] ||
                      draft.basics.categoryName ||
                      "کالا";
                    const brand = draft.basics.brandName.trim() || "برند";
                    const model = draft.basics.model?.trim();
                    const titleFa = model
                      ? `${nature} ${brand} مدل ${model}`
                      : `${nature} ${brand}`;
                    const titleEn = model
                      ? `${brand} ${model} ${draft.basics.categoryName || ""}`.trim()
                      : `${brand} ${draft.basics.categoryName || ""}`.trim();
                    patchBasics({
                      title: titleFa,
                      titleEn,
                      slug: slugifyTitle(titleFa) || draft.basics.slug,
                    });
                  }}
                >
                  <AiSparkIcon />
                  تولید اطلاعات با هوش‌مصنوعی
                </button>
                <span className="digi-title-step__token">
                  <AiTokenIcon />
                  <span>{aiTokens.toLocaleString("fa-IR")}</span>
                </span>
              </div>
              <div className="digi-title-step__titles">
                <label className="digi-general__field">
                  <span className="digi-general__required">عنوان فارسی کالا</span>
                  <textarea
                    className="digi-create-textarea"
                    name="persian-manual-name"
                    rows={2}
                    value={draft.basics.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      patchBasics({
                        title,
                        slug: slugifyTitle(title) || draft.basics.slug,
                      });
                    }}
                  />
                  <p className="digi-attrs__helper">
                    ماهیت کالا + برند کالا + مدل کالا
                  </p>
                </label>
                <label className="digi-general__field">
                  <span className="digi-attrs__label">عنوان انگلیسی کالا</span>
                  <textarea
                    className="digi-create-textarea"
                    name="english-manual-name"
                    rows={2}
                    dir="ltr"
                    value={draft.basics.titleEn ?? ""}
                    onChange={(e) => patchBasics({ titleEn: e.target.value })}
                  />
                </label>
              </div>
            </div>

            <hr className="digi-general__divider" />

            <div>
              <div className="digi-title-step__h5">
                شرح و نکات کلیدی محصول (اختیاری)
              </div>
              <div className="digi-title-step__lead">
                افزودن توضیحات و جزئیات دقیق به شناخت بهتر محصول و تصمیم‌گیری
                مطمئن‌تر مشتری کمک می‌کند.
              </div>
              <div className="digi-title-step__ai-row">
                <button
                  type="button"
                  className="digi-title-step__ai-btn"
                  onClick={() => {
                    const brand = draft.basics.brandName || "این برند";
                    const model = draft.basics.model
                      ? ` مدل ${draft.basics.model}`
                      : "";
                    const cat = draft.basics.categoryName || "محصول";
                    const text = `${cat}${model} از ${brand} با کیفیت ساخت مناسب برای استفاده خانگی. مشخصات فنی مطابق استاندارد و مناسب آشپزخانه مدرن.`;
                    const next = saveDraft({
                      ...draft,
                      description: {
                        ...draft.description,
                        intro: {
                          ...draft.description.intro,
                          preview: text.slice(0, 120),
                          full: text,
                        },
                      },
                    });
                    setDraft(next);
                  }}
                >
                  <AiSparkIcon />
                  تولید اطلاعات با هوش‌مصنوعی
                </button>
                <span className="digi-title-step__token">
                  <AiTokenIcon />
                  <span>{aiTokens.toLocaleString("fa-IR")}</span>
                </span>
              </div>
              <label className="digi-general__field">
                <span className="digi-attrs__label">شرح کالا</span>
                <textarea
                  className="digi-create-textarea digi-create-textarea--desc"
                  name="description"
                  rows={3}
                  maxLength={2000}
                  value={draft.description.intro.full ?? ""}
                  onChange={(e) => {
                    const full = e.target.value;
                    const next = saveDraft({
                      ...draft,
                      description: {
                        ...draft.description,
                        intro: {
                          ...draft.description.intro,
                          full,
                          preview: full.slice(0, 120),
                        },
                      },
                    });
                    setDraft(next);
                  }}
                />
                <p className="digi-title-step__counter">
                  ۲۰۰۰ /{" "}
                  {(draft.description.intro.full?.length ?? 0).toLocaleString(
                    "fa-IR",
                  )}
                </p>
              </label>
            </div>

            <div className="digi-title-step__proscons">
              <form
                className="digi-title-step__chip-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const v = advantageDraft.trim();
                  if (!v) return;
                  patchBasics({
                    advantages: [...(draft.basics.advantages ?? []), v],
                  });
                  setAdvantageDraft("");
                }}
              >
                <label className="digi-general__field pos-relative">
                  <span className="digi-attrs__label">نکات مثبت</span>
                  <div className="digi-title-step__chip-input">
                    <input
                      className="digi-create-input"
                      value={advantageDraft}
                      onChange={(e) => setAdvantageDraft(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="digi-title-step__plus"
                      aria-label="افزودن نکته مثبت"
                    >
                      <PlusIcon />
                    </button>
                  </div>
                </label>
                <ul className="digi-title-step__chips">
                  {(draft.basics.advantages ?? []).map((a) => (
                    <li key={a}>
                      <span>{a}</span>
                      <button
                        type="button"
                        onClick={() =>
                          patchBasics({
                            advantages: (draft.basics.advantages ?? []).filter(
                              (x) => x !== a,
                            ),
                          })
                        }
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </form>

              <form
                className="digi-title-step__chip-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const v = disadvantageDraft.trim();
                  if (!v) return;
                  patchBasics({
                    disadvantages: [...(draft.basics.disadvantages ?? []), v],
                  });
                  setDisadvantageDraft("");
                }}
              >
                <label className="digi-general__field pos-relative">
                  <span className="digi-attrs__label">نکات منفی</span>
                  <div className="digi-title-step__chip-input">
                    <input
                      className="digi-create-input"
                      value={disadvantageDraft}
                      onChange={(e) => setDisadvantageDraft(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="digi-title-step__plus"
                      aria-label="افزودن نکته منفی"
                    >
                      <PlusIcon />
                    </button>
                  </div>
                </label>
                <ul className="digi-title-step__chips digi-title-step__chips--neg">
                  {(draft.basics.disadvantages ?? []).map((a) => (
                    <li key={a}>
                      <span>{a}</span>
                      <button
                        type="button"
                        onClick={() =>
                          patchBasics({
                            disadvantages: (
                              draft.basics.disadvantages ?? []
                            ).filter((x) => x !== a),
                          })
                        }
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </form>
            </div>
          </section>
        ) : null}

        {step === "gallery" ? (
          <section className="digi-photo-step">
            <div>
              <p className="digi-photo-step__h5">نوع بارگذاری عکس</p>
              <div className="digi-photo-step__radios">
                <label className="digi-general__radio">
                  <input
                    type="radio"
                    name="uploadType"
                    checked={uploadType === "me"}
                    onChange={() => setUploadType("me")}
                  />
                  <span>بارگذاری عکس توسط خودم</span>
                </label>
                <label className="digi-general__radio">
                  <input
                    type="radio"
                    name="uploadType"
                    checked={uploadType === "cf"}
                    onChange={() => setUploadType("cf")}
                  />
                  <span>درخواست عکاسی از کارخانه محتوا</span>
                </label>
              </div>
              <hr className="digi-general__divider digi-photo-step__divider" />
            </div>

            {uploadType === "cf" ? (
              <p className="digi-title-step__lead">
                درخواست عکاسی حرفه‌ای به‌زودی فعال می‌شود. فعلاً عکس را خودتان
                بارگذاری کنید.
              </p>
            ) : (
              <>
                <p className="digi-photo-step__h5">عکس‌ها</p>
                <p className="digi-title-step__lead">
                  از این بخش می‌توانید عکس‌های خود را ویرایش و نتایج آن‌ها را
                  مشاهده کنید.
                </p>
                <button type="button" className="digi-photo-step__help">
                  <HelpIcon />
                  راهنما ابزارهای هوش مصنوعی
                </button>
                <p className="digi-title-step__lead digi-photo-step__hint">
                  عکس‌ها را یا از کامپیوتر انتخاب کنید یا با درگ اند دراپ آپلود
                  کنید.
                </p>

                <div className="digi-photo-step__upload-row">
                  <button
                    type="button"
                    className="digi-photo-step__drop"
                    disabled={uploadBusy || draft.isLocalOnly}
                    onClick={() => photoInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void handlePhotoFiles(e.dataTransfer.files);
                    }}
                  >
                    <PlusIcon />
                    <span>{uploadBusy ? "در حال آپلود…" : "افزودن"}</span>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg"
                      multiple
                      className="hidden"
                      onChange={(e) => void handlePhotoFiles(e.target.files)}
                    />
                  </button>
                  <div className="digi-photo-step__rules">
                    <p>شرایط عکس:</p>
                    <ul>
                      <li>ابعاد ۶۰۰×۶۰۰ تا ۲۵۰۰×۲۵۰۰</li>
                      <li>حجم کمتر از ۶ مگابایت</li>
                      <li>بدون طرح / لوگو / متن</li>
                      <li>فرمت jpg یا JPEG</li>
                    </ul>
                  </div>
                </div>

                <p className="digi-photo-step__ai-wait">
                  <ClockIcon />
                  عملیات‌های مربوط به هوش‌مصنوعی ممکن است تا ۳۰ دقیقه زمان ببرد.
                  به محض آماده شدن تصاویر به شما اطلاع‌رسانی خواهد شد.
                </p>

                {gallery.length > 0 ? (
                  <ul className="digi-photo-step__list">
                    {gallery.map((item, index) => (
                      <li key={item.id}>
                        <div className="digi-photo-step__thumb">
                          <Image
                            src={item.thumbUrl || item.url}
                            alt={item.alt || `عکس ${index + 1}`}
                            width={96}
                            height={96}
                            unoptimized
                          />
                          {item.isPrimary ? (
                            <span className="digi-photo-step__primary">اصلی</span>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          className="digi-photo-step__remove"
                          onClick={() => {
                            const next = gallery.filter((g) => g.id !== item.id);
                            if (
                              next.length &&
                              !next.some((g) => g.isPrimary)
                            ) {
                              next[0] = { ...next[0]!, isPrimary: true };
                            }
                            setGallery(next);
                            setDraft(saveDraft({ ...draft, gallery: next }));
                          }}
                        >
                          حذف
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <hr className="digi-general__divider digi-photo-step__divider" />

                <p className="digi-photo-step__h5">
                  ساخت عکس جدید از مجموعه عکس‌ها
                </p>
                <p className="digi-title-step__lead">
                  با بارگذاری حداقل ۳ عکس امکان تولید تصاویر مکمل مانند
                  لایف‌استایل، مدلینگ یا تصاویر کاربردی بر اساس تصاویر کالا برای
                  شما فراهم می‌شود.
                </p>
                <div className="digi-photo-step__ai-actions">
                  <button
                    type="button"
                    className="digi-photo-step__ai-outline"
                    disabled={gallery.length < 3}
                    title={
                      gallery.length < 3
                        ? "حداقل ۳ عکس لازم است"
                        : "تولید اینفوگرافیک"
                    }
                  >
                    اینفوگرافیک
                    <span className="digi-title-step__token">
                      <AiTokenIcon />
                      <span>۱۵۰</span>
                    </span>
                  </button>
                </div>
              </>
            )}
          </section>
        ) : null}

        <div className="digi-create-flow__actions">
          {step === "general" ||
          step === "title" ||
          step === "specs" ||
          step === "gallery" ? (
            <button
              type="button"
              className="digi-create-flow__text"
              disabled={busy}
              onClick={() => {
                if (draft) saveDraft(draft);
                router.push(basePath);
              }}
            >
              ذخیره و خروج
            </button>
          ) : null}
          <button
            type="button"
            className="digi-create-flow__back"
            disabled={busy}
            onClick={handleBack}
          >
            مرحله قبل
          </button>
          <button
            type="button"
            className="digi-btn-primary digi-create-flow__continue"
            disabled={busy}
            onClick={() => void handleContinue()}
          >
            {busy
              ? "در حال ذخیره…"
              : step === "gallery"
                ? "ثبت و ادامه مدیریت"
                : "ادامه"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9.2 16.6 4.8 12.2l1.4-1.4 3 3 8-8 1.4 1.4z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm-7-2a2 2 0 1 1 4 0v2h-4V7zm7 12H7v-8h10v8z" />
    </svg>
  );
}

function AiSparkIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.2 4.2L17 7.5l-3.8 1.3L12 13l-1.2-4.2L7 7.5l3.8-1.3L12 2zm6 8 0.8 2.8L22 14l-3.2.8L18 18l-.8-3.2L14 14l3.2-.8L18 10zM6 14l.7 2.3L9 17l-2.3.7L6 20l-.7-2.3L3 17l2.3-.7L6 14z" />
    </svg>
  );
}

function AiTokenIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="8" fill="url(#digiAiTok)" />
      <defs>
        <linearGradient id="digiAiTok" x1="10" y1="2" x2="10" y2="18">
          <stop stopColor="#8F4AEC" />
          <stop offset="1" stopColor="#2586FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5z" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-2h2v2zm1.1-6.1-.9.9c-.5.5-.9 1-.9 2.2h-2v-.5c0-.8.3-1.5.9-2.1l1.2-1.3c.3-.3.5-.7.5-1.2a2 2 0 0 0-4 0H7a4 4 0 0 1 8 0c0 .9-.4 1.7-1.1 2.2z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 11H7v-2h4V7h2v6z" />
    </svg>
  );
}
