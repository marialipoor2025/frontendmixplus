"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { type AdminColumn } from "@/components/admin/AdminUi";
import { mockAdminAuditLogs } from "@/lib/mocks/admin";
import type { AdminAuditLog } from "@/types/admin";

const columns: AdminColumn<AdminAuditLog>[] = [
  { key: "at", header: "زمان", cell: (r) => r.at },
  { key: "actor", header: "عامل", cell: (r) => r.actor },
  { key: "action", header: "اقدام", cell: (r) => r.action },
  { key: "entity", header: "موجودیت", cell: (r) => r.entity },
];

export default function AdminAuditPage() {
  return (
    <AdminResourcePage
      permission="audit:view"
      title="لاگ تغییرات"
      description="چه کسی چه چیزی را تغییر داده است"
      createLabel="فیلتر پیشرفته"
      columns={columns}
      rows={mockAdminAuditLogs}
    />
  );
}
