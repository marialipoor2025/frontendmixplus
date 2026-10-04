"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { RowActions, StatusPill, type AdminColumn } from "@/components/admin/AdminUi";
import { mockAdminCoupons } from "@/lib/mocks/admin";
import type { AdminCoupon } from "@/types/admin";

const columns: AdminColumn<AdminCoupon>[] = [
  { key: "code", header: "کد", cell: (r) => <span dir="ltr">{r.code}</span> },
  { key: "discount", header: "تخفیف", cell: (r) => r.discount },
  { key: "usage", header: "مصرف", cell: (r) => `${r.usage} / ${r.limit}` },
  {
    key: "status",
    header: "وضعیت",
    cell: (r) => (
      <StatusPill tone={r.status === "active" ? "success" : "muted"}>
        {r.status === "active" ? "فعال" : "منقضی"}
      </StatusPill>
    ),
  },
  { key: "actions", header: "", cell: () => <RowActions /> },
];

export default function AdminCouponsPage() {
  return (
    <AdminResourcePage
      permission="coupons:manage"
      title="مدیریت کوپن‌ها"
      description="کدهای تخفیف و سقف مصرف"
      createLabel="کوپن جدید"
      columns={columns}
      rows={mockAdminCoupons}
    />
  );
}
