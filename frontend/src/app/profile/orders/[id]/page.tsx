"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { EmptyState, ProfileCard, ProfileShell } from "@/components/profile/ProfileShell";
import { formatIrt, mockOrders, orderStatusLabel } from "@/lib/mocks/profile";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const order = mockOrders.find((o) => o.id === params.id);

  if (!order) {
    return (
      <ProfileShell title="جزئیات سفارش">
        <EmptyState message="سفارش پیدا نشد." />
      </ProfileShell>
    );
  }

  return (
    <ProfileShell title="جزئیات سفارش">
      <ProfileCard className="mb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold" dir="ltr">
              {order.code}
            </p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              ثبت: {order.createdAt} · وضعیت: {orderStatusLabel[order.status]}
            </p>
            {order.trackingCode ? (
              <p className="mt-1 text-xs text-[var(--color-muted)]" dir="ltr">
                کد پیگیری: {order.trackingCode}
              </p>
            ) : null}
          </div>
          <p className="text-sm font-bold">{formatIrt(order.totalAmount)}</p>
        </div>
      </ProfileCard>

      <ProfileCard className="mb-3">
        <h2 className="mb-3 text-sm font-bold">اقلام سفارش</h2>
        <ul className="space-y-3">
          {order.items.map((item, idx) => (
            <li key={idx} className="flex items-center gap-3">
              <Image
                src={item.imageUrl}
                alt=""
                width={64}
                height={64}
                className="size-16 rounded-md object-cover"
              />
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  تعداد {item.qty.toLocaleString("fa-IR")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </ProfileCard>

      <div className="flex flex-wrap gap-3 text-sm font-medium">
        <Link href="/profile/orders" className="text-[var(--color-icon-secondary)]">
          بازگشت به سفارش‌ها
        </Link>
        {order.trackingCode ? (
          <Link
            href={`/profile/orders/${order.id}/tracking`}
            className="text-[var(--color-primary)]"
          >
            پیگیری ارسال
          </Link>
        ) : null}
      </div>
    </ProfileShell>
  );
}
