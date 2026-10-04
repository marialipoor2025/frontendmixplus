"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { hasPermission } from "@/lib/admin/permissions";
import { useAdminAuth } from "@/lib/admin/useAdminAuth";
import type { AdminPermission } from "@/types/admin";

export function RequireAdmin({
  children,
  permission,
}: {
  children: ReactNode;
  permission?: AdminPermission;
}) {
  const { ready, isAuthenticated, user } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace("/admin/login");
    }
  }, [ready, isAuthenticated, router]);

  if (!ready || !isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4 text-sm text-[var(--color-muted)]">
        در حال بررسی دسترسی مدیر…
      </div>
    );
  }

  if (permission && !hasPermission(user?.permissions, permission)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-base font-bold text-[var(--color-neutral-900)]">
          دسترسی مجاز نیست
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          نقش شما اجازه مشاهده این بخش را ندارد.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
