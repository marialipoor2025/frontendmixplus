"use client";

import { EmptyState, ProfileCard, ProfileShell } from "@/components/profile/ProfileShell";
import { mockReviews } from "@/lib/mocks/profile";

export default function ReviewsPage() {
  return (
    <ProfileShell title="دیدگاه‌ها">
      {mockReviews.length === 0 ? (
        <EmptyState message="هنوز دیدگاهی ثبت نکرده‌اید." />
      ) : (
        <ul className="space-y-3">
          {mockReviews.map((review) => (
            <li key={review.id}>
              <ProfileCard>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold">{review.productTitle}</p>
                  <p className="text-xs text-[var(--color-muted)]">{review.createdAt}</p>
                </div>
                <p className="mt-1 text-xs font-medium text-[var(--color-warning)]">
                  امتیاز: {review.rating.toLocaleString("fa-IR")} از ۵
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-neutral-700)]">
                  {review.body}
                </p>
              </ProfileCard>
            </li>
          ))}
        </ul>
      )}
    </ProfileShell>
  );
}
