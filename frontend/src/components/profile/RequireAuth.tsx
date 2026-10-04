"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth/useAuth";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { ready, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace("/users/login");
    }
  }, [ready, isAuthenticated, router]);

  if (!ready || !isAuthenticated) {
    return (
      <div className="site-container flex min-h-[40vh] items-center justify-center py-16 text-sm text-[var(--color-muted)]">
        در حال بررسی ورود…
      </div>
    );
  }

  return <>{children}</>;
}
