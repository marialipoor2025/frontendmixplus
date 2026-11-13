"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { ProductBreadcrumb } from "@/components/product/ProductBreadcrumb";
import { siteConfig } from "@/config/site";
import { searchProductsApi } from "@/lib/api/search";
import { formatPrice, toFaDigits } from "@/lib/format";
import type { Product } from "@/types/product";
import type { BreadcrumbItem } from "@/types/product-detail";

type LineItem = {
  id: string;
  title: string;
  unitPrice: number;
  qty: number;
};

const BREADCRUMB: BreadcrumbItem[] = [
  { id: "home", title: siteConfig.nameFa, href: "/" },
  { id: "proforma", title: "صدور پیش فاکتور", href: "/proforma-invoice" },
];

function FieldIconUser() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" fill="none" viewBox="0 0 16 18" className="shrink-0" aria-hidden>
      <path stroke="#717888" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 16.5c0-1.163 0-1.745-.143-2.218a3.33 3.33 0 0 0-2.222-2.222c-.474-.143-1.055-.143-2.218-.143H6.25c-1.163 0-1.744 0-2.217.143a3.33 3.33 0 0 0-2.222 2.222c-.144.473-.144 1.055-.144 2.218M12.084 5.25a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0" />
    </svg>
  );
}

function FieldIconPhone() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18" className="shrink-0" aria-hidden>
      <path stroke="#717888" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.037 6.325c.58 1.208 1.37 2.34 2.372 3.342a12.2 12.2 0 0 0 3.342 2.372c.104.05.156.074.221.094.234.068.52.019.719-.123.055-.04.103-.087.198-.183.292-.291.437-.437.584-.532a1.67 1.67 0 0 1 1.817 0c.146.095.292.241.583.532l.163.163c.442.443.664.664.784.902.24.473.24 1.031 0 1.504-.12.238-.341.46-.784.902l-.132.132c-.441.441-.662.662-.962.83-.333.187-.85.322-1.232.32-.344 0-.579-.067-1.05-.2a15.87 15.87 0 0 1-6.902-4.062 15.87 15.87 0 0 1-4.062-6.903c-.133-.47-.2-.705-.2-1.05a2.8 2.8 0 0 1 .32-1.231c.168-.3.389-.521.83-.962l.131-.132c.443-.443.665-.664.903-.784a1.67 1.67 0 0 1 1.504 0c.238.12.46.341.902.784l.163.163c.29.29.437.437.532.583.359.552.359 1.265 0 1.817-.095.147-.241.292-.532.584-.096.095-.143.142-.183.198a.87.87 0 0 0-.123.718c.02.066.044.118.094.222" />
    </svg>
  );
}

function FieldIconCompany() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="18" fill="none" viewBox="0 0 19 18" className="shrink-0" aria-hidden>
      <path stroke="#717888" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5.916 8.167H3.5c-.467 0-.7 0-.879.09a.83.83 0 0 0-.364.365c-.09.178-.09.411-.09.878v7m3.75-8.333V16.5m0-8.333v-4c0-.934 0-1.4.181-1.757.16-.314.415-.569.728-.728.357-.182.824-.182 1.757-.182h2.167c.933 0 1.4 0 1.756.182.314.16.569.414.729.728.181.357.181.823.181 1.757v4M2.166 16.5h3.75m-3.75 0h-.833m12.083-8.333h2.417c.467 0 .7 0 .878.09.157.08.285.208.365.365.09.178.09.411.09.878v7m-3.75-8.333V16.5m3.75 0H18m-.834 0h-3.75m0 0h-7.5M8.833 4.833H10.5M8.833 8.167H10.5M8.833 11.5H10.5" />
    </svg>
  );
}

function FieldIconAddress() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="none" viewBox="0 0 19 19" className="shrink-0" aria-hidden>
      <path stroke="#717888" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.833 11.562c-1.543.681-2.5 1.63-2.5 2.678 0 2.071 3.731 3.75 8.333 3.75S18 16.312 18 14.24c0-1.049-.957-1.997-2.5-2.678m-.834-5.238c0 3.386-3.75 5-5 7.5-1.25-2.5-5-4.114-5-7.5a5 5 0 0 1 10 0m-4.166 0a.833.833 0 1 1-1.667 0 .833.833 0 0 1 1.667 0" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden>
      <path fill="#717888" d="M19.293 21.707a1 1 0 0 0 1.414-1.414zM17 11.5a6.5 6.5 0 0 1-6.5 6.5v2a8.5 8.5 0 0 0 8.5-8.5zM10.5 18A6.5 6.5 0 0 1 4 11.5H2a8.5 8.5 0 0 0 8.5 8.5zM4 11.5A6.5 6.5 0 0 1 10.5 5V3A8.5 8.5 0 0 0 2 11.5zM10.5 5a6.5 6.5 0 0 1 6.5 6.5h2A8.5 8.5 0 0 0 10.5 3zm10.207 15.293-4.187-4.188-1.415 1.415 4.188 4.187z" />
    </svg>
  );
}

/**
 * barghchi-style proforma invoice builder.
 */
export function ProformaInvoicePage() {
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState<LineItem[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);

  const total = useMemo(
    () => items.reduce((sum, row) => sum + row.unitPrice * row.qty, 0),
    [items],
  );

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const id = window.setTimeout(() => {
      setSearching(true);
      void searchProductsApi(q)
        .then((rows) => {
          if (!cancelled) setResults(rows ?? []);
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, 280);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [query]);

  const addProduct = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p,
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          unitPrice: product.price.amount,
          qty: 1,
        },
      ];
    });
    setQuery("");
    setResults([]);
    setSearchOpen(false);
  }, []);

  function setQty(id: string, qty: number) {
    const next = Math.max(1, Math.floor(qty) || 1);
    setItems((prev) =>
      prev.map((row) => (row.id === id ? { ...row, qty: next } : row)),
    );
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((row) => row.id !== id));
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = "نام و نام خانوادگی الزامی است";
    if (!/^09\d{9}$/.test(mobile.trim())) {
      next.mobile = "شماره موبایل معتبر وارد کنید";
    }
    if (!address.trim()) next.address = "آدرس الزامی است";
    if (items.length === 0) next.items = "حداقل یک محصول اضافه کنید";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    setToast("پیش‌فاکتور آماده چاپ است");
    window.setTimeout(() => window.print(), 200);
  }

  return (
    <div className="site-container py-4 lg:py-6">
      <div className="print:hidden">
      <ProductBreadcrumb items={BREADCRUMB} />

      <div className="mb-6">
        <h1 className="mb-4 text-xl font-bold text-[var(--color-neutral-900)]">
          صدور پیش فاکتور
        </h1>
        <p className="text-sm leading-8 text-[var(--color-neutral-600)] md:text-base">
          در این بخش، می‌توانید محصولات مورد نظر خود را به لیست پیش‌فاکتور اضافه
          کرده و پس از تکمیل فرم، پیش‌فاکتور خود را به صورت PDF دریافت کنید.
          همچنین، در صورت آماده بودن لیست محصولات، می‌توانید فایل خود را از طریق
          بخش
          <Link
            href="/enquiry"
            className="inline-block px-1 font-bold text-[#2a75bb]"
          >
            درخواست پیش‌فاکتور
          </Link>
          برای ما ارسال کنید.
        </p>
      </div>

      <div className="gap-6 md:flex">
        {/* Customer + totals */}
        <div className="mb-4 w-full md:mb-0 md:w-80">
          <div className="overflow-hidden rounded-md border border-[var(--color-neutral-200)]">
            <div className="bg-[#F1F9FF] px-4 py-2.5 text-sm font-bold text-[#2a75bb]">
              اطلاعات مشتری
            </div>
            <form id="invoiceForm" className="p-4" onSubmit={handleSubmit}>
              <div className="mb-4 border-b border-[var(--color-neutral-100)]">
                <label className="flex items-center gap-2 text-xs font-bold text-[var(--color-neutral-400)]" htmlFor="fullName">
                  <FieldIconUser />
                  نام و نام خانوادگی
                  <span className="text-red-500">*</span>
                </label>
                <div className="py-2">
                  <input
                    id="fullName"
                    name="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="نام و نام خانوادگی"
                    className="block w-full rounded border border-[#2a75bb] px-4 py-2 text-xs text-[var(--color-neutral-900)] outline-none focus:border-[#2a75bb]"
                  />
                </div>
                {errors.fullName ? (
                  <p className="pb-2 text-xs text-red-800">{errors.fullName}</p>
                ) : null}
              </div>

              <div className="mb-4 border-b border-[var(--color-neutral-100)]">
                <label className="flex items-center gap-2 text-xs font-bold text-[var(--color-neutral-400)]" htmlFor="mobile">
                  <FieldIconPhone />
                  تلفن همراه
                  <span className="text-red-500">*</span>
                </label>
                <div className="py-2">
                  <input
                    id="mobile"
                    name="mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="09121234567"
                    inputMode="tel"
                    className="block w-full rounded border border-[#2a75bb] px-4 py-2 text-xs text-[var(--color-neutral-900)] outline-none focus:border-[#2a75bb]"
                    dir="ltr"
                  />
                </div>
                {errors.mobile ? (
                  <p className="pb-2 text-xs text-red-800">{errors.mobile}</p>
                ) : null}
              </div>

              <div className="border-b border-[var(--color-neutral-100)]">
                <label className="flex items-center gap-2 text-xs font-bold text-[var(--color-neutral-400)]" htmlFor="company">
                  <FieldIconCompany />
                  نام شرکت
                </label>
                <div className="py-2">
                  <input
                    id="company"
                    name="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="شرکت ..."
                    className="block w-full rounded border border-[#2a75bb] px-4 py-2 text-xs text-[var(--color-neutral-900)] outline-none focus:border-[#2a75bb]"
                  />
                </div>
              </div>
            </form>

            <div className="p-4 pt-0">
              <label className="flex items-center gap-2 text-xs font-bold text-[var(--color-neutral-400)]" htmlFor="address">
                <FieldIconAddress />
                آدرس
                <span className="text-red-500">*</span>
              </label>
              <div className="py-2">
                <input
                  id="address"
                  name="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="آدرس ..."
                  className="block w-full rounded border border-[#2a75bb] px-4 py-2 text-xs text-[var(--color-neutral-900)] outline-none focus:border-[#2a75bb]"
                />
              </div>
              {errors.address ? (
                <p className="text-xs text-red-800">{errors.address}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-md border border-[var(--color-neutral-200)]">
            <div className="bg-[#F1F9FF] px-4 py-2.5 text-sm font-bold text-[#2a75bb]">
              جمع هزینه ها
            </div>
            <div className="flex items-center justify-between border-b border-[var(--color-neutral-100)] px-4 py-2.5 text-sm text-[var(--color-neutral-500)]">
              <span>واحد پول:</span>
              <span className="text-xs font-medium text-[#2a75bb]">تومان</span>
            </div>
            <div className="px-4 py-2.5 text-sm text-[var(--color-neutral-500)]">
              <div>هزینه ها به عدد:</div>
              <div className="pt-4 font-bold text-[var(--color-neutral-900)]">
                {toFaDigits(formatPrice(total))} تومان
              </div>
            </div>
          </div>

          <div className="mt-4 text-left">
            <button
              type="submit"
              form="invoiceForm"
              className="inline-flex w-full items-center justify-center rounded-md bg-[#08a54a] px-4 py-2 text-xs text-white md:px-8 md:text-base"
            >
              صدور پیش فاکتور
            </button>
            <Link
              href="/cart"
              className={`mt-2 flex w-full cursor-pointer items-center justify-center rounded-md py-2 text-sm text-white transition ${
                items.length === 0
                  ? "pointer-events-none bg-[var(--color-neutral-300)]"
                  : "bg-[#2a75bb] hover:opacity-95"
              }`}
            >
              خرید آنلاین
            </Link>
          </div>
        </div>

        {/* Line items */}
        <div className="min-w-0 flex-1">
          <div className="mb-4 rounded-lg border border-[var(--color-neutral-200)] bg-[#F1F9FF] py-2.5 text-center text-sm font-bold text-[#2a75bb]">
            اقلام پیش فاکتور
          </div>

          <div className="overflow-hidden rounded-lg border border-[var(--color-neutral-200)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] font-semibold">
                  <td className="hidden px-4 py-3 sm:table-cell">ردیف</td>
                  <td className="px-4 py-3">نام محصول</td>
                  <td className="hidden py-3 text-center sm:table-cell">تعداد</td>
                  <td className="py-3 text-center">قیمت واحد (تومان)</td>
                  <td className="py-3 text-center">قیمت کل (تومان)</td>
                  <td className="hidden py-3 text-center sm:table-cell">حذف</td>
                </tr>
              </thead>
              <tbody>
                {items.map((row, index) => (
                  <tr key={row.id} className="border-b border-[var(--color-neutral-100)]">
                    <td className="hidden px-4 py-3 sm:table-cell">
                      {toFaDigits(String(index + 1))}
                    </td>
                    <td className="max-w-[12rem] truncate px-4 py-3" title={row.title}>
                      {row.title}
                    </td>
                    <td className="hidden py-3 text-center sm:table-cell">
                      <input
                        type="number"
                        min={1}
                        value={row.qty}
                        onChange={(e) => setQty(row.id, Number(e.target.value))}
                        className="mx-auto w-16 rounded border border-[var(--color-neutral-200)] px-2 py-1 text-center text-xs"
                      />
                    </td>
                    <td className="py-3 text-center">
                      {toFaDigits(formatPrice(row.unitPrice))}
                    </td>
                    <td className="py-3 text-center font-medium">
                      {toFaDigits(formatPrice(row.unitPrice * row.qty))}
                    </td>
                    <td className="hidden py-3 text-center sm:table-cell">
                      <button
                        type="button"
                        onClick={() => removeItem(row.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center border-t border-[var(--color-neutral-200)] px-2 sm:px-4">
              <div className="p-3">
                <span className="inline-flex size-6 items-center justify-center rounded-full border border-[#08a54a] text-[#08a54a]">
                  +
                </span>
              </div>
              <div className="relative flex-1 py-3 pe-2">
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="محصول مورد نظر خود را جستجو کنید"
                  className="w-full rounded-lg border border-[var(--color-neutral-200)] py-2 pe-4 ps-10 text-sm text-[var(--color-neutral-800)] outline-none placeholder:text-[var(--color-neutral-400)] focus:border-[#2a75bb]"
                  autoComplete="off"
                />
                <span className="absolute start-3 top-1/2 -translate-y-1/2">
                  <SearchIcon />
                </span>
                {searchOpen && query.trim().length >= 2 ? (
                  <div className="absolute inset-x-0 top-full z-40 mt-1 max-h-96 overflow-auto rounded-md bg-white shadow-md">
                    <div className="p-2 text-sm">
                      {searching ? (
                        <div className="px-2 py-3 text-[var(--color-neutral-500)]">
                          در حال جستجو…
                        </div>
                      ) : results.length === 0 ? (
                        <div className="px-2 py-3 text-[var(--color-neutral-500)]">
                          نتیجه ای یافت نشد
                        </div>
                      ) : (
                        results.slice(0, 12).map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => addProduct(product)}
                            className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-start hover:bg-[#F1F9FF]"
                          >
                            <span className="line-clamp-2 text-xs font-medium text-[var(--color-neutral-800)]">
                              {product.title}
                            </span>
                            <span className="shrink-0 text-xs text-[#2a75bb]">
                              {toFaDigits(formatPrice(product.price.amount))}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {errors.items ? (
            <p className="mt-2 text-xs text-red-800">{errors.items}</p>
          ) : null}

          <div className="mt-0 hidden justify-between border border-t-0 border-[var(--color-neutral-200)] bg-[#F1F9FF] px-4 py-2.5 md:flex">
            <div className="flex text-sm">
              <span>جمع اقلام:</span>
              <div className="pe-0 ps-2 font-bold text-[#2a75bb]">
                {toFaDigits(String(items.length))} مورد
              </div>
            </div>
            <div className="flex items-start text-sm">
              <span>جمع کل (تومان) :</span>
              <div className="ps-6 font-bold">
                {toFaDigits(formatPrice(total))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-center text-sm text-[#f17603]">
            <span className="mt-0.5 shrink-0" aria-hidden>
              ⚠
            </span>
            <p className="flex-1 ps-2 leading-7">
              توجه: این قسمت مخصوص صدور پیش‌فاکتور خریدهای عمده و شرکتی است. برای
              خرید آنلاین، لطفاً محصولات را به سبد خرید اضافه کرده و مراحل خرید
              را تکمیل کنید.
            </p>
          </div>
        </div>
      </div>

      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-lg bg-[var(--color-neutral-800)] px-4 py-2.5 text-sm font-medium text-white shadow-lg print:hidden"
        >
          {toast}
        </div>
      ) : null}
      </div>

      {/* Printable summary */}
      <div className="hidden print:block">
        <h1 className="mb-4 text-lg font-bold">پیش‌فاکتور — {siteConfig.nameFa}</h1>
        <p>نام: {fullName}</p>
        <p>موبایل: {mobile}</p>
        {company ? <p>شرکت: {company}</p> : null}
        <p>آدرس: {address}</p>
        <table className="mt-4 w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border p-2">محصول</th>
              <th className="border p-2">تعداد</th>
              <th className="border p-2">قیمت واحد</th>
              <th className="border p-2">جمع</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id}>
                <td className="border p-2">{row.title}</td>
                <td className="border p-2 text-center">{row.qty}</td>
                <td className="border p-2 text-center">{formatPrice(row.unitPrice)}</td>
                <td className="border p-2 text-center">
                  {formatPrice(row.unitPrice * row.qty)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 font-bold">جمع کل: {formatPrice(total)} تومان</p>
      </div>
    </div>
  );
}
