"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { EmptyState, ProfileCard, ProfileShell } from "@/components/profile/ProfileShell";
import { mockOrders } from "@/lib/mocks/profile";

export default function OrderTrackingPage() {
  const params = useParams<{ id: string }>();
  const order = mockOrders.find((o) => o.id === params.id);

  if (!order?.trackingSteps?.length) {
    return (
      <ProfileShell title="پیگیری مرسوله">
        <EmptyState message="اطلاعات پیگیری برای این سفارش موجود نیست." />
      </ProfileShell>
    );
  }

  return (
    <ProfileShell title="پیگیری مرسوله">
      <ProfileCard className="mb-3">
        <p className="text-sm font-bold" dir="ltr">
          {order.code}
        </p>
        {order.trackingCode ? (
          <p className="mt-1 text-xs text-[var(--color-muted)]" dir="ltr">
            کد مرسوله: {order.trackingCode}
          </p>
        ) : null}
      </ProfileCard>

      <ProfileCard>
        <ol className="space-y-4">
          {order.trackingSteps.map((step, idx) => (
            <li key={idx} className="flex gap-3">
              <span
                className={[
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white",
                  step.done
                    ? "bg-gradient-to-l from-[#1672dd] to-[#ed1944]"
                    : "bg-[var(--color-neutral-300)]",
                ].join(" ")}
              >
                {(idx + 1).toLocaleString("fa-IR")}
              </span>
              <div>
                <p
                  className={[
                    "text-sm font-medium",
                    step.done
                      ? "text-[var(--color-neutral-900)]"
                      : "text-[var(--color-muted)]",
                  ].join(" ")}
                >
                  {step.title}
                </p>
                {step.at ? (
                  <p className="mt-0.5 text-xs text-[var(--color-muted)]">{step.at}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </ProfileCard>

      <Link
        href={`/profile/orders/${order.id}`}
        className="mt-4 inline-block text-sm font-medium text-[var(--color-icon-secondary)]"
      >
        بازگشت به جزئیات سفارش
      </Link>
    </ProfileShell>
  );
}
