import type { ReactNode } from "react";
import { MainNav } from "@/components/layout/MainNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StickyHeaderShell } from "@/components/layout/StickyHeaderShell";
import type { MainNavData } from "@/types/nav";

type StaticInfoPageProps = {
  nav: MainNavData;
  title: string;
  description?: string;
  children?: ReactNode;
};

/** Shared shell for footer / CMS-style informational pages. */
export function StaticInfoPage({
  nav,
  title,
  description,
  children,
}: StaticInfoPageProps) {
  return (
    <>
      <StickyHeaderShell>
        <SiteHeader />
        <MainNav data={nav} />
      </StickyHeaderShell>

      <div className="site-container flex-1 py-8">
        <article className="mx-auto max-w-3xl">
          <h1 className="mb-3 text-xl font-bold text-[var(--color-neutral-900)] lg:text-2xl">
            {title}
          </h1>
          {description ? (
            <p className="mb-6 text-sm leading-7 text-[var(--color-neutral-600)] lg:text-base">
              {description}
            </p>
          ) : null}
          {children ?? (
            <p className="rounded-xl border border-dashed border-[var(--color-border)] px-4 py-10 text-center text-sm text-[var(--color-muted)]">
              محتوای این صفحه به‌زودی تکمیل می‌شود.
            </p>
          )}
        </article>
      </div>

      <SiteFooter />
    </>
  );
}
