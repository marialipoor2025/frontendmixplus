# XLS description → PDP split (example CG9571M)

The long «توضیحات» cell is **one field in XLS**, but the text is already structured with section titles. We split that plain text into the designed PDP blocks.

## Categorization of the dumped div

| Text block (after strip) | PDP destination |
|---|---|
| Product title echo | skipped (already in title) |
| `۵ شعله \| پلوپز دوحالته \| قطعات ایتالیایی SABAF` | **ProductFeatures** chips |
| Under `معرفی کامل محصول` | **ProductIntro** |
| `قدرت واقعی با پلوپز دوحالته` … `استانداردهای بین‌المللی` | **ProductExpertReview** (نقد و بررسی) |
| `ضمانت محصول` → `2 سال ضمانت رسمی Mixplus` | **Buy-box warranty** |
| `مشخصات فنی` (`برند: …`, `مدل: …`, …) | **ProductSpecs** |
| `معرفی برند MixPlus` | **brandIntro** JSON (no UI block yet) |
| Closing CTA / chat line | skipped |

## Missing in XLS (cannot map)

- Gallery images, delivery labels, price-policy, insurance  
- Ratings / reviews / Q&A, colors / variants  
- Weight / brand column  

## Missing in PDP design (data available after split)

| Data | Recommendation |
|---|---|
| `brandIntro` (معرفی برند) | Add a small «درباره برند» block under specs (or seller card blurb) |
| Optional multi-H2 feature accordion | Current design uses one Expert Review; OK for now |

## Regen

```bash
python scripts/import/xlsx_to_mixplus_json.py
```

Then restart API (`Seed:OverwriteMixPlus=true`).
