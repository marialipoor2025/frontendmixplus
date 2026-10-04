"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { RowActions, priceCell, type AdminColumn } from "@/components/admin/AdminUi";
import { mockAdminVariants } from "@/lib/mocks/admin";
import type { AdminVariant } from "@/types/admin";

const columns: AdminColumn<AdminVariant>[] = [
  { key: "product", header: "محصول", cell: (r) => r.productTitle },
  { key: "sku", header: "SKU", cell: (r) => <span dir="ltr">{r.sku}</span> },
  { key: "attrs", header: "ویژگی‌ها", cell: (r) => r.attributes },
  { key: "price", header: "قیمت", cell: (r) => priceCell(r.price) },
  { key: "stock", header: "موجودی", cell: (r) => r.stock },
  { key: "actions", header: "", cell: () => <RowActions /> },
];

export default function AdminVariantsPage() {
  return (
    <AdminResourcePage
      permission="variants:manage"
      title="مدیریت تنوع‌ها"
      description="تنوع رنگ، ظرفیت و سایر ترکیب‌های فروش"
      createLabel="تنوع جدید"
      columns={columns}
      rows={mockAdminVariants}
    />
  );
}
