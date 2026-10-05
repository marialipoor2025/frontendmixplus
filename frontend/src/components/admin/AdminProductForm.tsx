"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ProductCard } from "@/components/home/ProductCard";
import {
  AdminButton,
  AdminCard,
  AdminOutlineButton,
} from "@/components/admin/AdminUi";
import type {
  AdminBrandOption,
  AdminProduct,
  AdminSellerOption,
  ProductMediaItem,
  UpsertAdminProductInput,
} from "@/types/admin-product";
import type { ProductBadge } from "@/types/product";
import { ProductMediaManager } from "@/components/admin/ProductMediaManager";

type Props = {
  mode: "create" | "edit";
  initial?: AdminProduct;
  brands: AdminBrandOption[];
  sellers: AdminSellerOption[];
  categories?: { id: string; name: string }[];
  submitting?: boolean;
  error?: string | null;
  onSubmit: (input: UpsertAdminProductInput) => Promise<void> | void;
  onCancel: () => void;
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06FF-]/g, "")
    .replace(/-+/g, "-");
}

const BADGE_OPTIONS: { id: ProductBadge; label: string }[] = [
  { id: "mixplus-choice", label: "انتخاب میکس‌پلاس" },
  { id: "opportunity", label: "فرصت خرید" },
];

export function AdminProductForm({
  mode,
  initial,
  brands,
  sellers,
  categories = [],
  submitting,
  error,
  onSubmit,
  onCancel,
}: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [imageUrl, setImageUrl] = useState(
    initial?.imageUrl ?? "/placeholders/product-appliance.png",
  );
  const [gallery, setGallery] = useState<ProductMediaItem[]>(
    initial?.gallery?.length
      ? initial.gallery
      : initial?.imageUrl
        ? [
            {
              id: "primary",
              url: initial.imageUrl,
              thumbUrl: initial.imageUrl,
              alt: initial.title,
              isPrimary: true,
            },
          ]
        : [],
  );
  const [brandId, setBrandId] = useState(initial?.brandId ?? brands[0]?.id ?? "");
  const [sellerId, setSellerId] = useState(
    initial?.sellerId ?? sellers[0]?.id ?? "",
  );
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [priceAmount, setPriceAmount] = useState(String(initial?.price.amount ?? ""));
  const [originalAmount, setOriginalAmount] = useState(
    initial?.originalPrice ? String(initial.originalPrice.amount) : "",
  );
  const [discountPercent, setDiscountPercent] = useState(
    initial?.discountPercent != null ? String(initial.discountPercent) : "",
  );
  const [rating, setRating] = useState(
    initial?.rating != null ? String(initial.rating) : "",
  );
  const [reviewCount, setReviewCount] = useState(
    initial?.reviewCount != null ? String(initial.reviewCount) : "",
  );
  const [condition, setCondition] = useState<"new" | "used">(
    initial?.condition === "used" ? "used" : "new",
  );
  const [inStock, setInStock] = useState(initial?.inStock ?? true);
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);
  const [badges, setBadges] = useState<ProductBadge[]>(initial?.badges ?? []);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  function handleGalleryChange(next: ProductMediaItem[]) {
    setGallery(next);
    const primary = next.find((x) => x.isPrimary) ?? next[0];
    setImageUrl(primary?.url ?? "/placeholders/product-appliance.png");
  }

  const brand = brands.find((b) => b.id === brandId) ?? brands[0];
  const seller = sellers.find((s) => s.id === sellerId) ?? sellers[0];

  const preview: AdminProduct = useMemo(
    () => ({
      id: initial?.id ?? "preview",
      title: title || "عنوان محصول",
      slug: slug || "product-slug",
      imageUrl: imageUrl || "/placeholders/product-appliance.png",
      gallery,
      brandId: brand?.id ?? "",
      brandName: brand?.name ?? "برند",
      brandLogoUrl: brand?.logoUrl || undefined,
      sellerId: seller?.id ?? "",
      sellerName: seller?.name ?? "فروشنده",
      price: {
        amount: Number(priceAmount) || 0,
        currency: "IRT",
      },
      originalPrice: originalAmount
        ? { amount: Number(originalAmount) || 0, currency: "IRT" }
        : undefined,
      discountPercent: discountPercent ? Number(discountPercent) : undefined,
      rating: rating ? Number(rating) : undefined,
      reviewCount: reviewCount ? Number(reviewCount) : undefined,
      badges: badges.length ? badges : undefined,
      condition,
      inStock,
      isPublished,
    }),
    [
      initial?.id,
      title,
      slug,
      imageUrl,
      gallery,
      brand,
      seller,
      priceAmount,
      originalAmount,
      discountPercent,
      rating,
      reviewCount,
      badges,
      condition,
      inStock,
      isPublished,
    ],
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!brand || !seller) return;
    await onSubmit({
      id: initial?.id,
      title: title.trim(),
      slug: slug.trim(),
      imageUrl: imageUrl.trim() || "/placeholders/product-appliance.png",
      mediaIds: gallery.map((g) => g.id),
      gallery,
      brandId: brand.id,
      brandName: brand.name,
      brandLogoUrl: brand.logoUrl || undefined,
      sellerId: seller.id,
      sellerName: seller.name,
      categoryId: categoryId || null,
      price: { amount: Number(priceAmount), currency: "IRT" },
      originalPrice: originalAmount
        ? { amount: Number(originalAmount), currency: "IRT" }
        : null,
      discountPercent: discountPercent ? Number(discountPercent) : null,
      rating: rating ? Number(rating) : null,
      reviewCount: reviewCount ? Number(reviewCount) : null,
      badges: badges.length ? badges : null,
      condition,
      inStock,
      isPublished,
    });
  }

  function toggleBadge(id: ProductBadge) {
    setBadges((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
    );
  }

  const fieldClass =
    "w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-neutral-650)]";
  const labelClass = "mb-1.5 block text-xs font-medium text-[var(--color-muted)]";

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
      <AdminCard>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className={labelClass}>عنوان (همان کارت صفحه اصلی)</span>
            <input
              className={fieldClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
          <label>
            <span className={labelClass}>اسلاگ</span>
            <input
              className={fieldClass}
              dir="ltr"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              required
            />
          </label>
          <div className="sm:col-span-2">
            <ProductMediaManager items={gallery} onChange={handleGalleryChange} />
          </div>
          <label>
            <span className={labelClass}>آدرس تصویر اصلی (در صورت نیاز دستی)</span>
            <input
              className={fieldClass}
              dir="ltr"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </label>
          <label>
            <span className={labelClass}>برند</span>
            <select
              className={fieldClass}
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              required
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={labelClass}>فروشنده</span>
            <select
              className={fieldClass}
              value={sellerId}
              onChange={(e) => setSellerId(e.target.value)}
              required
            >
              {sellers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={labelClass}>دسته‌بندی</span>
            <select
              className={fieldClass}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">— بدون دسته —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={labelClass}>قیمت (تومان)</span>
            <input
              className={fieldClass}
              dir="ltr"
              inputMode="numeric"
              value={priceAmount}
              onChange={(e) => setPriceAmount(e.target.value)}
              required
            />
          </label>
          <label>
            <span className={labelClass}>قیمت قبل از تخفیف</span>
            <input
              className={fieldClass}
              dir="ltr"
              inputMode="numeric"
              value={originalAmount}
              onChange={(e) => setOriginalAmount(e.target.value)}
            />
          </label>
          <label>
            <span className={labelClass}>درصد تخفیف</span>
            <input
              className={fieldClass}
              dir="ltr"
              inputMode="numeric"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
            />
          </label>
          <label>
            <span className={labelClass}>امتیاز</span>
            <input
              className={fieldClass}
              dir="ltr"
              inputMode="decimal"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
          </label>
          <label>
            <span className={labelClass}>تعداد دیدگاه</span>
            <input
              className={fieldClass}
              dir="ltr"
              inputMode="numeric"
              value={reviewCount}
              onChange={(e) => setReviewCount(e.target.value)}
            />
          </label>
          <label>
            <span className={labelClass}>وضعیت کالا</span>
            <select
              className={fieldClass}
              value={condition}
              onChange={(e) => setCondition(e.target.value as "new" | "used")}
            >
              <option value="new">نو</option>
              <option value="used">کارکرده</option>
            </select>
          </label>
          <div className="sm:col-span-2">
            <span className={labelClass}>برچسب‌ها</span>
            <div className="flex flex-wrap gap-2">
              {BADGE_OPTIONS.map((opt) => {
                const active = badges.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleBadge(opt.id)}
                    className={[
                      "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                      active
                        ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                        : "border-[var(--color-border)] text-[var(--color-neutral-700)]",
                    ].join(" ")}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
            />
            موجود در انبار
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            منتشر شده (نمایش در فروشگاه)
          </label>
        </div>

        {error ? (
          <p className="mt-4 text-xs font-medium text-[var(--dk-text-error)]">{error}</p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <AdminButton type="submit" disabled={submitting}>
            {submitting
              ? "در حال ذخیره…"
              : mode === "create"
                ? "ایجاد محصول"
                : "ذخیره تغییرات"}
          </AdminButton>
          <AdminOutlineButton type="button" onClick={onCancel} disabled={submitting}>
            انصراف
          </AdminOutlineButton>
        </div>
      </AdminCard>

      <div className="space-y-3">
        <p className="text-xs font-medium text-[var(--color-muted)]">
          پیش‌نمایش کارت صفحه اصلی
        </p>
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-3">
          <ProductCard product={preview} />
        </div>
      </div>
    </form>
  );
}
