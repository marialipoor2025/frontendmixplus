"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ProductWizard } from "@/components/seller/wizard/ProductWizard";

function DigiManageProductWizard() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const productId = decodeURIComponent(params.id ?? "");
  const step = searchParams.get("step");

  return (
    <ProductWizard
      mode="edit"
      productId={productId}
      initialStep={step}
      basePath="/seller/digi/products"
    />
  );
}

export default function DigiSellerManageProductPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-[var(--digi-muted)]">در حال بارگذاری…</p>
      }
    >
      <DigiManageProductWizard />
    </Suspense>
  );
}
