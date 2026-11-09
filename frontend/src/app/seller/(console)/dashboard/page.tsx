"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Classic portal home → product management (Digi KPI home lives at /seller/digi/dashboard). */
export default function SellerClassicDashboardRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/seller/products");
  }, [router]);

  return (
    <p className="py-10 text-center text-sm text-[var(--color-muted)]">
      در حال انتقال به مدیریت محصولات…
    </p>
  );
}
