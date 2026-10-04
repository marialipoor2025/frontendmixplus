"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { RowActions, StatusPill, type AdminColumn } from "@/components/admin/AdminUi";
import { mockAdminReviews } from "@/lib/mocks/admin";
import type { AdminReview } from "@/types/admin";

const columns: AdminColumn<AdminReview>[] = [
  { key: "product", header: "محصول", cell: (r) => r.product },
  { key: "customer", header: "مشتری", cell: (r) => r.customer },
  { key: "rating", header: "امتیاز", cell: (r) => r.rating },
  { key: "excerpt", header: "خلاصه", cell: (r) => r.excerpt },
  {
    key: "status",
    header: "وضعیت",
    cell: (r) => (
      <StatusPill
        tone={
          r.status === "approved" ? "success" : r.status === "pending" ? "warn" : "danger"
        }
      >
        {r.status === "approved" ? "تأیید" : r.status === "pending" ? "در انتظار" : "رد"}
      </StatusPill>
    ),
  },
  { key: "actions", header: "", cell: () => <RowActions /> },
];

export default function AdminReviewsPage() {
  return (
    <AdminResourcePage
      permission="reviews:moderate"
      title="نظارت بر نظرات"
      description="تأیید، رد و پایش نظرات مشتریان"
      createLabel="قوانین خودکار"
      columns={columns}
      rows={mockAdminReviews}
    />
  );
}
