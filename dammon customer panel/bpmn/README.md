# Damoon Panel — BPMN As-Is Process Maps

## Open in bpmn.io

1. Go to **https://demo.bpmn.io/**
2. Import one of the files below.

### Files

| File | Use when |
|---|---|
| **`damoon-as-is-standard-quote-to-cash.bpmn`** *(recommended)* | Management / BA review — AS-IS mapped to **common B2B Quote-to-Cash** phases |
| `damoon-customer-club-processes.bpmn` | Detailed UI-route walkthrough (earlier draft) |

### Recommended file structure (best practices)

**`damoon-as-is-standard-quote-to-cash.bpmn`** uses the standard B2B portal pattern:

1. **Access** — register / login  
2. **Intent** — catalog+cart **or** manual RFQ  
3. **Case** — معامله tracking & seller follow-up  
4. **Quote** — پیش‌فاکتور (in-panel)  
5. **Invoice & Pay** — Didar invoice + اعلام پرداخت  

Pools: Customer → Damoon Portal → Sales Ops → Billing/Didar  

**Reading tip:** Follow the Customer pool left → right by phase. Dashed lines are message flows (same column ≈ same process step).

### Figma live AS-IS prototype (real screenshots)

Clickable walkthrough of the current panel (Quote-to-Cash phases):

- **Prototype (fitted to screen):** https://www.figma.com/proto/aSRpU6V5SBAT1DmkFfZtEr/Damoon-Panel-UX-Redesign-%E2%80%93-To-Be?page-id=15%3A2&node-id=15-3&starting-point-node-id=15%3A3&scaling=scale-down-width&content-scaling=responsive  
- **Design page:** https://www.figma.com/design/aSRpU6V5SBAT1DmkFfZtEr?node-id=15-2  
  (page name: **AS-IS Process Prototype** · frames matched to screenshot size 1262×568)

Share tip: Figma → Share → Anyone with the link → can view.

Alternative modeler: https://bpmn.io/toolkit/bpmn-js/examples/modeler/

## What this models (from live customer walkthrough)

| Process area | Panel routes / evidence |
|---|---|
| Register / Login | `/register`, `/login` + captcha |
| Dashboard | `/` KPIs |
| Catalog browse | `/products` → `?cat` → `&sub` → `&group` → SKU AG Grid |
| Cart + checkout | localStorage cart → `/checkout` (+ captcha) → creates معامله |
| Manual request | `/requests/new` (+ attachments) → creates معامله |
| Deal tracking | `/purchase-requests/:id` statuses: ارتباط اولیه, پیگیری اول |
| Proforma | `/proformas/:id` (in-panel) |
| Invoice | redirect to `app.didar.me/customer/invoice/...` |
| Payment notice | `/finance?tab=submit` اعلام پرداخت |
| Finance status / payments | `/finance?tab=status`, `?tab=payments` |
| Account | `/account` |
| Reports | `/reports` |

## Note

Sales/Expert steps are **inferred from UI status labels and documents**, not from an internal sales console login.
