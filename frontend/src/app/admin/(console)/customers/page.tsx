"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AdminOutlineButton,
  AdminPageHeader,
  AdminTable,
  RowActions,
  StatusPill,
  type AdminColumn,
} from "@/components/admin/AdminUi";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import {
  listAdminCustomers,
  setAdminCustomerBlocked,
} from "@/lib/api/customers";
import { siteConfig } from "@/config/site";
import { mockAdminCustomers } from "@/lib/mocks/admin";
import type { AdminCustomer } from "@/types/admin";
import { paginateLocal } from "@/types/paging";

export default function AdminCustomersPage() {
  const [rows, setRows] = useState(mockAdminCustomers);
  const [source, setSource] = useState<"mock" | "api">(
    siteConfig.useMocks || !siteConfig.apiBaseUrl ? "mock" : "api",
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const live = await listAdminCustomers();
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

  const columns: AdminColumn<AdminCustomer>[] = [
    { key: "name", header: "مشتری", cell: (r) => r.name },
    {
      key: "phone",
      header: "موبایل",
      cell: (r) => <span dir="ltr">{r.phone}</span>,
    },
    { key: "orders", header: "سفارش‌ها", cell: (r) => r.orders },
    {
      key: "status",
      header: "وضعیت",
      cell: (r) => (
        <StatusPill tone={r.status === "active" ? "success" : "danger"}>
          {r.status === "active" ? "فعال" : "مسدود"}
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
              const blocked = r.status !== "blocked";
              const live = await setAdminCustomerBlocked(r.id, blocked);
              setRows((prev) =>
                prev.map((x) =>
                  x.id === r.id
                    ? {
                        ...x,
                        status: live?.status ?? (blocked ? "blocked" : "active"),
                      }
                    : x,
                ),
              );
              setNotice(
                live
                  ? blocked
                    ? "مشتری مسدود شد"
                    : "مشتری فعال شد"
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
    <RequireAdmin permission="customers:manage">
      <AdminPageHeader
        title="مدیریت مشتریان"
        description={
          source === "api"
            ? "کاربران Identity با امکان مسدودسازی"
            : "پروفایل، وضعیت و تاریخچه خرید مشتریان (mock)"
        }
        actions={
          <AdminOutlineButton
            type="button"
            onClick={() => {
              void (async () => {
                const live = await listAdminCustomers();
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
