"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { RowActions, StatusPill, type AdminColumn } from "@/components/admin/AdminUi";
import { mockAdminCms } from "@/lib/mocks/admin";
import type { AdminCmsItem } from "@/types/admin";

const kindLabel = { banner: "بنر", page: "صفحه", blog: "بلاگ" } as const;

const columns: AdminColumn<AdminCmsItem>[] = [
  { key: "title", header: "عنوان", cell: (r) => r.title },
  { key: "kind", header: "نوع", cell: (r) => kindLabel[r.kind] },
  {
    key: "status",
    header: "وضعیت",
    cell: (r) => (
      <StatusPill tone={r.status === "published" ? "success" : "warn"}>
        {r.status === "published" ? "منتشر شده" : "پیش‌نویس"}
      </StatusPill>
    ),
  },
  { key: "updated", header: "به‌روزرسانی", cell: (r) => r.updatedAt },
  { key: "actions", header: "", cell: () => <RowActions /> },
];

export default function AdminCmsPage() {
  return (
    <AdminResourcePage
      permission="cms:manage"
      title="مدیریت محتوا"
      description="بنرها، صفحات و مطالب بلاگ"
      createLabel="محتوای جدید"
      columns={columns}
      rows={mockAdminCms}
    />
  );
}
