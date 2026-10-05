import { ProductCard } from "@/components/home/ProductCard";
import { MainNav } from "@/components/layout/MainNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StickyHeaderShell } from "@/components/layout/StickyHeaderShell";
import { getMainNavData } from "@/lib/api/nav";
import { mockHomePageData } from "@/lib/mocks/home";
import type { Product } from "@/types/product";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

function searchMockProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  const all = [
    ...mockHomePageData.amazingOffers,
    ...mockHomePageData.productRails.flatMap((r) => r.products),
  ];
  const map = new Map<string, Product>();
  for (const p of all) map.set(p.id, p);
  const unique = [...map.values()];
  if (!q) return unique.slice(0, 12);
  return unique.filter((p) =>
    `${p.title} ${p.slug} ${p.brandName}`.toLowerCase().includes(q),
  );
}

export async function generateMetadata({ searchParams }: PageProps) {
  const { q } = await searchParams;
  return { title: q ? `جستجو: ${q}` : "جستجو" };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "" } = await searchParams;
  const nav = await getMainNavData();
  const products = searchMockProducts(q);

  return (
    <>
      <StickyHeaderShell>
        <SiteHeader />
        <MainNav data={nav} />
      </StickyHeaderShell>

      <div className="site-container flex-1 py-6">
        <h1 className="mb-2 text-lg font-bold text-[var(--color-neutral-900)]">
          {q ? `نتایج جستجو برای «${q}»` : "جستجو در میکپلاس"}
        </h1>
        <p className="mb-6 text-sm text-[var(--color-neutral-500)]">
          {products.length} کالا یافت شد
        </p>

        {products.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--color-border)] px-4 py-12 text-center text-sm text-[var(--color-muted)]">
            نتیجه‌ای پیدا نشد. عبارت دیگری را امتحان کنید.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                className="!w-full !min-w-0"
              />
            ))}
          </div>
        )}
      </div>

      <SiteFooter />
    </>
  );
}
