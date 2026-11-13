import Link from "next/link";
import { MainNav } from "@/components/layout/MainNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StickyHeaderShell } from "@/components/layout/StickyHeaderShell";
import { ProductBreadcrumb } from "@/components/product/ProductBreadcrumb";
import { siteConfig } from "@/config/site";
import { getMainNavData } from "@/lib/api/nav";
import { SHOWCASE_BRANDS } from "@/lib/showcase-brands";

export const metadata = { title: "برندها" };

const BREADCRUMB = [
  { id: "home", title: siteConfig.nameFa, href: "/" },
  { id: "brands", title: "برندها", href: "/brand" },
];

export default async function BrandsIndexPage() {
  const nav = await getMainNavData();
  // Curated list only (foreign → Iranian). No Digi seller+brand composites.
  const brands = SHOWCASE_BRANDS;

  return (
    <>
      <StickyHeaderShell>
        <SiteHeader />
        <MainNav data={nav} />
      </StickyHeaderShell>

      <div className="site-container flex-1 py-6">
        <ProductBreadcrumb items={BREADCRUMB} />
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
                    width={120}
                    height={72}
                    className="h-[72px] w-full max-w-[120px] object-contain object-center"
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
