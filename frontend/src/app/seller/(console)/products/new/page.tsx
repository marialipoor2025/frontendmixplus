"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ProductWizard } from "@/components/seller/wizard/ProductWizard";

function NewProductWizard() {
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draft");
  const step = searchParams.get("step");

  return (
    <ProductWizard
      mode="create"
      productId={draftId ?? undefined}
      initialStep={step}
    />
  );
}

export default function SellerNewProductPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-[var(--color-muted)]">در حال بارگذاری…</p>
      }
    >
      <NewProductWizard />
    </Suspense>
  );
}
