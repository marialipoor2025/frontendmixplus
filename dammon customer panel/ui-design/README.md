# Damoon Customer Panel — UI Shell

Interactive HTML prototype of the **B2B customer console sidebar**. Content pages are placeholders only; this is for manager UX review and as the base for future page design.

## How to open

1. Open `index.html` in a browser (double-click or drag into Chrome/Edge/Firefox).
2. No build step or local server is required — pure static HTML/CSS/JS.
3. **Offline:** Layout, navigation, collapse, and content swapping work fully offline via relative `assets/` files. Vazirmatn loads from Google Fonts when online; offline, the UI falls back to Tahoma / Segoe UI.

## Sidebar UX notes

| Behavior | Detail |
|---|---|
| **Labeled nav** | Icons + Persian labels always visible by default (not icon-only). |
| **Active state** | Soft filled chip + **right-edge accent bar** (RTL). |
| **Groups** | خرید · مالی و اسناد · پشتیبانی و حساب |
| **Badges** | Counts on درخواست‌ها (4), اسناد (2), مالی (1). |
| **Collapse** | Desktop icon-rail (~72px). State persisted in `localStorage` key `damoon.ui.sidebarCollapsed`. Tooltips/`title` remain for labels. |
| **Content swap** | Click nav → no page reload; `aria-current="page"`; ~180ms fade; `document.title` updates. |
| **Mobile** | Off-canvas drawer via hamburger in the topbar; backdrop + Escape to close. |
| **Footer** | Avatar initials, name, company, خروج. |

## Files

```
ui-design/
├── index.html          ← open this (interactive)
├── sidebar-focus.jpg   ← manager presentation image
├── README.md
└── assets/
    ├── shell.css       design system + sidebar + layout
    └── shell.js        nav → content swap, collapse, drawer
```

## Design progress

| Page | Status |
|---|---|
| Sidebar | Done (no CTA button) |
| پیشخوان | Approved · live |
| محصولات | Live — **one NodePanel**: tree + (زیرشاخه‌ها \| کالاها) + SKU table (`#products`) |
| درخواست‌ها | Approved · live |
| اسناد | Approved · live |
| مالی | Approved · live |
| پشتیبانی | Live |
| گزارش‌ها · حساب کاربری | Placeholder |

Open `index.html` (lands on محصولات / `#products`).

## Aesthetic

Industrial navy console — `#0B2A4A` / `#071C32`, canvas `#F1F4F8`, accent steel/teal `#1F6F8B`, Vazirmatn, RTL.
