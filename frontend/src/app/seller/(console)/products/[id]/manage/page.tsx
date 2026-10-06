"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ProductWizard } from "@/components/seller/wizard/ProductWizard";

function ManageProductWizard() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const productId = decodeURIComponent(params.id ?? "");
  const step = searchParams.get("step");

  return (
    <ProductWizard mode="edit" productId={productId} initialStep={step} />
  );
}

export default function SellerManageProductPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-[var(--color-muted)]">در حال بارگذاری…</p>
      }
    >
      <ManageProductWizard />
    </Suspense>
  );
}
