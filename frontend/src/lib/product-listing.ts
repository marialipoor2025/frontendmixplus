import type { Product } from "@/types/product";
import type {
  ProductListingFacets,
  ProductListingFilters,
  ProductListingQuery,
  ProductListingResult,
  ProductSort,
} from "@/types/product-listing";

const DEFAULT_PAGE_SIZE = 20;

export function parseListingSearchParams(
  params: Record<string, string | string[] | undefined>,
): ProductListingQuery {
  const get = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const brandsRaw = get("brand") ?? "";
  const brands = brandsRaw
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);

  const sort = (get("sort") as ProductSort | undefined) ?? "relevance";
  const page = Math.max(1, Number(get("page") || "1") || 1);
  const pageSize = Math.min(
    60,
    Math.max(8, Number(get("pageSize") || DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE),
  );
  const condition = get("condition");
  const minPrice = get("minPrice");
  const maxPrice = get("maxPrice");

  return {
    sort: isSort(sort) ? sort : "relevance",
    page,
    pageSize,
    q: get("q")?.trim() || undefined,
    filters: {
      brands,
      inStockOnly: get("inStock") === "1" || get("inStock") === "true",
      condition: condition === "new" || condition === "used" ? condition : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    },
  };
}

function isSort(value: string): value is ProductSort {
  return [
    "relevance",
    "price-asc",
    "price-desc",
    "newest",
    "popular",
    "discount",
  ].includes(value);
}

export function buildListingQueryString(
  query: ProductListingQuery,
  extra: Record<string, string | undefined> = {},
): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.sort && query.sort !== "relevance") params.set("sort", query.sort);
  if (query.page > 1) params.set("page", String(query.page));
  if (query.pageSize !== DEFAULT_PAGE_SIZE) {
    params.set("pageSize", String(query.pageSize));
  }
  if (query.filters.brands.length) {
    params.set("brand", query.filters.brands.join(","));
  }
  if (query.filters.inStockOnly) params.set("inStock", "1");
  if (query.filters.condition) params.set("condition", query.filters.condition);
  if (query.filters.minPrice != null) {
    params.set("minPrice", String(query.filters.minPrice));
  }
  if (query.filters.maxPrice != null) {
    params.set("maxPrice", String(query.filters.maxPrice));
  }
  for (const [key, value] of Object.entries(extra)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function applyFilters(products: Product[], filters: ProductListingFilters) {
  return products.filter((p) => {
    if (filters.brands.length && !filters.brands.includes(p.brandName)) {
      return false;
    }
    if (filters.inStockOnly && !p.inStock) return false;
    if (filters.condition && (p.condition ?? "new") !== filters.condition) {
      return false;
    }
    if (filters.minPrice != null && p.price.amount < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice != null && p.price.amount > filters.maxPrice) {
      return false;
    }
    return true;
  });
}

function applySort(products: Product[], sort: ProductSort, q?: string) {
  const copy = [...products];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price.amount - b.price.amount);
    case "price-desc":
      return copy.sort((a, b) => b.price.amount - a.price.amount);
    case "popular":
      return copy.sort(
        (a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0) || (b.rating ?? 0) - (a.rating ?? 0),
      );
    case "discount":
      return copy.sort(
        (a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0),
      );
    case "newest":
      return copy.reverse();
    case "relevance":
    default:
      if (!q) return copy;
      return copy.sort((a, b) => scoreRelevance(b, q) - scoreRelevance(a, q));
  }
}

function scoreRelevance(product: Product, q: string) {
  const hay = `${product.title} ${product.brandName} ${product.slug}`.toLowerCase();
  const needle = q.toLowerCase();
  if (hay.startsWith(needle)) return 100;
  if (hay.includes(needle)) return 50;
  return 0;
}

export function buildFacets(products: Product[]): ProductListingFacets {
  const brandMap = new Map<string, number>();
  const conditionMap = new Map<string, number>();
  let min = Number.POSITIVE_INFINITY;
  let max = 0;

  for (const p of products) {
    brandMap.set(p.brandName, (brandMap.get(p.brandName) ?? 0) + 1);
    const condition = p.condition ?? "new";
    conditionMap.set(condition, (conditionMap.get(condition) ?? 0) + 1);
    min = Math.min(min, p.price.amount);
    max = Math.max(max, p.price.amount);
  }

  return {
    brands: [...brandMap.entries()]
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "fa")),
    conditions: [...conditionMap.entries()].map(([value, count]) => ({
      value,
      label: value === "used" ? "کارکرده" : "نو",
      count,
    })),
    price: {
      min: Number.isFinite(min) ? min : 0,
      max,
    },
  };
}

/** Apply filters/sort/paging client-side until Catalog listing API is ready. */
export function applyProductListing(
  products: Product[],
  query: ProductListingQuery,
): ProductListingResult {
  const facets = buildFacets(products);
  const filtered = applyFilters(products, query.filters);
  const sorted = applySort(filtered, query.sort, query.q);
  const pageCount = Math.max(1, Math.ceil(sorted.length / query.pageSize));
  const page = Math.min(query.page, pageCount);
  const start = (page - 1) * query.pageSize;

  return {
    items: sorted.slice(start, start + query.pageSize),
    total: sorted.length,
    page,
    pageSize: query.pageSize,
    pageCount,
    facets,
    query: { ...query, page },
  };
}

export const PRODUCT_SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "relevance", label: "مرتبط‌ترین" },
  { value: "popular", label: "پربازدیدترین" },
  { value: "price-asc", label: "ارزان‌ترین" },
  { value: "price-desc", label: "گران‌ترین" },
  { value: "discount", label: "بیشترین تخفیف" },
  { value: "newest", label: "جدیدترین" },
];
