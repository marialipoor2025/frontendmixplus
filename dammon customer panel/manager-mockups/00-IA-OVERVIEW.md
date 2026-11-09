# Damoon Customer Panel — New Design Proposal (Manager Pack)

**Role:** UI/UX redesign for a **standard B2B customer panel**  
**Brand:** هایپرصنعت دامون — navy industrial, RTL Persian  
**Audience:** Technical buyers + finance contacts  
**Purpose of this folder:** Visual approval pack before implementation

---

## Design principles

1. One shell, one journey (catalog → request → quote → invoice → pay)
2. Labeled sidebar (never icon-only)
3. Dense expert UI (tables, filters, pipelines) — not marketing banners
4. Documents stay inside the panel
5. Clear next action on every deal

---

## Information architecture (proposed)

```text
ورود / ثبت‌نام
پیشخوان
کاتالوگ
درخواست‌ها          ← includes «ثبت درخواست جدید»
  └─ جزئیات معامله
اسناد               ← NEW: پیش‌فاکتور + فاکتور + رسید (in-panel)
مالی
پشتیبانی            ← NEW: تیکت / پیام به کارشناس
گزارش‌ها
حساب کاربری
  └─ پروفایل · آدرس‌ها · امنیت
```

---

## Page decisions vs old panel

| Decision | Page | Rationale |
|---|---|---|
| **Keep + redesign** | Login, Dashboard, Catalog, Requests, Deal detail, Finance, Reports, Account | Core B2B journeys |
| **Merge** | Checkout + «ثبت درخواست» → one **New Request wizard** | Removes dual-path confusion |
| **Merge** | Proforma + Invoices → **Documents hub** (+ open from deal) | One place for all docs; no Didar exit |
| **Add** | Support / tickets | Standard customer-panel expectation |
| **Add** | Deal pipeline + next-action UI | Quote-to-cash clarity |
| **Remove as nav** | Separate «ثبت درخواست» icon | Becomes CTA inside Requests |
| **Remove** | Deep category card tunnel | Replaced by filtered catalog + SKU table |
| **Remove** | Captcha after login | Trust the session |

---

## Image index (show these to managers)

| # | File | Screen |
|---|---|---|
| 01 | `01-login.jpg` | Login |
| 02 | `02-dashboard.jpg` | Dashboard / پیشخوان |
| 03 | `03-catalog.jpg` | Catalog hub |
| 04 | `04-sku-list.jpg` | SKU table + mini-cart |
| 05 | `05-request-wizard.jpg` | New request wizard |
| 06 | `06-requests.jpg` | Requests list + pipeline |
| 07 | `07-deal-detail.jpg` | Deal detail + timeline |
| 08 | `08-documents.jpg` | Documents hub (in-panel) **NEW** |
| 09 | `09-finance.jpg` | Finance ledger + pay |
| 10 | `10-support.jpg` | Support tickets **NEW** |
| 11 | `11-reports.jpg` | Reports |
| 12 | `12-account.jpg` | Account (tabbed) |

---

## Visual system (for implementation)

| Token | Value |
|---|---|
| Primary navy | `#0B2A4A` |
| Surface | `#F3F6F9` |
| Accent steel | `#1F6F8B` |
| Success | `#2F7D4A` |
| Warning | `#C47E1A` |
| Danger | `#B42318` |
| Font | Vazirmatn / IRANSans |
| Layout | RTL, right sidebar ~240px, compact top bar |

---

*Images are conceptual UI mockups for stakeholder alignment — not production code.*
