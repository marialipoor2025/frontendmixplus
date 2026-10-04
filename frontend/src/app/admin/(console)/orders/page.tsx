"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { RowActions, StatusPill, priceCell, type AdminColumn } from "@/components/admin/AdminUi";
import { mockAdminOrders } from "@/lib/mocks/admin";
import type { AdminOrder } from "@/types/admin";

const statusMap: Record<
  AdminOrder["status"],
  { label: string; tone: "info" | "warn" | "success" | "muted" | "danger" }
> = {
  new: { label: "جدید", tone: "info" },
  processing: { label: "در حال پردازش", tone: "warn" },
  shipped: { label: "ارسال‌شده", tone: "success" },
  delivered: { label: "تحویل‌شده", tone: "success" },
  cancelled: { label: "لغو", tone: "danger" },
};

const columns: AdminColumn<AdminOrder>[] = [
  { key: "id", header: "سفارش", cell: (r) => <span dir="ltr">{r.id}</span> },
  { key: "customer", header: "مشتری", cell: (r) => r.customer },
  { key: "total", header: "مبلغ", cell: (r) => priceCell(r.total) },
  {
    key: "status",
    header: "وضعیت",
    cell: (r) => (
      <StatusPill tone={statusMap[r.status].tone}>{statusMap[r.status].label}</StatusPill>
    ),
  },
  { key: "at", header: "زمان", cell: (r) => r.createdAt },
  { key: "actions", header: "", cell: () => <RowActions /> },
];

export default function AdminOrdersPage() {
  return (
    <AdminResourcePage
      permission="orders:manage"
      title="مدیریت سفارش‌ها"
      description="پردازش، ارسال و پیگیری سفارش‌های مشتریان"
      createLabel="ثبت دستی"
      columns={columns}
      rows={mockAdminOrders}
    />
  );
}
