"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { AdminPageHeader } from "@/components/admin/AdminUi";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import {
  createAdminProduct,
  listAdminBrands,
  listAdminSellers,
} from "@/lib/api/admin/products";
import { listAdminCategories } from "@/lib/api/categories";
import type { AdminBrandOption, AdminSellerOption } from "@/types/admin-product";

export default function AdminNewProductPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<AdminBrandOption[]>([]);
  const [sellers, setSellers] = useState<AdminSellerOption[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      listAdminBrands(),
      listAdminSellers(),
      listAdminCategories(),
    ])
      .then(([b, s, c]) => {
        setBrands(b);
        setSellers(s);
        setCategories((c ?? []).map((x) => ({ id: x.id, name: x.name })));
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "بارگذاری فرم ناموفق بود"),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <RequireAdmin permission="products:manage">
      <AdminPageHeader
        title="محصول جدید"
        description="فیلدها مطابق کارت محصول صفحه اصلی هستند"
      />
      {loading ? (
        <p className="text-sm text-[var(--color-muted)]">در حال آماده‌سازی فرم…</p>
      ) : brands.length === 0 || sellers.length === 0 ? (
        <p className="text-sm text-[var(--dk-text-error)]">
          ابتدا برند و فروشنده در سیستم باید موجود باشد.
        </p>
      ) : (
        <AdminProductForm
          mode="create"
          brands={brands}
          sellers={sellers}
          categories={categories}
          submitting={submitting}
          error={error}
          onCancel={() => router.push("/admin/products")}
          onSubmit={async (input) => {
            setSubmitting(true);
            setError(null);
            try {
              const created = await createAdminProduct(input);
              router.replace(`/admin/products/${created.id}`);
            } catch (err) {
              setError(err instanceof Error ? err.message : "ایجاد ناموفق بود");
              setSubmitting(false);
            }
          }}
        />
      )}
    </RequireAdmin>
  );
}
