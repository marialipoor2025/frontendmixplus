"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { RowActions, type AdminColumn } from "@/components/admin/AdminUi";
import { mockAdminSpecs } from "@/lib/mocks/admin";
import type { AdminSpec } from "@/types/admin";

const columns: AdminColumn<AdminSpec>[] = [
  { key: "name", header: "نام مشخصه", cell: (r) => r.name },
  { key: "group", header: "گروه", cell: (r) => r.group },
  { key: "unit", header: "واحد", cell: (r) => r.unit },
  { key: "category", header: "دسته مرتبط", cell: (r) => r.category },
  { key: "actions", header: "", cell: () => <RowActions /> },
];

export default function AdminSpecsPage() {
  return (
    <AdminResourcePage
      permission="specs:manage"
      title="مدیریت مشخصات"
      description="تعریف ویژگی‌ها و مشخصات فنی محصولات"
      createLabel="مشخصه جدید"
      columns={columns}
      rows={mockAdminSpecs}
    />
  );
}
