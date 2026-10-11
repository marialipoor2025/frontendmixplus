# PDP missing / follow-up features

Findings from importing `data entry/products.xlsx` (199 MixPlus products) into the designed PDP.

Use this as a backlog for **future PDP UI + import** work. The current import already runs the description splitter on **every** XLS row; coverage differs because not every product’s text contains every section heading.

## Pipeline status

| Step | Status |
|---|---|
| Convert XLS → JSON (`scripts/import/xlsx_to_mixplus_json.py`) | All 199 rows |
| Split plain `توضیحات` → intro / expert / specs / warranty / features / brandIntro | All rows with description |
| Seed DB (`MixPlusCatalogSeeder`) | All `mp-*` products on API start when `Seed:OverwriteMixPlus=true` |

## How XLS description is split → existing PDP

| Text pattern | PDP target | Notes |
|---|---|---|
| Tagline `A \| B \| C` | Feature chips | Purchase panel / mobile chips |
| `معرفی محصول` / `معرفی کامل محصول` (or lead paragraphs if no heading) | **معرفی** (`ProductIntro`) | |
| Feature H2 blocks (e.g. سرشعله‌ها، ترموکوپل، …) | **نقد و بررسی** (`ProductExpertReview`) | |
| `مشخصات فنی` + `label: value` lines | **مشخصات** (`ProductSpecs`) | |
| Warranty section or inline `N سال ضمانت/گارانتی` | Buy-box **warranty** | |
| `معرفی برند …` | `brandIntro` in `PdpContentJson` | **No UI yet** |
| Closing chat/CTA lines | Dropped | Not product content |

## Coverage after last regen (199 rows)

| Bucket | Rows with data |
|---|---|
| Description plain | 198 |
| Intro | 89 |
| Expert review | 188 |
| Specs (`label: value`) | 27 |
| Warranty | 41 |
| Feature chips | 39 |
| Brand intro (JSON only) | 83 |

Rows without a given bucket simply lack that pattern in their XLS text — the splitter still runs for every product.

Re-check after regen:

```bash
python scripts/import/xlsx_to_mixplus_json.py
```

## Missing in the XLS (cannot invent)

Add these columns/assets later if you want full Digikala-like PDP:

1. **Product images** (dedicated column or media pack) — today ~3 usable CDN URLs from schema  
2. **Delivery** copy (title / method / cost)  
3. **Price-policy** label  
4. **Insurance** offer  
5. **Ratings / reviews / Q&A**  
6. **Colors / variants / SKU matrix**  
7. **Weight** (column empty for all rows)  
8. **Brand** column (defaulted to Mixplus; Moulinex only when schema says so)

## Missing in PDP design (data ready — build UI later)

Priority suggestions:

### P1 — Brand intro block
- **Data:** `PdpContentJson.brandIntro` (already seeded when XLS has `معرفی برند`)
- **UI:** Section under specs (or under seller card): title «درباره برند» / «معرفی برند»، plain text + expand like intro
- **API:** Already returned if you extend `/pdp-content` to expose `brandIntro` (stored today inside JSON blob)

### P2 — Richer expert-review subsections
- **Data:** Multiple H2 feature blocks concatenated into one expert review
- **UI (optional):** Accordion / H2 outline inside «نقد و بررسی» instead of one flat `whitespace-pre-line` block

### P3 — Specs from free text when no `مشخصات فنی` heading
- **Gap:** Bundle rows use `Component:` + bullets, not `label: value` under `مشخصات فنی`
- **UI/import:** Heuristic parser for bullet attribute lists → `ProductSpecs` groups per component

### P4 — Gallery
- Wire seller/media uploads or a bulk image folder keyed by SKU/model
- Until then placeholders remain for most SKUs

### P5 — Commerce extras already on Product
These exist on the product entity / pdp JSON but are not first-class PDP chrome yet:

- `allowCashOnDelivery`
- `minOrderQuantity`
- `weightKg`, `taxPercent`, `dutyPercent`
- SEO meta (`metaTitle`, `metaDescription`, `metaKeywords`) — use in `<head>` / JSON-LD

## Regen + deploy reminder

```bash
python scripts/import/xlsx_to_mixplus_json.py
# restart API / full-deploy so MixPlusCatalogSeeder re-imports mp-* products
```

Config: `Seed:OverwriteMixPlus=true` in `appsettings.json`.
