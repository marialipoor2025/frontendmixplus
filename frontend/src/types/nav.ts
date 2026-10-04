export type MegaMenuLink = {
  id: string;
  title: string;
  href: string;
  /** Parent headings are bold; leaves are muted */
  kind: "parent" | "leaf";
};

export type MegaMenuColumn = {
  id: string;
  links: MegaMenuLink[];
};

export type MegaMenuCategory = {
  id: string;
  title: string;
  href: string;
  /** Simple icon key mapped in the UI */
  icon: string;
  allProductsLabel: string;
  columns: MegaMenuColumn[];
};

export type NavQuickLink = {
  id: string;
  title: string;
  href: string;
  icon?: string;
  external?: boolean;
  /** Optional pill badge next to the label (e.g. «جدید») */
  badge?: string;
};

export type MainNavData = {
  categoryTriggerLabel: string;
  categories: MegaMenuCategory[];
  quickLinks: NavQuickLink[];
  sellerCta: { title: string; href: string };
};
