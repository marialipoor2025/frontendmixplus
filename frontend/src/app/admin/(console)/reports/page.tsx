"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AdminOutlineButton,
  AdminPageHeader,
  AdminTable,
  type AdminColumn,
} from "@/components/admin/AdminUi";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { listAdminReports } from "@/lib/api/reports";
import { siteConfig } from "@/config/site";
import { mockAdminReports } from "@/lib/mocks/admin";
import type { AdminReportRow } from "@/types/admin";
import { paginateLocal } from "@/types/paging";

export default function AdminReportsPage() {
  const [rows, setRows] = useState(mockAdminReports);
  const [source, setSource] = useState<"mock" | "api">(
    siteConfig.useMocks || !siteConfig.apiBaseUrl ? "mock" : "api",
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const live = await listAdminReports();
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

  const columns: AdminColumn<AdminReportRow>[] = [
    { key: "metric", header: "شاخص", cell: (r) => r.metric },
    { key: "period", header: "بازه", cell: (r) => r.period },
    { key: "value", header: "مقدار", cell: (r) => r.value },
    { key: "change", header: "تغییر", cell: (r) => r.change },
  ];

  return (
    <RequireAdmin permission="reports:view">
      <AdminPageHeader
        title="گزارش‌ها"
        description={
          source === "api"
            ? "شاخص‌های زنده از Catalog، Orders، Identity و Sellers"
            : "فروش، محصول و رفتار مشتریان (mock)"
        }
        actions={
          <AdminOutlineButton
            type="button"
            onClick={() => {
              void (async () => {
                const live = await listAdminReports();
                if (live) setRows(live);
              })();
            }}
          >
            بروزرسانی
          </AdminOutlineButton>
        }
      />

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
