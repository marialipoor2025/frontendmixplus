import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div data-admin-page data-auth-page>
      <Suspense
        fallback={
          <p className="p-8 text-center text-sm text-[var(--color-muted)]">
            در حال بارگذاری…
          </p>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
