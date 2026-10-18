"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AdminButton,
  AdminOutlineButton,
  AdminPageHeader,
  AdminTable,
  RowActions,
  StatusPill,
  type AdminColumn,
} from "@/components/admin/AdminUi";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import {
  createAdminCmsPage,
  deleteAdminCmsPage,
  listAdminCmsPages,
  upsertAdminCmsPage,
  type CmsPage,
} from "@/lib/api/pages";
import { siteConfig } from "@/config/site";
import { paginateLocal } from "@/types/paging";

type PageRow = CmsPage & { id: string };

const empty: CmsPage = {
  key: "",
  title: "",
  description: "",
  body: "",
  isPublished: true,
};

function asRow(page: CmsPage): PageRow {
  return { ...page, id: page.key };
}

export default function AdminStaticPagesPage() {
  const [rows, setRows] = useState<PageRow[]>([]);
  const [source, setSource] = useState<"mock" | "api">(
    siteConfig.useMocks || !siteConfig.apiBaseUrl ? "mock" : "api",
  );
  const [editing, setEditing] = useState<CmsPage | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CmsPage>(empty);
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const live = await listAdminCmsPages();
      if (!cancelled && live) {
        setRows(live.map(asRow));
        if (!siteConfig.useMocks && siteConfig.apiBaseUrl) setSource("api");
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

  const columns: AdminColumn<PageRow>[] = [
    {
      key: "key",
      header: "کلید",
      cell: (r) => <span dir="ltr">{r.key}</span>,
    },
    { key: "title", header: "عنوان", cell: (r) => r.title },
    {
      key: "status",
      header: "وضعیت",
      cell: (r) => (
        <StatusPill tone={r.isPublished ? "info" : "warn"}>
          {r.isPublished ? "منتشر" : "پیش‌نویس"}
        </StatusPill>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <RowActions
          onEdit={() => {
            setCreating(false);
            setEditing(r);
            setForm(r);
          }}
          onDelete={() => {
            void (async () => {
              const ok = await deleteAdminCmsPage(r.key);
              if (ok) {
                setRows((prev) => prev.filter((x) => x.id !== r.id));
                setNotice("صفحه حذف شد");
              } else {
                setNotice("حذف ناموفق بود");
              }
            })();
          }}
        />
      ),
    },
  ];

  return (
    <RequireAdmin permission="cms:manage">
      <AdminPageHeader
        title="صفحات ثابت"
        description={
          source === "api"
            ? "ویرایش عنوان، توضیح و متن صفحات اطلاعاتی سایت"
            : "برای ویرایش زنده، API را فعال کنید"
        }
        actions={
          <AdminButton
            type="button"
            onClick={() => {
              setEditing(null);
              setCreating(true);
              setForm(empty);
            }}
          >
            صفحه جدید
          </AdminButton>
        }
      />

      {notice ? (
        <p className="mb-3 text-xs text-[var(--color-success)]">{notice}</p>
      ) : null}

      {creating || editing ? (
        <form
          className="mb-4 space-y-3 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4"
          onSubmit={(e) => {
            e.preventDefault();
            void (async () => {
              try {
                const saved = creating
                  ? await createAdminCmsPage(form)
                  : await upsertAdminCmsPage(form);
                setRows((prev) => {
                  const row = asRow(saved);
                  const others = prev.filter((x) => x.id !== row.id);
                  return [...others, row].sort((a, b) =>
                    a.key.localeCompare(b.key),
                  );
                });
                setCreating(false);
                setEditing(null);
                setNotice("صفحه ذخیره شد");
              } catch (err) {
                setNotice(
                  err instanceof Error ? err.message : "ذخیره ناموفق بود",
                );
              }
            })();
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1 text-sm">
              <span>کلید مسیر (مثل page/contact-us یا about)</span>
              <input
                required
                dir="ltr"
                disabled={!creating}
                value={form.key}
                onChange={(e) =>
                  setForm((p) => ({ ...p, key: e.target.value.trim() }))
                }
                className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2 font-mono text-xs disabled:opacity-60"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span>عنوان</span>
              <input
                required
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
              />
            </label>
          </div>

          <label className="block space-y-1 text-sm">
            <span>توضیح کوتاه</span>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span>متن صفحه (هر پاراگراف در یک خط خالی جدا شود)</span>
            <textarea
              rows={10}
              value={form.body}
              onChange={(e) =>
                setForm((p) => ({ ...p, body: e.target.value }))
              }
              className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2 text-sm leading-7"
            />
          </label>

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) =>
                setForm((p) => ({ ...p, isPublished: e.target.checked }))
              }
            />
            منتشر شده
          </label>

          <div className="flex gap-2">
            <AdminButton type="submit">ذخیره</AdminButton>
            <AdminOutlineButton
              type="button"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
            >
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
        empty="صفحه‌ای ثبت نشده"
      />
    </RequireAdmin>
  );
}
