"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { type AdminColumn } from "@/components/admin/AdminUi";
import { mockAdminReports } from "@/lib/mocks/admin";
import type { AdminReportRow } from "@/types/admin";

const columns: AdminColumn<AdminReportRow>[] = [
  { key: "metric", header: "شاخص", cell: (r) => r.metric },
  { key: "period", header: "بازه", cell: (r) => r.period },
  { key: "value", header: "مقدار", cell: (r) => r.value },
  { key: "change", header: "تغییر", cell: (r) => r.change },
];

export default function AdminReportsPage() {
  return (
    <AdminResourcePage
      permission="reports:view"
      title="گزارش‌ها"
      description="فروش، محصول و رفتار مشتریان"
      createLabel="ساخت گزارش"
      columns={columns}
      rows={mockAdminReports}
    />
  );
}
