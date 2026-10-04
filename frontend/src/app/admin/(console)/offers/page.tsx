"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { RowActions, StatusPill, priceCell, type AdminColumn } from "@/components/admin/AdminUi";
import { mockAdminOffers } from "@/lib/mocks/admin";
import type { AdminOffer } from "@/types/admin";

const columns: AdminColumn<AdminOffer>[] = [
  { key: "seller", header: "فروشنده", cell: (r) => r.seller },
  { key: "product", header: "محصول", cell: (r) => r.product },
  { key: "price", header: "قیمت", cell: (r) => priceCell(r.price) },
  { key: "stock", header: "موجودی آفر", cell: (r) => r.stock },
  {
    key: "status",
    header: "وضعیت",
    cell: (r) => (
      <StatusPill tone={r.status === "active" ? "success" : "muted"}>
        {r.status === "active" ? "فعال" : "متوقف"}
      </StatusPill>
    ),
  },
  { key: "actions", header: "", cell: () => <RowActions /> },
];

export default function AdminOffersPage() {
  return (
    <AdminResourcePage
      permission="offers:manage"
      title="مدیریت آفر فروشندگان"
      description="قیمت و موجودی پیشنهادی فروشندگان روی محصولات"
      createLabel="آفر جدید"
      columns={columns}
      rows={mockAdminOffers}
    />
  );
}
