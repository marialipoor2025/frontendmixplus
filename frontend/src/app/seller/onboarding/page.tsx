"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SellerOnboarding } from "@/components/seller/SellerOnboarding";
import { tryGetSellerMe } from "@/lib/api/seller";
import { getAccessToken, getSessionUser } from "@/lib/auth/session";
import { useAuth } from "@/lib/auth/useAuth";

export default function SellerOnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, ready } = useAuth();
  const [checking, setChecking] = useState(true);
  const [defaultShopName, setDefaultShopName] = useState("");

  useEffect(() => {
    if (!ready) return;

    if (!isAuthenticated || !getAccessToken()) {
      router.replace("/seller/login?returnUrl=/seller/onboarding");
      return;
    }

    let cancelled = false;
    void tryGetSellerMe()
      .then((me) => {
        if (cancelled) return;
        if (me) {
          router.replace("/seller/digi/dashboard");
          return;
        }
        const sessionUser = getSessionUser();
        const hint =
          sessionUser?.displayName?.replace(/\*/g, "").trim() ||
          sessionUser?.phone ||
          sessionUser?.email ||
          "";
        if (hint.length >= 2) {
          setDefaultShopName(`فروشگاه ${hint}`);
        }
        setChecking(false);
      })
      .catch(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ready, isAuthenticated, router]);

  if (!ready || checking) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-[var(--color-muted)]">
        در حال آماده‌سازی ثبت‌نام فروشنده…
      </div>
    );
  }

  return <SellerOnboarding defaultShopName={defaultShopName} />;
}
