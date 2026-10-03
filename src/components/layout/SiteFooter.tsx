import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-white">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-2 px-4 py-8 text-sm text-[var(--color-muted)] md:px-6">
        <p className="font-semibold text-[var(--color-text)]">{siteConfig.name}</p>
        <p>{siteConfig.description}</p>
        <p className="pt-2">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
