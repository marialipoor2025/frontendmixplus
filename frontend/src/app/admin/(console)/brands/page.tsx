"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { RowActions, StatusPill, type AdminColumn } from "@/components/admin/AdminUi";
import { mockAdminBrands } from "@/lib/mocks/admin";
import type { AdminBrand } from "@/types/admin";

const columns: AdminColumn<AdminBrand>[] = [
  { key: "name", header: "برند", cell: (r) => r.name },
  { key: "slug", header: "اسلاگ", cell: (r) => <span dir="ltr">{r.slug}</span> },
  { key: "count", header: "محصولات", cell: (r) => r.productCount },
  {
    key: "status",
    header: "وضعیت",
    cell: (r) => (
      <StatusPill tone={r.status === "active" ? "success" : "muted"}>
        {r.status === "active" ? "فعال" : "مخفی"}
      </StatusPill>
    ),
  },
  { key: "actions", header: "", cell: () => <RowActions /> },
];

export default function AdminBrandsPage() {
  return (
    <AdminResourcePage
      permission="brands:manage"
      title="مدیریت برندها"
      description="برندهای قابل نمایش در کاتالوگ و ویترین"
      createLabel="برند جدید"
      columns={columns}
      rows={mockAdminBrands}
    />
  );
}
