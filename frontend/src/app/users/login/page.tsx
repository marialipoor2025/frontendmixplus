import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginFormCard } from "@/components/auth/LoginFormCard";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `ورود | ثبت‌نام`,
  description: `ورود یا ثبت‌نام در ${siteConfig.nameFa}`,
};

/**
 * Digikala-style login: identifier → OTP or password (+ forgot password).
 */
export default function LoginPage() {
  return (
    <main
      data-auth-page
      className="flex min-h-dvh flex-col items-center justify-center bg-white px-4 py-8 font-sans"
    >
      <Suspense fallback={null}>
        <LoginFormCard />
      </Suspense>
    </main>
  );
}
