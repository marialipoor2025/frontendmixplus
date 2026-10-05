"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AdminButton,
  AdminOutlineButton,
  AdminPageHeader,
  AdminTable,
  type AdminColumn,
} from "@/components/admin/AdminUi";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import {
  createAdminAuditLog,
  listAdminAuditLogs,
} from "@/lib/api/audit";
import { siteConfig } from "@/config/site";
import { mockAdminAuditLogs } from "@/lib/mocks/admin";
import type { AdminAuditLog } from "@/types/admin";
import { paginateLocal } from "@/types/paging";

export default function AdminAuditPage() {
  const [rows, setRows] = useState(mockAdminAuditLogs);
  const [source, setSource] = useState<"mock" | "api">(
    siteConfig.useMocks || !siteConfig.apiBaseUrl ? "mock" : "api",
  );
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    actor: "",
    action: "",
    entity: "",
  });
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const live = await listAdminAuditLogs();
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

  const columns: AdminColumn<AdminAuditLog>[] = [
    { key: "at", header: "زمان", cell: (r) => r.at },
    { key: "actor", header: "عامل", cell: (r) => r.actor },
    { key: "action", header: "اقدام", cell: (r) => r.action },
    { key: "entity", header: "موجودیت", cell: (r) => r.entity },
  ];

  return (
    <RequireAdmin permission="audit:view">
      <AdminPageHeader
        title="لاگ تغییرات"
        description={
          source === "api"
            ? "لاگ‌های Identity audit"
            : "چه کسی چه چیزی را تغییر داده است (mock)"
        }
        actions={
          <>
            <AdminOutlineButton type="button" onClick={() => setCreating(false)}>
              بستن فرم
            </AdminOutlineButton>
            <AdminButton type="button" onClick={() => setCreating(true)}>
              ثبت رویداد
            </AdminButton>
          </>
        }
      />

      {notice ? (
        <p className="mb-3 rounded-lg bg-[var(--color-primary-soft)] px-3 py-2 text-sm text-[var(--color-primary)]">
          {notice}
        </p>
      ) : null}

      {creating ? (
        <form
          className="mb-4 space-y-3 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4"
          onSubmit={(e) => {
            e.preventDefault();
            void (async () => {
              const live = await createAdminAuditLog(form);
              if (live) {
                setRows((prev) => [live, ...prev]);
                setNotice("رویداد ثبت شد");
              } else {
                setRows((prev) => [
                  {
                    id: `a-${Date.now()}`,
                    ...form,
                    at: new Date().toLocaleString("fa-IR"),
                  },
                  ...prev,
                ]);
                setNotice("رویداد ثبت شد (mock)");
              }
              setCreating(false);
              window.setTimeout(() => setNotice(null), 2000);
            })();
          }}
        >
          <h3 className="text-sm font-bold">رویداد جدید</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block space-y-1 text-sm">
              <span className="text-[var(--color-neutral-600)]">عامل</span>
              <input
                required
                value={form.actor}
                onChange={(e) =>
                  setForm((p) => ({ ...p, actor: e.target.value }))
                }
                className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="text-[var(--color-neutral-600)]">اقدام</span>
              <input
                required
                value={form.action}
                onChange={(e) =>
                  setForm((p) => ({ ...p, action: e.target.value }))
                }
                className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="text-[var(--color-neutral-600)]">موجودیت</span>
              <input
                value={form.entity}
                onChange={(e) =>
                  setForm((p) => ({ ...p, entity: e.target.value }))
                }
                className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
              />
            </label>
          </div>
          <div className="flex gap-2">
            <AdminButton type="submit">ذخیره</AdminButton>
            <AdminOutlineButton type="button" onClick={() => setCreating(false)}>
              انصراف
            </AdminOutlineButton>
          </div>
        </form>
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
