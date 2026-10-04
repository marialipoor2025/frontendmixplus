"use client";

import { useState } from "react";
import { EmptyState, ProfileCard, ProfileShell } from "@/components/profile/ProfileShell";
import { mockNotifications, type ProfileNotification } from "@/lib/mocks/profile";

export default function NotificationsPage() {
  const [items, setItems] = useState<ProfileNotification[]>(mockNotifications);

  function markRead(id: string) {
    setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  return (
    <ProfileShell title="پیام‌ها">
      {items.length === 0 ? (
        <EmptyState message="پیامی ندارید." />
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li key={n.id}>
              <ProfileCard className={n.read ? "" : "shadow-[0_0_0_1px_rgb(237_25_68_/_0.25)]"}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">
                      {n.title}
                      {!n.read ? (
                        <span className="ms-2 rounded bg-[var(--color-primary-soft)] px-1.5 py-0.5 text-[10px] text-[var(--color-primary)]">
                          جدید
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-sm leading-7 text-[var(--color-neutral-700)]">
                      {n.body}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">{n.createdAt}</p>
                  </div>
                  {!n.read ? (
                    <button
                      type="button"
                      onClick={() => markRead(n.id)}
                      className="shrink-0 text-xs font-medium text-[var(--color-icon-secondary)]"
                    >
                      خواندم
                    </button>
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
