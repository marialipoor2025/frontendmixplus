import type { BreadcrumbItem } from "@/types/product-detail";
import type { Product } from "@/types/product";

export type ProductSort =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "newest"
  | "popular"
  | "discount";

export type ProductListingFilters = {
  brands: string[];
  inStockOnly: boolean;
  condition?: "new" | "used";
  minPrice?: number;
  maxPrice?: number;
};

export type ProductListingQuery = {
  sort: ProductSort;
  page: number;
  pageSize: number;
  filters: ProductListingFilters;
  /** Free-text query (search pages). */
  q?: string;
};

export type FacetOption = {
  value: string;
  label: string;
  count: number;
};

export type ProductListingFacets = {
  brands: FacetOption[];
  conditions: FacetOption[];
  price: { min: number; max: number };
};

export type ProductListingResult = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  facets: ProductListingFacets;
  query: ProductListingQuery;
};

export type ProductListingContext = {
  title: string;
  subtitle?: string;
  breadcrumb?: BreadcrumbItem[];
  basePath: string;
};
