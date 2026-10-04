"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { RowActions, type AdminColumn } from "@/components/admin/AdminUi";
import { mockAdminInventory } from "@/lib/mocks/admin";
import type { AdminInventoryRow } from "@/types/admin";

const columns: AdminColumn<AdminInventoryRow>[] = [
  { key: "sku", header: "SKU", cell: (r) => <span dir="ltr">{r.sku}</span> },
  { key: "title", header: "عنوان", cell: (r) => r.title },
  { key: "wh", header: "انبار", cell: (r) => r.warehouse },
  { key: "onHand", header: "موجودی", cell: (r) => r.onHand },
  { key: "reserved", header: "رزرو", cell: (r) => r.reserved },
  { key: "actions", header: "", cell: () => <RowActions /> },
];

export default function AdminInventoryPage() {
  return (
    <AdminResourcePage
      permission="inventory:manage"
      title="مدیریت موجودی"
      description="موجودی انبار و رزرو سفارش"
      createLabel="تعدیل موجودی"
      columns={columns}
      rows={mockAdminInventory}
    />
  );
}
