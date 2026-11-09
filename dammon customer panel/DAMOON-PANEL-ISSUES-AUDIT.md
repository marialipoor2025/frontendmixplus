# Damoon Customer Club — Bugs & Design Issues Audit

**Product:** [panel.damoon-co.com](https://panel.damoon-co.com/)  
**Date:** 6 Nov 2026  
**Scope:** Current (AS-IS) panel vs proposed (TO-BE) panel  
**Evidence:** Live walkthrough, screenshots, journey captures  
**TO-BE reference:** `to-be-redesign/` HTML mockups + Figma prototype

---

## How to read this file

| Field | Meaning |
|---|---|
| **ID** | Stable issue key (use in backlog / tickets) |
| **Severity** | P0 → P3 (see scale below) |
| **Type** | Bug · Design · IA · UX friction · A11y · Polish |
| **Current** | What happens in today’s panel |
| **TO-BE** | What we want in the new panel |
| **Where** | Route / surface |

### Severity scale

| Level | Name | Definition | Fix window |
|---|---|---|---|
| **P0** | Critical | Breaks the core journey, trust, or payment/document continuity | Phase A (first) |
| **P1** | High | Major friction every session; slows buyers / finance daily | Phase A–B |
| **P2** | Medium | Recurring confusion or inefficiency; not blocking | Phase B–C |
| **P3** | Low | Polish, copy, decoration; improve quality bar | Phase C–D |

---

## Summary counts

| Severity | Count |
|---|---|
| P0 Critical | 3 |
| P1 High | 8 |
| P2 Medium | 10 |
| P3 Low | 6 |
| **Total** | **27** |

---

## P0 — Critical

### P0-01 · Invoice opens outside Damoon (Didar redirect)
| | |
|---|---|
| **Type** | Bug / Journey break |
| **Where** | Dashboard recent invoices · `/requests?tab=invoices` · deal → invoice |
| **Current** | Clicking «فاکتور» leaves `panel.damoon-co.com` and opens `https://app.didar.me/customer/invoice/...`. New brand, new auth context, broken back-stack. Proformas stay in-panel; invoices do not. |
| **TO-BE** | Invoices render **inside Damoon shell** (embed / sync / proxy). Same document pattern as proforma. Optional “open source system” link only as secondary. |
| **Mockup** | `to-be-redesign/pages/11-invoices.html` |
| **Why P0** | #1 trust & support issue; customers ask “why did I leave Damoon?” |

---

### P0-02 · Two unclear paths to create a purchase request
| | |
|---|---|
| **Type** | IA / UX friction |
| **Where** | Cart → `/checkout` **vs** nav «ثبت درخواست» → `/requests/new` |
| **Current** | Two parallel flows create a deal. Cart/checkout feels like “order”; free-form form feels like “RFQ”. No guidance which to use, what SLA/pricing to expect, or how they relate. |
| **TO-BE** | **One request wizard** with two entry points: (A) from cart, (B) blank / search-add. Same confirmation, same deal object, same status pipeline. Nav shows one primary CTA under Requests. |
| **Mockup** | `06-checkout.html`, `07-request-new.html`, `08-requests.html` |
| **Why P0** | Wrong path → wrong expectation → support load + abandoned deals |

---

### P0-03 · No “what’s next” on a deal after submit
| | |
|---|---|
| **Type** | Design / Process visibility |
| **Where** | `/requests`, `/purchase-requests/:id` |
| **Current** | Status is a chip only (ارتباط اولیه، پیگیری اول، …). Buyer cannot see pipeline or next required action (wait for proforma / pay / upload receipt). |
| **TO-BE** | Visual **pipeline** on list + detail: ارتباط اولیه → پیگیری → پیش‌فاکتور → فاکتور → تسویه. Each stage shows **next action** for customer or “waiting on Damoon”. |
| **Mockup** | `08-requests.html`, `09-deal-detail.html` |
| **Why P0** | Quote-to-cash stalls without clear ownership of the next step |

---

## P1 — High

### P1-01 · Icon-only primary navigation
| | |
|---|---|
| **Type** | Design / A11y |
| **Where** | Right icon rail on all authenticated pages |
| **Current** | Icons without persistent labels. Hover reveals text (fails on touch / first visit). «ثبت درخواست» competes with «درخواست‌ها» as separate icon. |
| **TO-BE** | Labeled sidebar: پیشخوان، کاتالوگ، درخواست‌ها، مالی، گزارش‌ها، حساب. «ثبت درخواست» is a button inside Requests, not a peer nav item. |
| **Mockup** | Shared shell in all `to-be-redesign/pages/*` |

---

### P1-02 · Oversized hero / banner on almost every page
| | |
|---|---|
| **Type** | Design / Density |
| **Where** | Dashboard, products, requests, finance, reports, account |
| **Current** | Large greeting / marketing-style heroes push KPIs, tables, and forms below the fold on laptop screens. |
| **TO-BE** | Compact page header (title + 1 subtitle + actions). Marketing heroes only on public/marketing surfaces, not the work panel. |
| **Mockup** | `03-dashboard.html` and all console pages |

---

### P1-03 · Captcha required after login (checkout / new request)
| | |
|---|---|
| **Type** | UX friction / Trust |
| **Where** | `/checkout`, `/requests/new` (security code), also `/login` `/register` |
| **Current** | Authenticated buyers must pass captcha again to submit a deal. Feels like the system distrusts a logged-in session. |
| **TO-BE** | Captcha **only** on login/register (or risk-triggered). Post-login submit uses session + rate limits. |
| **Mockup** | `06-checkout.html`, `07-request-new.html` (no captcha) |

---

### P1-04 · Deep category nesting before SKU
| | |
|---|---|
| **Type** | IA / Efficiency |
| **Where** | `/products` → cat → sub → group → SKU list |
| **Current** | Expert buyers who know codes click through many card pages (e.g. شیرآلات → بال ولو → دانفوس → table). |
| **TO-BE** | Faceted catalog + **table-first SKU list**; search/filters sticky; fewer intermediate card screens. Breadcrumb still available. |
| **Mockup** | `04-products.html`, `05-product-list.html` |

---

### P1-05 · Category navigation duplicated three ways
| | |
|---|---|
| **Type** | Design / IA |
| **Where** | Icon rail drawer + accordion + category cards on `/products` |
| **Current** | Same links appear in rail flyout, accordion, and main cards — cognitive noise and maintenance cost. |
| **TO-BE** | One category model: sidebar filters / chips + main catalog body. No triplicate trees. |

---

### P1-06 · Finance journey split across tabs without a ledger story
| | |
|---|---|
| **Type** | IA / Design |
| **Where** | `/finance?tab=payments|status|submit` |
| **Current** | Debt, history, and «اعلام پرداخت» feel like three disconnected forms. Hard to answer “what do I owe and what do I do next?” |
| **TO-BE** | Single finance mental model: summary → open balances → pay / announce payment (guided). Clear link from unpaid invoice → pay. |
| **Mockup** | `12-finance.html`, `13-finance-pay.html` |

---

### P1-07 · Payment announcement form is dense and unguided
| | |
|---|---|
| **Type** | Design / UX friction |
| **Where** | `/finance?tab=submit` |
| **Current** | Long form: bank fields, amount, date, cheque, deal picker, attachment — all at once with little progressive disclosure. |
| **TO-BE** | Guided steps (or modal wizard): pick deal/invoice → amount & method → receipt → confirm. Prefill company bank prefs. |
| **Mockup** | `13-finance-pay.html` |

---

### P1-08 · No forgot-password / weak auth recovery
| | |
|---|---|
| **Type** | Bug / UX friction |
| **Where** | `/login` |
| **Current** | Password + captcha; no visible forgot-password. Login copy mixes “club members vs customers” without role education. |
| **TO-BE** | Password **or** OTP; clear forgot-password; concise audience copy. Captcha only when needed. |
| **Mockup** | `01-login.html` |

---

## P2 — Medium

### P2-01 · URL typo `compresor`
| | |
|---|---|
| **Type** | Bug / Polish |
| **Where** | `/products?cat=compresor` |
| **Current** | Misspelled slug in production URLs (bookmark / SEO fragility). |
| **TO-BE** | Correct slug (`compressor`) with permanent redirect from old URL. |

---

### P2-02 · Cart lives only in `localStorage`
| | |
|---|---|
| **Type** | Bug / Reliability |
| **Where** | Catalog add-to-cart → checkout (`damoon.purchase.cart:*`) |
| **Current** | Cart is browser-local. Clearing storage, other device, or another browser loses the basket. No server-side cart sync observed. |
| **TO-BE** | Persist cart server-side for logged-in users; keep local cache only as offline hint. Sticky mini-cart in TO-BE UI. |
| **Mockup** | Mini-cart on `05-product-list.html` |

---

### P2-03 · Deal detail lacks documents strip
| | |
|---|---|
| **Type** | Design |
| **Where** | `/purchase-requests/:id` |
| **Current** | Items, expert, notes, comments exist; documents (proforma / invoice / payment) are not presented as one strip. |
| **TO-BE** | Deal detail = timeline + **documents strip** (پیش‌فاکتور / فاکتور / رسید) + next action. |
| **Mockup** | `09-deal-detail.html` |

---

### P2-04 · Account page is one long scrolling form
| | |
|---|---|
| **Type** | Design |
| **Where** | `/account` |
| **Current** | Personal fields, invoice address, shipping address, password, purchase insights on one long page. Success feedback unclear. |
| **TO-BE** | Tabs: پروفایل / آدرس‌ها / امنیت. Clear save confirmation per section. |
| **Mockup** | `15-account.html` |

---

### P2-05 · Reports lack export and drill-down
| | |
|---|---|
| **Type** | Design / Capability gap |
| **Where** | `/reports` |
| **Current** | Charts exist (trend, category mix) but limited filters and weak export/click-through. |
| **TO-BE** | Date range, Excel/PDF export, click chart → filtered requests. |
| **Mockup** | `14-reports.html` |

---

### P2-06 · Global search has no dedicated results page
| | |
|---|---|
| **Type** | UX friction |
| **Where** | Top combobox search |
| **Current** | Search exists but landing/results UX is weaker than a dedicated SKU results page with filters. |
| **TO-BE** | Search opens catalog list pre-filtered; keyboard-friendly qty add. |

---

### P2-07 · Pricing visibility inconsistent
| | |
|---|---|
| **Type** | Design / Business rule UX |
| **Where** | Product lists, cart, proforma |
| **Current** | Some lines show negotiated/empty prices; unclear when list price vs «قیمت توافقی» applies. |
| **TO-BE** | Explicit price state per line: قیمت لیست / توافقی / پس از بررسی. Same labels on cart and deal. |

---

### P2-08 · Logged-in visit to `/register` silently redirects
| | |
|---|---|
| **Type** | UX friction |
| **Where** | `/register` when session exists |
| **Current** | Redirect to dashboard — correct security-wise, but feels like a broken bookmark with no message. |
| **TO-BE** | Soft banner: «شما وارد شده‌اید» + link to dashboard / logout. |

---

### P2-09 · Invoices tab empty-state / sparse guidance
| | |
|---|---|
| **Type** | Design |
| **Where** | `/requests?tab=invoices` |
| **Current** | Sparse when few invoices; primary action still points outward (Didar). |
| **TO-BE** | In-panel list with status, amount, due, **مشاهده** / **پرداخت**. Helpful empty state with next step. |
| **Mockup** | `11-invoices.html` |

---

### P2-10 · Mobile / touch not first-class
| | |
|---|---|
| **Type** | Design / A11y |
| **Where** | Whole shell |
| **Current** | Desktop-first icon rail + hover labels; field engineers / finance on phone struggle. |
| **TO-BE** | Responsive labeled nav (drawer on small screens); touch targets on qty steppers and tables. Confirm mobile priority with management. |

---

## P3 — Low

### P3-01 · Particle animation on auth screens
| | |
|---|---|
| **Type** | Polish |
| **Where** | `/login`, `/register` |
| **Current** | Decorative particles; little brand meaning for industrial B2B. |
| **TO-BE** | Real Damoon product / facility photography; calm navy composition. |
| **Mockup** | `01-login.html`, `02-register.html` |

---

### P3-02 · Ambiguous “club member vs customer” login copy
| | |
|---|---|
| **Type** | Polish / Copy |
| **Where** | `/login` |
| **Current** | Messaging implies two audiences without explaining roles or benefits. |
| **TO-BE** | One clear B2B buyer message + optional help link. |

---

### P3-03 · Captcha image accessibility
| | |
|---|---|
| **Type** | A11y |
| **Where** | Auth / checkout |
| **Current** | Image captcha is weak for screen readers and vision impairment. |
| **TO-BE** | Prefer OTP / risk-based challenges; if captcha remains, provide audio/refresh with proper labels. |

---

### P3-04 · «بیشترین خرید» insights buried on account
| | |
|---|---|
| **Type** | Design |
| **Where** | `/account` |
| **Current** | Purchase insights mixed into profile form. |
| **TO-BE** | Move insights to Reports or Dashboard “needs attention / habits”; keep Account for identity & addresses. |

---

### P3-05 · Inconsistent document hosts (proforma vs invoice)
| | |
|---|---|
| **Type** | Consistency (related to P0-01) |
| **Where** | `/proformas/:id` vs Didar invoice |
| **Current** | Proforma = Damoon; Invoice = Didar. Mixed standards. |
| **TO-BE** | One document viewer component for both; same print/PDF affordances. |

---

### P3-06 · Limited inline error / recovery guidance
| | |
|---|---|
| **Type** | UX friction |
| **Where** | Forms across panel |
| **Current** | Heuristic score low on “help recover from errors”; validation often generic. |
| **TO-BE** | Field-level Persian errors + recovery hints (e.g. invalid amount vs unpaid balance). |

---

## Priority backlog (recommended order)

### Phase A — Continuity (fix first)
1. **P0-01** In-panel invoices (stop Didar primary redirect)  
2. **P0-03** Deal pipeline + next action  
3. **P1-01** Labeled navigation  
4. **P1-02** Compact headers (drop page heroes)

### Phase B — Request & catalog
5. **P0-02** Unify checkout + new request wizard  
6. **P1-03** Remove post-login captcha  
7. **P1-04** / **P1-05** Catalog table + single category model  
8. **P2-02** Server-side cart for logged-in users

### Phase C — Finance & account
9. **P1-06** / **P1-07** Finance ledger + payment wizard  
10. **P2-04** Tabbed account  
11. **P2-05** Reports export / drill-down  
12. **P2-07** Explicit pricing states

### Phase D — Auth & polish
13. **P1-08** OTP / forgot password  
14. **P2-01** Fix `compresor` slug  
15. **P3-*** Copy, photography, a11y captcha, mobile pass

---

## Quick comparison matrix

| Area | Current panel | New panel (TO-BE) |
|---|---|---|
| Invoices | External Didar | In-panel document |
| Create request | Checkout **and** free-form | One wizard, two entries |
| Deal status | Chip only | Pipeline + next action |
| Navigation | Icon rail | Labeled sidebar |
| Page chrome | Large heroes | Compact headers |
| Captcha | Login + submit | Login/register only |
| Catalog | Deep card nesting | Table + facets |
| Finance | 3 loose tabs | Ledger + guided pay |
| Auth recovery | Missing | Forgot password / OTP |
| Cart | `localStorage` only | Server-backed for session |

---

## Related artifacts

| Artifact | Path |
|---|---|
| Full UX audit report | `DAMOON-PANEL-UX-AUDIT-REPORT.md` |
| AS-IS screenshots | `screenshots/` |
| TO-BE HTML mockups | `to-be-redesign/` |
| BPMN process maps | `bpmn/` |
| Figma TO-BE | [Open design](https://www.figma.com/design/aSRpU6V5SBAT1DmkFfZtEr) |

---

*Use issue IDs (e.g. P0-01) in tickets and sprint planning. Severity reflects customer journey impact, not only visual preference.*
