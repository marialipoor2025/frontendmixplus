"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { RowActions, StatusPill, type AdminColumn } from "@/components/admin/AdminUi";
import { mockAdminCustomers } from "@/lib/mocks/admin";
import type { AdminCustomer } from "@/types/admin";

const columns: AdminColumn<AdminCustomer>[] = [
  { key: "name", header: "مشتری", cell: (r) => r.name },
  { key: "phone", header: "موبایل", cell: (r) => <span dir="ltr">{r.phone}</span> },
  { key: "orders", header: "سفارش‌ها", cell: (r) => r.orders },
  {
    key: "status",
    header: "وضعیت",
    cell: (r) => (
      <StatusPill tone={r.status === "active" ? "success" : "danger"}>
        {r.status === "active" ? "فعال" : "مسدود"}
      </StatusPill>
    ),
  },
  { key: "actions", header: "", cell: () => <RowActions /> },
];

export default function AdminCustomersPage() {
  return (
    <AdminResourcePage
      permission="customers:manage"
      title="مدیریت مشتریان"
      description="پروفایل، وضعیت و تاریخچه خرید مشتریان"
      createLabel="مشتری جدید"
      columns={columns}
      rows={mockAdminCustomers}
    />
  );
}
