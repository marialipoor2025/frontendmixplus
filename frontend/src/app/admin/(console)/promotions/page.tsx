"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { RowActions, StatusPill, type AdminColumn } from "@/components/admin/AdminUi";
import { mockAdminPromotions } from "@/lib/mocks/admin";
import type { AdminPromotion } from "@/types/admin";

const columns: AdminColumn<AdminPromotion>[] = [
  { key: "title", header: "عنوان", cell: (r) => r.title },
  {
    key: "type",
    header: "نوع",
    cell: (r) =>
      r.type === "campaign" ? "کمپین" : r.type === "percent" ? "درصدی" : "مبلغ ثابت",
  },
  {
    key: "status",
    header: "وضعیت",
    cell: (r) => (
      <StatusPill
        tone={
          r.status === "active" ? "success" : r.status === "scheduled" ? "info" : "muted"
        }
      >
        {r.status === "active" ? "فعال" : r.status === "scheduled" ? "زمان‌بندی" : "پایان‌یافته"}
      </StatusPill>
    ),
  },
  { key: "ends", header: "پایان", cell: (r) => r.endsAt },
  { key: "actions", header: "", cell: () => <RowActions /> },
];

export default function AdminPromotionsPage() {
  return (
    <AdminResourcePage
      permission="promotions:manage"
      title="مدیریت پروموشن‌ها"
      description="تخفیف‌ها و کمپین‌های فروش"
      createLabel="پروموشن جدید"
      columns={columns}
      rows={mockAdminPromotions}
    />
  );
}
