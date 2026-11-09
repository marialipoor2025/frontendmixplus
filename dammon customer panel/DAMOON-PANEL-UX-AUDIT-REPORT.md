# Damoon Customer Club Panel — UI/UX Audit & Redesign Proposal

**Product:** [panel.damoon-co.com](https://panel.damoon-co.com/) — Damoon Hyper Industry Customer Club  
**Audience:** Management / Product / Engineering  
**Audit date:** 6 Nov 2026 (Jalali context observed in UI: 1405)  
**Method:** Live authenticated walkthrough of all primary routes, screenshot capture, frontend asset inspection  
**Account used for as-is review:** customer account (B2B buyer role)

---

## 1. Executive summary

The Damoon Customer Club is a **B2B procurement portal** for industrial refrigeration equipment. Customers browse a deep product taxonomy, create purchase requests (معامله / deal), receive proformas, track invoices/payments, and manage account data.

**Verdict (as-is):** Visually modern and brand-consistent (navy, RTL, IRANSans), but **journey fragmentation** reduces trust and speed. Key friction:

1. **External redirects** (especially invoices → Didar CRM) break the “one panel” promise.
2. **Icon-only primary nav** and **duplicated category navigation** increase cognitive load.
3. **Oversized hero banners** on almost every page push useful content below the fold.
4. **Captcha-gated auth** (and again on checkout) adds friction without progressive trust alternatives (OTP/SMS).
5. **Two parallel request flows** (cart/checkout vs manual “ثبت درخواست”) are not clearly distinguished.

**Recommendation (to-be):** Keep the current brand and stack; redesign **information architecture + journey continuity** so catalog → request → proforma → invoice → payment stays **inside one shell**, with labeled navigation, denser lists, and status pipelines.

| Artifact | Location |
|---|---|
| As-is screenshots | `dammon customer panel/screenshots/` |
| To-be mockup images | `dammon customer panel/mockups/` |
| Figma design file | [Damoon Panel UX Redesign – To-Be](https://www.figma.com/design/aSRpU6V5SBAT1DmkFfZtEr?node-id=5-2) |
| **Figma live prototype (share with managers)** | [Open clickable To-Be tour](https://www.figma.com/proto/aSRpU6V5SBAT1DmkFfZtEr/Damoon-Panel-UX-Redesign-%E2%80%93-To-Be?page-id=5%3A2&node-id=5-3&starting-point-node-id=5%3A3&scaling=contain&content-scaling=fixed) |
| **BPMN as-is process map (bpmn.io)** | [`dammon customer panel/bpmn/damoon-customer-club-processes.bpmn`](bpmn/damoon-customer-club-processes.bpmn) — open at [demo.bpmn.io](https://demo.bpmn.io/) |

---

## 2. Technology stack (observed)

| Layer | Evidence | Notes |
|---|---|---|
| **Language / direction** | `html lang="fa" dir="rtl"` | Full Persian RTL experience |
| **CSS** | `/css/app.css` — **Tailwind CSS v4.3.3** | Utility-first; brand tokens (`bg-brand`, `text-ink`, `bg-brand-soft`) |
| **Typography** | `--font-sans: "IRANSans", Tahoma, sans-serif` | Appropriate Persian corporate type |
| **Client JS** | `/js/panel.js?v=24` (minified IIFE) | Cart in `localStorage` (`damoon.purchase.cart:*`), drawer pin state, quantity steppers |
| **Auth pages JS** | `/js/auth.js`, `particles.min.js` | Captcha refresh + decorative particles |
| **SPA framework** | **None detected** (no React/Vue/Next markers) | Multi-page app with progressive enhancement |
| **Backend shape** | Classic form POST `/login`, server-rendered HTML titles per route | Likely Node/Laravel-style MPA (not confirmed from UI alone) |
| **CRM / finance integration** | Invoice deep-links to **`app.didar.me`** | Didar CRM customer invoice portal |
| **Identifiers** | Purchase request IDs look Mongo-like hex; proforma IDs numeric | Suggests hybrid data sources / sync |

**Implication for redesign:** Frontend can evolve incrementally (Tailwind + JS) without a full rewrite; the bigger win is **IA, in-panel document viewing, and journey glue**, not a new framework.

---

## 3. Product purpose & primary personas

### 3.1 What the panel is for

Enable Damoon B2B customers to:

- Discover products across industrial categories (valves, cold rooms, compressors, controls, condensers/evaporators, consumables).
- Submit purchase interest / deals with quantities and attachments.
- Review proformas and invoices.
- Track payment status and submit payment notices (اعلام پرداخت).
- Maintain company/contact/shipping profile.

### 3.2 Personas

| Persona | Goals | Pain today |
|---|---|---|
| **Buyer / technical purchaser** | Find SKU fast, request quote, compare proformas | Deep category nesting; hard to scan SKUs as a table |
| **Finance contact** | See debt, pay, upload receipt | Finance split across tabs + Didar redirect for invoices |
| **Company admin** | Keep addresses/phones correct | Long single form; weak section hierarchy |
| **New registrant** | Create account | Captcha; unclear “customer vs club member” messaging on login |

---

## 4. Complete page inventory (as-is)

### 4.1 Public / auth

| Route | Purpose | Notes |
|---|---|---|
| `/login` | Sign in with email **or** mobile + password + **captcha** | Split layout; particles background; no “forgot password” visible |
| `/register` | Create account (name, email, mobile, password, captcha) | Logged-in users are redirected away from register → dashboard |

### 4.2 Shell (shared chrome)

Present on authenticated pages:

- **Icon rail (right):** پیشخوان، محصولات، درخواست‌ها، ثبت درخواست، مالی، گزارش‌ها، تنظیمات، خروج  
- **Flyout / secondary drawer:** category shortcuts + text labels when expanded; pin state in `localStorage`  
- **Global product search** combobox  
- **Cart** button → leads toward checkout  
- **User chip** → `/account`

### 4.3 Authenticated pages

| Route | Purpose | Key UI |
|---|---|---|
| `/` **پیشخوان** | Status at a glance | Greeting hero; KPI cards (open requests, proformas, unpaid invoices, balance); recent deals; recent invoices |
| `/products` | Category hub | 6 category cards + duplicated category list in drawer |
| `/products?cat=*` | Category browse | Subcategory cards (e.g. شیرآلات → بال ولو، چک ولو، …) |
| `/products?cat=*&sub=*` | Subcategory / brand groups | Further nesting (e.g. بال ولو دانفوس) |
| `/products?cat=*&sub=*&group=*` | Product group listing | Path to SKU-level add-to-cart (cart stored locally) |
| `/checkout` | Submit cart as purchase order | Empty-state when cart empty; notes + **captcha** again |
| `/requests` | List deals + toggle to invoices | Tabs: `?tab=demands` / `?tab=invoices` |
| `/requests/new` | Manual request composer | Product search/add table, description, file attach (JPG/PNG/PDF), security code field |
| `/purchase-requests/:id` | Deal detail | Items, expert contact, notes, history/comments |
| `/proformas/:id` | Proforma document view | Line items, totals, print/PDF; stays on Damoon domain |
| `/finance` | Payments hub | Tabs: `payments` / `status` / `submit` |
| `/finance?tab=status` | Debt / settlement status | Per-deal unpaid amounts |
| `/finance?tab=submit` | اعلام پرداخت | Bank, amount, date, cheque fields, deal picker, attachment |
| `/finance?tab=payments` | Payment history | Sparse when empty |
| `/reports` | Purchase analytics | Invoice trend, category mix, value/quantity summaries |
| `/account` | Profile & password | Personal fields, invoice/shipping address, password change, “بیشترین خرید” style insights |
| `/logout` | End session | Returns to login |

### 4.4 External destinations (redirects / exits)

| From | To | Impact |
|---|---|---|
| Dashboard / invoices list “فاکتور” | **`https://app.didar.me/customer/invoice/...`** | Leaves Damoon shell; new brand, new auth context risk, broken back-stack |
| Logged-in visit to `/register` | `/` dashboard | Expected, but feels like a “broken link” if bookmarked |
| Some CTA wording vs destination | e.g. KPI cards all funnel to `/requests` or `/finance?tab=status` | OK, but invoice deep-link inconsistency remains |

**This is the #1 UX risk managers should prioritize.** Proformas stay in-panel; invoices do not. Customers experience “half portal, half CRM.”

---

## 5. User journeys & user stories

### 5.1 As-is journey map

```text
Login (+ captcha)
  → Dashboard KPIs
      → Browse Products (cat → sub → group → SKU)
          → Add to cart (localStorage)
              → Checkout (+ captcha) → creates deal
      OR → New Request form (search/attach) → creates deal
  → Requests list → Deal detail → Proforma (in-panel)
  → Invoice click → REDIRECT Didar
  → Finance status / submit payment notice
  → Reports / Account
```

### 5.2 User stories (current capability → gap)

| ID | User story | As-is | Gap |
|---|---|---|---|
| US-01 | As a customer, I can log in with mobile or email | Works | Captcha friction; no forgot-password; dual audience copy confusing |
| US-02 | As a buyer, I can find a product by name/code | Global search exists | Results UX not as clear as a dedicated search results page |
| US-03 | As a buyer, I can navigate categories | Works, deep tree | Redundant UI (cards + rail + accordion); typo `compresor` in URL |
| US-04 | As a buyer, I can add items and checkout | Cart + `/checkout` | Cart empty-state OK; captcha on submit; relation to “ثبت درخواست” unclear |
| US-05 | As a buyer, I can open a free-form request with attachments | `/requests/new` | Overlaps with checkout; security code UX odd for authenticated users |
| US-06 | As a buyer, I can track deal stages | Status badges (ارتباط اولیه، پیگیری اول، …) | No visual pipeline; hard to see “what’s next” |
| US-07 | As a buyer, I can view proformas | In-panel `/proformas/:id` | Good — keep this pattern |
| US-08 | As a buyer, I can view invoices | Links out to Didar | **Breaks continuity**; should embed or proxy in-panel |
| US-09 | As finance, I can see outstanding balance | Dashboard + finance status | Good numbers; weak drill-down storytelling |
| US-10 | As finance, I can announce a payment | Submit form with many bank fields | Dense form; needs guided wizard + saved company bank prefs |
| US-11 | As a user, I can update profile/addresses | Account page | Long page; success feedback unclear from structure alone |
| US-12 | As a manager-user, I can see purchase reports | Reports page | Charts present; limited filters/export affordances |

### 5.3 Suggested epic backlog (to-be)

1. **Unified Order Lifecycle** — one object timeline: Request → Proforma → Invoice → Payment.  
2. **In-panel Documents** — PDF/HTML viewer for invoices (sync from Didar, don’t redirect).  
3. **Catalog Productivity** — table mode, sticky cart, filters, keyboard-friendly qty.  
4. **Auth modernization** — OTP / forgot password; captcha only on risk signals.  
5. **Nav clarity** — labeled rail + merge “ثبت درخواست” into Requests primary CTA.

---

## 6. As-is UI/UX findings

### 6.1 What works

- Strong brand color (navy) and RTL correctness.
- Useful dashboard KPIs tied to real data (open deals, balance).
- Proforma page is document-grade and printable.
- Pin-able secondary nav shows good desktop craft.
- Reports page already thinks in business questions (value over time, category mix).

### 6.2 Critical issues

| Severity | Issue | Why it matters |
|---|---|---|
| **P0** | Invoice → Didar redirect | Trust & support load; “why did I leave Damoon?” |
| **P0** | Dual request paths unclear | Wrong path → wrong expectation of pricing/SLA |
| **P1** | Icon-only primary nav | New users guess; hover-only labels fail on touch |
| **P1** | Hero banners on every page | Low density; extra scroll on laptop screens |
| **P1** | Captcha for authenticated actions | Feels like distrust after login |
| **P2** | Category UI duplication | Same links in rail, accordion, and cards |
| **P2** | Deep nesting before SKU | Many clicks for expert buyers who know codes |
| **P2** | URL typo `compresor` | Polish / SEO / bookmark fragility |
| **P2** | Login copy about “club members vs customers” | Ambiguous without role education |
| **P3** | Particles on auth | Decorative cost; little brand meaning vs product photography |

### 6.3 Heuristic scores (0–5)

| Heuristic | Score | Comment |
|---|---|---|
| Visibility of system status | 3.5 | KPIs good; lifecycle pipeline weak |
| Match with real world (B2B procurement) | 4 | Domain language mostly right |
| User control / freedom | 3 | External CRM reduces control |
| Consistency & standards | 3 | Mixed document hosts |
| Error prevention | 3 | Captcha ≠ good validation UX |
| Recognition rather than recall | 2.5 | Icon rail |
| Flexibility & efficiency | 3 | Search helps power users |
| Aesthetic & minimalist design | 3 | Pretty but banner-heavy |
| Help recover from errors | 2.5 | Limited inline guidance |
| Accessibility | 3 | Some `sr-only` labels; captcha image weak for a11y |

**Overall as-is UX score: ~3.1 / 5**

---

## 7. To-be experience (proposed)

### 7.1 Design principles

1. **One shell, one journey** — never dump users to another product for core artifacts.  
2. **Labels over mystery icons** for primary nav.  
3. **Density for experts** — tables, filters, sticky summary; marketing heroes only on marketing pages.  
4. **Status as a pipeline** — show next required action on every deal.  
5. **Trust after auth** — drop captcha post-login; use rate limits / device risk.

### 7.2 Proposed IA

```text
پیشخوان
کاتالوگ
  └─ (filters / search / cart drawer)
درخواست‌ها
  ├─ همه معاملات
  ├─ پیش‌فاکتورها
  ├─ فاکتورها          ← in-panel viewer
  └─ ثبت درخواست جدید  ← wizard (from catalog or blank)
مالی
  ├─ خلاصه بدهی
  ├─ پرداخت‌ها
  └─ اعلام واریز
گزارش‌ها
حساب کاربری
```

### 7.3 Page-by-page to-be

| Page | To-be intent |
|---|---|
| **Login** | OTP or password; forgot password; clearer audience messaging; product photography instead of particles |
| **Dashboard** | Compact greeting + 4 KPIs + “needs attention” list (deals waiting on customer) |
| **Products** | Faceted catalog; list/table default; fewer nested card pages; sticky mini-cart |
| **Requests** | Pipeline header + filterable table; row actions: view, proforma, pay |
| **New request** | 3-step wizard: items → notes/attachments → confirm |
| **Deal detail** | Timeline + documents strip (proforma/invoice/payment) |
| **Finance** | Single ledger mental model; announce payment as guided modal |
| **Reports** | Date range, export Excel/PDF, click-through to filtered requests |
| **Account** | Tabbed: profile / addresses / security |

### 7.4 Visual references (generated mockups)

Stored under `dammon customer panel/mockups/`:

- `tobe-login.jpg`
- `tobe-dashboard.jpg`
- `tobe-products.jpg`
- `tobe-requests.jpg`
- `tobe-new-request.jpg`
- `tobe-finance.jpg`

Editable skeleton frames also live in Figma:  
https://www.figma.com/design/aSRpU6V5SBAT1DmkFfZtEr

*(Figma currently holds structured page frames + cover for workshopping; mockup JPGs are the high-fidelity presentation visuals.)*

---

## 8. As-is vs to-be comparison

| Dimension | As-is | To-be |
|---|---|---|
| Invoice viewing | External Didar | In-panel document (synced) |
| Navigation | Icon rail | Labeled rail + fewer duplicate trees |
| Request creation | Checkout **and** free-form form | One wizard with two entry points (cart / blank) |
| Page chrome | Large hero every screen | Compact headers |
| Auth friction | Always captcha | Risk-based / OTP |
| Deal understanding | Status chip only | Pipeline + next action |
| Catalog | Card drilling | Table + facets for power users |
| Success metric | Pages exist | Time-to-proforma & payment completion ↑ |

---

## 9. Implementation roadmap (management view)

### Phase A — Continuity (2–4 weeks)

- Proxy or embed Didar invoices inside Damoon shell (SSO if available).  
- Add “next action” on deal cards.  
- Label primary nav.

### Phase B — Catalog productivity (3–5 weeks)

- SKU table views, persistent filters, sticky cart.  
- Unify checkout + new request into wizard.  
- Remove post-login captcha.

### Phase C — Finance & reporting polish (3–4 weeks)

- Payment announcement wizard + saved defaults.  
- Report exports and drill-downs.  
- Account page tabs.

### Phase D — Auth & onboarding (2–3 weeks)

- OTP / forgot password.  
- Onboarding checklist for new companies.

**Rough outcome target:** cut average clicks from “search → submit request” by ~30%, and eliminate 100% of invoice off-domain exits for logged-in customers.

---

## 10. Risks & decisions needed from management

1. **Didar contract / API** — Can invoices be rendered in-panel legally and technically?  
2. **Single request model** — Confirm product/sales process wants cart-checkout and free-form request merged.  
3. **Pricing visibility** — Some lines show negotiated/empty prices; decide when list price vs “قیمت توافقی” appears.  
4. **Mobile priority** — Current shell is desktop-first; confirm if field engineers need a mobile-critical path.  
5. **Brand photography** — Replace particle art with real Damoon industrial imagery for trust.

---

## 11. Appendix A — Screenshot index (as-is)

| File | Page |
|---|---|
| `screenshots/01-login.png` | Login |
| `screenshots/05-post-login.png` | Dashboard |
| `screenshots/07-products.png` | Products hub |
| `screenshots/15-products-valves.png` | Category: valves |
| `screenshots/21-products-ball-valve.png` | Subcategory: ball valve |
| `screenshots/08-requests.png` | Requests list |
| `screenshots/09-requests-new.png` | New request |
| `screenshots/14-purchase-request-detail.png` | Deal detail |
| `screenshots/16-proforma.png` | Proforma |
| `screenshots/19-invoices.png` | Invoices tab |
| `screenshots/10-finance.png` | Finance |
| `screenshots/17-finance-status.png` | Finance status |
| `screenshots/18-finance-submit.png` | Submit payment |
| `screenshots/11-reports.png` | Reports |
| `screenshots/12-account.png` | Account |
| `screenshots/20-checkout.png` | Checkout |
| `screenshots/22-register.png` | Register |

---

## 12. Appendix B — Presentation talking points (5 minutes)

1. Panel is already a real B2B club with solid data surfaces.  
2. Biggest hole is **journey breakage on invoices (Didar)**.  
3. UX is “pretty SaaS” but **banner-heavy and icon-ambiguous**.  
4. Two request entry points confuse buyers.  
5. Proposed to-be keeps brand/stack; fixes IA + document continuity.  
6. Ask for decision on Didar embedding + Phase A budget.

---

*Prepared for Damoon management review. Live panel URL: https://panel.damoon-co.com/*
