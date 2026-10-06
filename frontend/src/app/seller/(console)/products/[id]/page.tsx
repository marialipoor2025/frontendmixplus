"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

/** Legacy gallery URL → full PDP-section wizard. */
export default function SellerProductLegacyRedirect() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = decodeURIComponent(params.id ?? "");

  useEffect(() => {
    if (!id) return;
    router.replace(
      `/seller/products/${encodeURIComponent(id)}/manage?step=gallery`,
    );
  }, [id, router]);

  return (
    <p className="text-sm text-[var(--color-muted)]">در حال انتقال به مدیریت محصول…</p>
  );
}
