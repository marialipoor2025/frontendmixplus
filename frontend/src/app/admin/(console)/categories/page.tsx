"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { RowActions, type AdminColumn } from "@/components/admin/AdminUi";
import { mockAdminCategories } from "@/lib/mocks/admin";
import type { AdminCategory } from "@/types/admin";

const columns: AdminColumn<AdminCategory>[] = [
  { key: "name", header: "دسته", cell: (r) => r.name },
  { key: "parent", header: "والد", cell: (r) => r.parent },
  { key: "slug", header: "اسلاگ", cell: (r) => <span dir="ltr">{r.slug}</span> },
  { key: "count", header: "تعداد محصول", cell: (r) => r.productCount },
  { key: "actions", header: "", cell: () => <RowActions /> },
];

export default function AdminCategoriesPage() {
  return (
    <AdminResourcePage
      permission="categories:manage"
      title="مدیریت دسته‌بندی‌ها"
      description="ساختار سلسله‌مراتبی دسته‌ها"
      createLabel="دسته جدید"
      columns={columns}
      rows={mockAdminCategories}
    />
  );
}
