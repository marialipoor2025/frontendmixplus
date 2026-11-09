"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { DigiProductCreateWizard } from "@/components/seller/digi/DigiProductCreateWizard";

function DigiNewProductCreate() {
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draft");
  const step = searchParams.get("step");

  return (
    <DigiProductCreateWizard
      productId={draftId}
      initialStep={step}
      basePath="/seller/digi/products"
    />
  );
}

export default function DigiSellerNewProductPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-[var(--digi-muted)]">در حال بارگذاری…</p>
      }
    >
      <DigiNewProductCreate />
    </Suspense>
  );
}
