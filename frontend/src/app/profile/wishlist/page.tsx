"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { EmptyState, ProfileCard, ProfileShell } from "@/components/profile/ProfileShell";
import {
  listWishlist,
  removeFromWishlist,
  type WishlistItemDto,
} from "@/lib/api/wishlist";
import { useAuth } from "@/lib/auth/useAuth";

function formatIrt(amount: number): string {
  return `${new Intl.NumberFormat("fa-IR").format(amount)} تومان`;
}

export default function WishlistPage() {
  const { ready, isAuthenticated } = useAuth();
  const [items, setItems] = useState<WishlistItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await listWishlist();
      setItems(rows);
    } catch {
      setError("بارگذاری علاقه‌مندی‌ها ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!ready) return;
    void refresh();
  }, [ready, refresh]);

  async function remove(slug: string) {
    try {
      await removeFromWishlist(slug);
      setItems((list) => list.filter((p) => p.productSlug !== slug));
    } catch {
      setError("حذف از علاقه‌مندی‌ها ناموفق بود.");
    }
  }

  return (
    <ProfileShell title="علاقه‌مندی‌ها">
      {loading ? (
        <p className="py-8 text-center text-sm text-[var(--color-muted)]">
          در حال بارگذاری…
        </p>
      ) : error ? (
        <EmptyState message={error} />
      ) : items.length === 0 ? (
        <EmptyState message="لیست علاقه‌مندی‌های شما خالی است." />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((product) => (
            <li key={product.id}>
              <ProfileCard className="h-full">
                <div className="flex gap-3">
                  <Image
                    src={product.imageUrl || "/placeholders/product-appliance.png"}
                    alt=""
                    width={72}
                    height={72}
                    className="size-[72px] rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium">
                      {product.title}
                    </p>
                    <p className="mt-2 text-sm font-bold">
                      {formatIrt(product.price.amount)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-3 text-xs font-medium">
                  <Link
                    href={`/product/${product.productSlug}`}
                    className="text-[var(--color-icon-secondary)]"
                  >
                    مشاهده
                  </Link>
                  <button
                    type="button"
                    className="cursor-pointer text-[var(--color-primary)]"
                    onClick={() => void remove(product.productSlug)}
                  >
                    حذف
                  </button>
                </div>
              </ProfileCard>
            </li>
          ))}
        </ul>
      )}
    </ProfileShell>
  );
}
