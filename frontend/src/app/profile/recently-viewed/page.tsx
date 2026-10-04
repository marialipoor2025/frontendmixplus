"use client";

import Image from "next/image";
import Link from "next/link";
import { EmptyState, ProfileCard, ProfileShell } from "@/components/profile/ProfileShell";
import { formatIrt, mockRecentlyViewed } from "@/lib/mocks/profile";

export default function RecentlyViewedPage() {
  return (
    <ProfileShell title="بازدیدهای اخیر">
      {mockRecentlyViewed.length === 0 ? (
        <EmptyState message="هنوز محصولی بازدید نکرده‌اید." />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {mockRecentlyViewed.map((product) => (
            <li key={product.id}>
              <ProfileCard className="h-full">
                <Image
                  src={product.imageUrl}
                  alt=""
                  width={240}
                  height={160}
                  className="h-36 w-full rounded-md object-cover"
                />
                <p className="mt-3 line-clamp-2 text-sm font-medium">{product.title}</p>
                <p className="mt-2 text-sm font-bold">{formatIrt(product.price.amount)}</p>
                <Link
                  href={`/products/${product.slug}`}
                  className="mt-3 inline-block text-xs font-medium text-[var(--color-icon-secondary)]"
                >
                  مشاهده مجدد
                </Link>
              </ProfileCard>
            </li>
          ))}
        </ul>
      )}
    </ProfileShell>
  );
}
