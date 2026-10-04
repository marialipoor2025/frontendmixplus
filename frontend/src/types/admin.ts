/** Admin back-office contracts (frontend-first; backend module later). */

export type AdminRole = "super_admin" | "catalog_manager" | "ops_manager" | "support";

export type AdminPermission =
  | "dashboard:view"
  | "products:manage"
  | "variants:manage"
  | "specs:manage"
  | "categories:manage"
  | "brands:manage"
  | "media:manage"
  | "inventory:manage"
  | "sellers:manage"
  | "offers:manage"
  | "orders:manage"
  | "customers:manage"
  | "promotions:manage"
  | "coupons:manage"
  | "cms:manage"
  | "reviews:moderate"
  | "reports:view"
  | "audit:view"
  | "roles:manage";

export type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  role: AdminRole;
  permissions: AdminPermission[];
};

export type AdminSession = {
  accessToken: string;
  user: AdminUser;
};

export type AdminStat = {
  id: string;
  label: string;
  value: string;
  hint?: string;
};

export type AdminVariant = {
  id: string;
  productTitle: string;
  sku: string;
  attributes: string;
  price: number;
  stock: number;
};

export type AdminSpec = {
  id: string;
  name: string;
  group: string;
  unit: string;
  category: string;
};

export type AdminCategory = {
  id: string;
  name: string;
  parent: string;
  slug: string;
  productCount: number;
};

export type AdminBrand = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  status: "active" | "hidden";
};

export type AdminMedia = {
  id: string;
  name: string;
  type: "image" | "video";
  usedIn: string;
  sizeKb: number;
};

export type AdminInventoryRow = {
  id: string;
  sku: string;
  title: string;
  warehouse: string;
  onHand: number;
  reserved: number;
};

export type AdminSeller = {
  id: string;
  name: string;
  status: "approved" | "pending" | "suspended";
  offers: number;
  rating: number;
};

export type AdminOffer = {
  id: string;
  seller: string;
  product: string;
  price: number;
  stock: number;
  status: "active" | "paused";
};

export type AdminOrder = {
  id: string;
  customer: string;
  total: number;
  status: "new" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
};

export type AdminCustomer = {
  id: string;
  name: string;
  phone: string;
  orders: number;
  status: "active" | "blocked";
};

export type AdminPromotion = {
  id: string;
  title: string;
  type: "percent" | "fixed" | "campaign";
  status: "active" | "scheduled" | "ended";
  endsAt: string;
};

export type AdminCoupon = {
  id: string;
  code: string;
  discount: string;
  usage: number;
  limit: number;
  status: "active" | "expired";
};

export type AdminCmsItem = {
  id: string;
  title: string;
  kind: "banner" | "page" | "blog";
  status: "published" | "draft";
  updatedAt: string;
};

export type AdminReview = {
  id: string;
  product: string;
  customer: string;
  rating: number;
  status: "pending" | "approved" | "rejected";
  excerpt: string;
};

export type AdminReportRow = {
  id: string;
  metric: string;
  period: string;
  value: string;
  change: string;
};

export type AdminAuditLog = {
  id: string;
  actor: string;
  action: string;
  entity: string;
  at: string;
};
