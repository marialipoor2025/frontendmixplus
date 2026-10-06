"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoginFormCard } from "@/components/auth/LoginFormCard";
import { useAdminAuth } from "@/lib/admin/useAdminAuth";

/** Admin console login — same OTP Identity flow as storefront/seller. */
export function AdminLoginForm() {
  const router = useRouter();
  const { ready, isAuthenticated } = useAdminAuth();

  useEffect(() => {
    if (ready && isAuthenticated) {
      router.replace("/admin");
    }
  }, [ready, isAuthenticated, router]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-4 py-10">
      <LoginFormCard
        mode="admin"
        defaultReturnUrl="/admin"
        title="ورود به پنل مدیریت"
        subtitle="با شماره موبایل و کد یک‌بارمصرف وارد شوید"
      />
    </div>
  );
}
