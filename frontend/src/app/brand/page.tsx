import Image from "next/image";
import Link from "next/link";
import { MainNav } from "@/components/layout/MainNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StickyHeaderShell } from "@/components/layout/StickyHeaderShell";
import { getBrands } from "@/lib/api/catalog";
import { getMainNavData } from "@/lib/api/nav";

export const metadata = { title: "برندها" };

export default async function BrandsIndexPage() {
  const [nav, brands] = await Promise.all([getMainNavData(), getBrands()]);

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
                <Image
                  src={brand.logoUrl}
                  alt={brand.name}
                  width={72}
                  height={72}
                  className="h-[72px] w-[72px] object-contain"
                  unoptimized
                />
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
