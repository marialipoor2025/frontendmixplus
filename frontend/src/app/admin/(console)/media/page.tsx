"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { RowActions, StatusPill, type AdminColumn } from "@/components/admin/AdminUi";
import { mockAdminMedia } from "@/lib/mocks/admin";
import type { AdminMedia } from "@/types/admin";

const columns: AdminColumn<AdminMedia>[] = [
  { key: "name", header: "فایل", cell: (r) => r.name },
  {
    key: "type",
    header: "نوع",
    cell: (r) => (
      <StatusPill tone={r.type === "image" ? "info" : "warn"}>
        {r.type === "image" ? "تصویر" : "ویدیو"}
      </StatusPill>
    ),
  },
  { key: "used", header: "استفاده در", cell: (r) => r.usedIn },
  { key: "size", header: "حجم (کیلوبایت)", cell: (r) => r.sizeKb },
  { key: "actions", header: "", cell: () => <RowActions /> },
];

export default function AdminMediaPage() {
  return (
    <AdminResourcePage
      permission="media:manage"
      title="مدیریت رسانه"
      description="تصاویر و ویدیوهای محصول و محتوا"
      createLabel="آپلود رسانه"
      columns={columns}
      rows={mockAdminMedia}
    />
  );
}
