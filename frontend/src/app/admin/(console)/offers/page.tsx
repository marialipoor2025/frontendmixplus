"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AdminOutlineButton,
  AdminPageHeader,
  AdminTable,
  RowActions,
  StatusPill,
  priceCell,
  type AdminColumn,
} from "@/components/admin/AdminUi";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { listAdminOffers, setAdminOfferStatus } from "@/lib/api/offers";
import { siteConfig } from "@/config/site";
import { mockAdminOffers } from "@/lib/mocks/admin";
import type { AdminOffer } from "@/types/admin";
import { paginateLocal } from "@/types/paging";

export default function AdminOffersPage() {
  const [rows, setRows] = useState(mockAdminOffers);
  const [source, setSource] = useState<"mock" | "api">(
    siteConfig.useMocks || !siteConfig.apiBaseUrl ? "mock" : "api",
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const live = await listAdminOffers();
      if (!cancelled && live) {
        setRows(live);
        if (!siteConfig.useMocks && siteConfig.apiBaseUrl) {
          setSource("api");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const paged = useMemo(
    () => paginateLocal(rows, page, pageSize),
    [rows, page, pageSize],
  );

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
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <RowActions
          onEdit={() => {
            void (async () => {
              const next = r.status === "active" ? "paused" : "active";
              const live = await setAdminOfferStatus(r.id, next);
              setRows((prev) =>
                prev.map((x) =>
                  x.id === r.id
                    ? { ...x, status: live?.status ?? next }
                    : x,
                ),
              );
              setNotice(
                live
                  ? next === "active"
                    ? "آفر فعال شد"
                    : "آفر متوقف شد"
                  : "وضعیت به‌روز شد (mock)",
              );
              window.setTimeout(() => setNotice(null), 2000);
            })();
          }}
        />
      ),
    },
  ];

  return (
    <RequireAdmin permission="offers:manage">
      <AdminPageHeader
        title="مدیریت آفر فروشندگان"
        description={
          source === "api"
            ? "آفرها از محصولات Catalog (فعال/توقف انتشار)"
            : "قیمت و موجودی پیشنهادی فروشندگان روی محصولات (mock)"
        }
        actions={
          <AdminOutlineButton
            type="button"
            onClick={() => {
              void (async () => {
                const live = await listAdminOffers();
                if (live) setRows(live);
              })();
            }}
          >
            بروزرسانی
          </AdminOutlineButton>
        }
      />

      {notice ? (
        <p className="mb-3 rounded-lg bg-[var(--color-primary-soft)] px-3 py-2 text-sm text-[var(--color-primary)]">
          {notice}
        </p>
      ) : null}

      <AdminTable
        columns={columns}
        rows={paged.items}
        paging={{
          page: paged.page,
          pageSize: paged.pageSize,
          totalCount: paged.totalCount,
          totalPages: paged.totalPages,
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPage(1);
          },
        }}
      />
    </RequireAdmin>
  );
}
