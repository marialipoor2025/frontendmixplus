import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginFormCard } from "@/components/auth/LoginFormCard";

export const metadata: Metadata = {
  title: "ورود فروشنده",
};

export default function SellerLoginPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-8">
      <div className="mb-6 text-center">
        <p className="text-lg font-black text-[var(--color-neutral-900)]">
          پنل فروشنده میکس‌پلاس
        </p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          با شماره موبایل وارد شوید؛ کد یک‌بارمصرف پیامک می‌شود
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-[var(--color-muted)]">در حال بارگذاری…</p>}>
        <LoginFormCard
          mode="seller"
          defaultReturnUrl="/seller/dashboard"
          title="ورود فروشنده"
          subtitle="شماره موبایل فروشنده را وارد کنید"
        />
      </Suspense>
    </div>
  );
}
