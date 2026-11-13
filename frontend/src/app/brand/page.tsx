import Link from "next/link";
import { MainNav } from "@/components/layout/MainNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StickyHeaderShell } from "@/components/layout/StickyHeaderShell";
import { getBrands } from "@/lib/api/catalog";
import { getMainNavData } from "@/lib/api/nav";
import { SHOWCASE_BRANDS } from "@/lib/showcase-brands";
import type { Brand } from "@/types/brand";

export const metadata = { title: "برندها" };

function mergeBrandLists(apiBrands: Brand[], showcase: Brand[]): Brand[] {
  const bySlug = new Map<string, Brand>();

  for (const brand of apiBrands) {
    const slug = brand.slug?.trim().toLowerCase();
    if (!slug) continue;
    bySlug.set(slug, brand);
  }

  // Curated logos win; ensure every showcase brand appears on the brands page.
  for (const brand of showcase) {
    const slug = brand.slug.trim().toLowerCase();
    const existing = bySlug.get(slug);
    bySlug.set(slug, {
      id: existing?.id ?? brand.id,
      name: existing?.name || brand.name,
      slug: existing?.slug || brand.slug,
      logoUrl: brand.logoUrl || existing?.logoUrl || "",
    });
  }

  return Array.from(bySlug.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
  );
}

export default async function BrandsIndexPage() {
  const [nav, apiBrands] = await Promise.all([getMainNavData(), getBrands()]);
  const brands =
    SHOWCASE_BRANDS.length > 0
      ? mergeBrandLists(apiBrands, SHOWCASE_BRANDS)
      : apiBrands;

  return (
    <>
      <StickyHeaderShell>
        <SiteHeader />
        <MainNav data={nav} />
      </StickyHeaderShell>

      <div className="site-container flex-1 py-6">
        <h1 className="mb-6 text-lg font-bold text-[var(--color-neutral-900)]">
          برندها
        </h1>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {brands.map((brand) => (
            <li key={brand.id}>
              <Link
                href={`/brand/${brand.slug}`}
                className="flex flex-col items-center gap-2 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4 transition hover:border-[var(--color-primary)]"
              >
                {brand.logoUrl ? (
                  // Mixed local assets (svg/avif/webp/png/jpg).
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    width={72}
                    height={72}
                    className="h-[72px] w-[72px] object-contain"
                    loading="lazy"
                  />
                ) : (
                  <span className="flex h-[72px] w-[72px] items-center justify-center text-center text-xs font-bold text-[var(--color-neutral-400)]">
                    {brand.name}
                  </span>
                )}
                <span className="text-sm font-bold text-[var(--color-neutral-800)]">
                  {brand.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <SiteFooter />
    </>
  );
}
