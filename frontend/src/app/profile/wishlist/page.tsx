"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { EmptyState, ProfileCard, ProfileShell } from "@/components/profile/ProfileShell";
import { formatIrt, mockWishlist } from "@/lib/mocks/profile";
import type { Product } from "@/types/product";

export default function WishlistPage() {
  const [items, setItems] = useState<Product[]>(mockWishlist);

  return (
    <ProfileShell title="علاقه‌مندی‌ها">
      {items.length === 0 ? (
        <EmptyState message="لیست علاقه‌مندی‌های شما خالی است." />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((product) => (
            <li key={product.id}>
              <ProfileCard className="h-full">
                <div className="flex gap-3">
                  <Image
                    src={product.imageUrl}
                    alt=""
                    width={72}
                    height={72}
                    className="size-[72px] rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium">{product.title}</p>
                    <p className="mt-2 text-sm font-bold">
                      {formatIrt(product.price.amount)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-3 text-xs font-medium">
                  <Link href={`/products/${product.slug}`} className="text-[var(--color-icon-secondary)]">
                    مشاهده
                  </Link>
                  <button
                    type="button"
                    className="text-[var(--color-primary)]"
                    onClick={() => setItems((list) => list.filter((p) => p.id !== product.id))}
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
