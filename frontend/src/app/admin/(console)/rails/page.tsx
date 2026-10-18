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
  deleteAdminRail,
  listAdminRails,
  upsertAdminRail,
  type AdminRail,
} from "@/lib/api/rails";
import { siteConfig } from "@/config/site";
import { paginateLocal } from "@/types/paging";

const empty: AdminRail = {
  id: "",
  title: "",
  subtitle: "",
  href: "",
  showUsedLabel: false,
  showReviewScore: true,
  showCardLabels: false,
  labelPosition: "beside",
  sortOrder: 1,
  isActive: true,
  productKeys: [],
};

export default function AdminRailsPage() {
  const [rows, setRows] = useState<AdminRail[]>([]);
  const [source, setSource] = useState<"mock" | "api">(
    siteConfig.useMocks || !siteConfig.apiBaseUrl ? "mock" : "api",
  );
  const [editing, setEditing] = useState<AdminRail | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<AdminRail>(empty);
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keysText, setKeysText] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const live = await listAdminRails();
      if (!cancelled && live) {
        setRows(live);
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

  const columns: AdminColumn<AdminRail>[] = [
    { key: "title", header: "عنوان", cell: (r) => r.title },
    {
      key: "keys",
      header: "تعداد کالا",
      cell: (r) =>
        (r.productKeys?.length ?? 0).toLocaleString("fa-IR"),
    },
    {
      key: "review",
      header: "امتیاز",
      cell: (r) => (r.showReviewScore ? "نمایش" : "مخفی"),
    },
    {
      key: "labels",
      header: "برچسب",
      cell: (r) =>
        r.showCardLabels
          ? r.labelPosition === "top"
            ? "بالا"
            : "کنار تصویر"
          : "خاموش",
    },
    {
      key: "status",
      header: "وضعیت",
      cell: (r) => (
        <StatusPill tone={r.isActive ? "info" : "warn"}>
          {r.isActive ? "فعال" : "غیرفعال"}
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
            setKeysText((r.productKeys ?? []).join("\n"));
          }}
          onDelete={() => {
            void (async () => {
              const ok = await deleteAdminRail(r.id);
              if (ok) {
                setRows((prev) => prev.filter((x) => x.id !== r.id));
                setNotice("ریل حذف شد");
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
        title="ریل‌های صفحه اصلی"
        description={
          source === "api"
            ? "عنوان بخش، کلید کالاها، نمایش امتیاز و برچسب کارت"
            : "برای ویرایش زنده، API را فعال کنید"
        }
        actions={
          <AdminButton
            type="button"
            onClick={() => {
              setEditing(null);
              setCreating(true);
              setForm(empty);
              setKeysText("");
            }}
          >
            ریل جدید
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
              const productKeys = keysText
                .split(/[\n,]+/)
                .map((s) => s.trim())
                .filter(Boolean);
              const payload: AdminRail = {
                ...form,
                productKeys,
              };
              try {
                const saved = await upsertAdminRail(payload);
                setRows((prev) => {
                  const others = prev.filter((x) => x.id !== saved.id);
                  return [...others, saved].sort(
                    (a, b) => a.sortOrder - b.sortOrder,
                  );
                });
                setCreating(false);
                setEditing(null);
                setNotice("ریل ذخیره شد");
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
            <label className="block space-y-1 text-sm">
              <span>زیرعنوان</span>
              <input
                value={form.subtitle ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, subtitle: e.target.value }))
                }
                className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span>لینک مشاهده همه</span>
              <input
                dir="ltr"
                value={form.href ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, href: e.target.value }))
                }
                className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span>ترتیب</span>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    sortOrder: Number(e.target.value) || 1,
                  }))
                }
                className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
              />
            </label>
          </div>

          <label className="block space-y-1 text-sm">
            <span>کلید کالاها (هر خط یک ExternalKey)</span>
            <textarea
              dir="ltr"
              rows={5}
              value={keysText}
              onChange={(e) => setKeysText(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2 font-mono text-xs"
              placeholder="p-xxx&#10;p-yyy"
            />
          </label>

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.showReviewScore}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    showReviewScore: e.target.checked,
                  }))
                }
              />
              نمایش امتیاز نظرات روی کارت
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.showCardLabels}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    showCardLabels: e.target.checked,
                  }))
                }
              />
              نمایش برچسب‌های کارت (انتخاب میکپلاس / فرصت خرید)
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.showUsedLabel}
                onChange={(e) =>
                  setForm((p) => ({ ...p, showUsedLabel: e.target.checked }))
                }
              />
              برچسب کارکرده
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((p) => ({ ...p, isActive: e.target.checked }))
                }
              />
              فعال
            </label>
          </div>

          <label className="block max-w-xs space-y-1 text-sm">
            <span>موقعیت برچسب</span>
            <select
              value={form.labelPosition}
              onChange={(e) =>
                setForm((p) => ({ ...p, labelPosition: e.target.value }))
              }
              className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
            >
              <option value="beside">کنار تصویر</option>
              <option value="top">بالای تصویر</option>
            </select>
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
        empty="ریلی ثبت نشده"
      />
    </RequireAdmin>
  );
}
