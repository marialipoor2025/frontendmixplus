"use client";

import Image from "next/image";
import Link from "next/link";
import { EmptyState, ProfileCard, ProfileShell } from "@/components/profile/ProfileShell";
import { formatIrt, mockOrders, orderStatusLabel } from "@/lib/mocks/profile";

export default function OrdersPage() {
  return (
    <ProfileShell title="سفارش‌ها">
      {mockOrders.length === 0 ? (
        <EmptyState message="هنوز سفارشی ثبت نکرده‌اید." />
      ) : (
        <ul className="space-y-3">
          {mockOrders.map((order) => (
            <li key={order.id}>
              <ProfileCard>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-neutral-100)] pb-3">
                  <div>
                    <p className="text-sm font-bold" dir="ltr">
                      {order.code}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      {order.createdAt} · {orderStatusLabel[order.status]}
                    </p>
                  </div>
                  <p className="text-sm font-bold">{formatIrt(order.totalAmount)}</p>
                </div>
                <ul className="mt-3 space-y-2">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm">
                      <Image
                        src={item.imageUrl}
                        alt=""
                        width={48}
                        height={48}
                        className="size-12 rounded-md object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{item.title}</p>
                        <p className="text-xs text-[var(--color-muted)]">
                          تعداد: {item.qty.toLocaleString("fa-IR")}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium">
                  <Link
                    href={`/profile/orders/${order.id}`}
                    className="text-[var(--color-icon-secondary)]"
                  >
                    جزئیات سفارش
                  </Link>
                  {order.trackingCode ? (
                    <Link
                      href={`/profile/orders/${order.id}/tracking`}
                      className="text-[var(--color-primary)]"
                    >
                      پیگیری مرسوله
                    </Link>
                  ) : null}
                </div>
              </ProfileCard>
            </li>
          ))}
        </ul>
      )}
    </ProfileShell>
  );
}
