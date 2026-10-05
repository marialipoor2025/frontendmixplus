"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { AdminPageHeader } from "@/components/admin/AdminUi";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import {
  getAdminProduct,
  listAdminBrands,
  listAdminSellers,
  updateAdminProduct,
} from "@/lib/api/admin/products";
import { listAdminCategories } from "@/lib/api/categories";
import type {
  AdminBrandOption,
  AdminProduct,
  AdminSellerOption,
} from "@/types/admin-product";

export default function AdminEditProductPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [brands, setBrands] = useState<AdminBrandOption[]>([]);
  const [sellers, setSellers] = useState<AdminSellerOption[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getAdminProduct(id),
      listAdminBrands(),
      listAdminSellers(),
      listAdminCategories(),
    ])
      .then(([p, b, s, c]) => {
        setProduct(p);
        setBrands(b);
        setSellers(s);
        setCategories((c ?? []).map((x) => ({ id: x.id, name: x.name })));
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "بارگذاری ناموفق بود"),
      )
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <RequireAdmin permission="products:manage">
      <AdminPageHeader
        title="ویرایش محصول"
        description={product ? product.title : "…"}
      />
      {loading ? (
        <p className="text-sm text-[var(--color-muted)]">در حال بارگذاری…</p>
      ) : !product ? (
        <p className="text-sm text-[var(--dk-text-error)]">{error ?? "محصول یافت نشد"}</p>
      ) : (
        <>
          {notice ? (
            <p className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              {notice}
            </p>
          ) : null}
          <AdminProductForm
            mode="edit"
            initial={product}
            brands={brands}
            sellers={sellers}
            categories={categories}
            submitting={submitting}
            error={error}
            onCancel={() => router.push("/admin/products")}
            onSubmit={async (input) => {
              setSubmitting(true);
              setError(null);
              setNotice(null);
              try {
                const updated = await updateAdminProduct(id, input);
                setProduct(updated);
                setNotice("تغییرات ذخیره شد");
              } catch (err) {
                setError(err instanceof Error ? err.message : "ذخیره ناموفق بود");
              } finally {
                setSubmitting(false);
              }
            }}
          />
        </>
      )}
    </RequireAdmin>
  );
}
