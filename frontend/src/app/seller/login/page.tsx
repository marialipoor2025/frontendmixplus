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
          با موبایل یا ایمیل وارد شوید؛ سپس در صورت نیاز فروشگاه بسازید
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-[var(--color-muted)]">در حال بارگذاری…</p>}>
        <LoginFormCard
          mode="seller"
          defaultReturnUrl="/seller/dashboard"
          title="ورود یا ثبت‌نام فروشنده"
          subtitle="شماره موبایل یا ایمیل خود را وارد کنید — هر فروشنده‌ای می‌تواند شروع کند"
        />
      </Suspense>
    </div>
  );
}
