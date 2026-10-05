import { mockHomePageData } from "@/lib/mocks/home";
import type { Brand } from "@/types/brand";
import type { Product } from "@/types/product";

/** Extra brands referenced by product cards but not always listed on homepage. */
const EXTRA_BRANDS: Brand[] = [
  {
    id: "b-lg",
    name: "ال‌جی",
    slug: "lg",
    logoUrl: "/images/brands/samsung.webp",
  },
  {
    id: "b-bosch",
    name: "بوش",
    slug: "bosch",
    logoUrl: "/images/brands/samsung.webp",
  },
  {
    id: "b-xiaomi",
    name: "شیائومی",
    slug: "xiaomi",
    logoUrl: "/images/brands/xiaomi.png",
  },
  {
    id: "b-snowa",
    name: "اسنوا",
    slug: "snowa",
    logoUrl: "/images/brands/samsung.webp",
  },
  {
    id: "b-philips",
    name: "فیلیپس",
    slug: "philips",
    logoUrl: "/images/brands/samsung.webp",
  },
  {
    id: "b-daewoo",
    name: "دوو",
    slug: "daewoo",
    logoUrl: "/images/brands/samsung.webp",
  },
  {
    id: "b-pakshoma",
    name: "پاکشوما",
    slug: "pakshoma",
    logoUrl: "/images/brands/samsung.webp",
  },
  {
    id: "b-xvision",
    name: "ایکس ویژن",
    slug: "xvision",
    logoUrl: "/images/brands/x-vision.webp",
  },
];

function uniqueBySlug(brands: Brand[]) {
  const map = new Map<string, Brand>();
  for (const brand of brands) map.set(brand.slug, brand);
  return [...map.values()];
}

export function getMockBrands(): Brand[] {
  return uniqueBySlug([...mockHomePageData.brands, ...EXTRA_BRANDS]);
}

export function resolveMockBrand(slug: string): Brand | null {
  const normalized = slug.trim().toLowerCase();
  return getMockBrands().find((b) => b.slug === normalized) ?? null;
}

function uniqueProducts(items: Product[]) {
  const map = new Map<string, Product>();
  for (const p of items) map.set(p.id, p);
  return [...map.values()];
}

function allMockProducts(): Product[] {
  return uniqueProducts([
    ...mockHomePageData.amazingOffers,
    ...mockHomePageData.productRails.flatMap((r) => r.products),
  ]);
}

/** Temporary brand PLP products until Catalog brand filter API exists. */
export function getMockBrandProducts(brand: Brand): Product[] {
  const slug = brand.slug.toLowerCase();
  const name = brand.name.toLowerCase();
  const matched = allMockProducts().filter((p) => {
    const hay = `${p.title} ${p.slug} ${p.brandName}`.toLowerCase();
    return (
      p.brandName.toLowerCase() === name ||
      p.slug.toLowerCase().startsWith(`${slug}-`) ||
      hay.includes(name) ||
      hay.includes(slug)
    );
  });

  return matched.length > 0 ? matched : allMockProducts().slice(0, 8);
}
