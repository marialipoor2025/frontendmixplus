"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { RowActions, StatusPill, type AdminColumn } from "@/components/admin/AdminUi";
import { mockAdminSellers } from "@/lib/mocks/admin";
import type { AdminSeller } from "@/types/admin";

const statusLabel = {
  approved: "تأیید شده",
  pending: "در انتظار",
  suspended: "معلق",
} as const;

const columns: AdminColumn<AdminSeller>[] = [
  { key: "name", header: "فروشنده", cell: (r) => r.name },
  {
    key: "status",
    header: "وضعیت",
    cell: (r) => (
      <StatusPill
        tone={
          r.status === "approved" ? "success" : r.status === "pending" ? "warn" : "danger"
        }
      >
        {statusLabel[r.status]}
      </StatusPill>
    ),
  },
  { key: "offers", header: "آفرها", cell: (r) => r.offers },
  { key: "rating", header: "امتیاز", cell: (r) => (r.rating ? r.rating.toFixed(1) : "—") },
  { key: "actions", header: "", cell: () => <RowActions /> },
];

export default function AdminSellersPage() {
  return (
    <AdminResourcePage
      permission="sellers:manage"
      title="مدیریت فروشندگان"
      description="تأیید، تعلیق و پایش فروشندگان بازارگاه"
      createLabel="فروشنده جدید"
      columns={columns}
      rows={mockAdminSellers}
    />
  );
}
