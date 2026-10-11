#!/usr/bin/env python3
"""Convert data entry/products.xlsx → Seed/data/mixplus-products.json.

Plain-text only: strips HTML/scripts/styles/emojis. No invented PDP copy.
"""

from __future__ import annotations

import hashlib
import html
import json
import re
import sys
import unicodedata
from pathlib import Path

import openpyxl

sys.path.insert(0, str(Path(__file__).resolve().parent))
from split_pdp_description import split_description  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
XLSX = ROOT / "data entry" / "products.xlsx"
OUT = ROOT / "backend" / "src" / "Host" / "MixPlus.Api" / "Seed" / "data" / "mixplus-products.json"
OUT_COPY = ROOT / "data entry" / "mixplus-products.json"

# Broad emoji / pictograph ranges (keep ZWNJ/Persian letters).
_EMOJI_RE = re.compile(
    "["
    "\U0001F300-\U0001F9FF"
    "\U0001FA00-\U0001FAFF"
    "\U00002700-\U000027BF"
    "\U00002600-\U000026FF"
    "\U0000FE00-\U0000FE0F"
    "\U0001F1E0-\U0001F1FF"
    "\U0000200D"
    "❤♥♡✨⭐🌟🔥💯✅❌⚠♥"
    "]+",
    flags=re.UNICODE,
)


def cell(row, idx, header):
    i = idx.get(header)
    if i is None or i >= len(row):
        return None
    return row[i]


def strip_emojis(text: str) -> str:
    if not text:
        return ""
    t = _EMOJI_RE.sub("", text)
    # Drop leftover symbol pictographs / dingbats by category.
    t = "".join(
        ch
        for ch in t
        if unicodedata.category(ch) not in {"So", "Sk"}
        or ch in {"\u200c", "\u200d"}  # keep ZWNJ; ZWJ already removed via emoji pass
    )
    # Remove isolated heart/emoji-ish leftovers common in meta titles
    t = t.replace("❤️", "").replace("❤", "").replace("♥", "")
    return t


def to_plain_text(raw: str | None) -> str:
    """HTML/scripts/emojis → plain text for PDP intro (no markup kept)."""
    if raw is None:
        return ""
    t = str(raw)
    if not t.strip():
        return ""

    # Drop executable / style blocks entirely.
    t = re.sub(r"<script[\s\S]*?</script>", " ", t, flags=re.I)
    t = re.sub(r"<style[\s\S]*?</style>", " ", t, flags=re.I)
    t = re.sub(r"<noscript[\s\S]*?</noscript>", " ", t, flags=re.I)

    # Block boundaries → newline (so PDP whitespace-pre-line stays readable).
    t = re.sub(r"<(br|hr)\s*/?>", "\n", t, flags=re.I)
    t = re.sub(
        r"</(p|div|h[1-6]|li|tr|section|article|blockquote)>",
        "\n",
        t,
        flags=re.I,
    )
    t = re.sub(r"<li[^>]*>", "\n• ", t, flags=re.I)

    # Strip every remaining tag.
    t = re.sub(r"<[^>]+>", " ", t)

    # Entities
    t = html.unescape(t)
    t = t.replace("\u00a0", " ")

    t = strip_emojis(t)

    # Normalize whitespace: keep paragraph breaks, collapse spaces.
    lines = []
    for line in t.splitlines():
        line = re.sub(r"[ \t\f\v]+", " ", line).strip()
        if line:
            lines.append(line)
    return "\n".join(lines).strip()


def plain_field(value: str | None) -> str | None:
    if value is None:
        return None
    t = to_plain_text(value)
    return t or None


def slugify(title: str, sku: str | None) -> str:
    base = ""
    if sku:
        base = re.sub(r"[^a-zA-Z0-9]+", "-", str(sku)).strip("-").lower()
    if not base:
        tokens = re.findall(r"[A-Za-z][A-Za-z0-9\-]{1,}", title or "")
        if tokens:
            base = "-".join(t.lower() for t in tokens[:4])
    if not base:
        h = hashlib.md5((title or "").encode("utf-8")).hexdigest()[:10]
        base = f"item-{h}"
    base = re.sub(r"-+", "-", base).strip("-")
    return f"mixplus-{base}"[:280]


def cat_key(name: str) -> str:
    h = hashlib.md5(name.encode("utf-8")).hexdigest()[:10]
    latin = re.findall(r"[A-Za-z0-9]+", name)
    if latin:
        return ("c-mp-" + "-".join(x.lower() for x in latin[:4]))[:50]
    return f"c-mp-{h}"


def main() -> int:
    if not XLSX.exists():
        print(f"Missing {XLSX}", file=sys.stderr)
        return 1

    wb = openpyxl.load_workbook(XLSX, read_only=True, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    headers = [str(h).strip() for h in rows[0]]
    idx = {h: i for i, h in enumerate(headers)}

    products = []
    seen_slugs: set[str] = set()

    for n, row in enumerate(rows[1:], start=1):
        title = to_plain_text(str(cell(row, idx, "نام") or ""))
        cat = to_plain_text(str(cell(row, idx, "نام دسته") or ""))
        desc = to_plain_text(cell(row, idx, "توضیحات"))
        price = float(cell(row, idx, "قیمت (تومان)") or 0)
        stock = int(float(cell(row, idx, "موجودی") or 0))
        disc_raw = cell(row, idx, "تخفیف (درصد)")
        disc = (
            int(float(disc_raw))
            if disc_raw is not None and str(disc_raw).strip() != ""
            else None
        )
        weight_raw = cell(row, idx, "وزن (کیلوگرم)")
        weight = (
            float(weight_raw)
            if weight_raw is not None and str(weight_raw).strip() != ""
            else None
        )
        active = str(cell(row, idx, "فعال بودن") or "0").strip() == "1"
        cod = str(cell(row, idx, "پرداخت در محل") or "0").strip() == "1"
        min_order = int(float(cell(row, idx, "حداقل قابل سفارش") or 1))
        tax_raw = cell(row, idx, "مالیات (درصد)")
        tax = (
            float(tax_raw)
            if tax_raw is not None and str(tax_raw).strip() != ""
            else None
        )
        duty_raw = cell(row, idx, "عوارض (درصد)")
        duty = (
            float(duty_raw)
            if duty_raw is not None and str(duty_raw).strip() != ""
            else None
        )

        def text_or_none(header: str):
            v = cell(row, idx, header)
            if v is None or str(v).strip() == "":
                return None
            return plain_field(str(v))

        meta_title = text_or_none("متاتگ عنوان")
        meta_desc = text_or_none("متاتگ توضیحات")
        meta_kw = text_or_none("متاتگ کلمات کلیدی")
        image_alt = text_or_none("متن جایگزین تصویر")
        schema_raw = cell(row, idx, "کد اسکیما (schema)")
        schema_raw = str(schema_raw).strip() if schema_raw is not None else None

        sku = None
        image_url = None
        brand = "Mixplus"
        schema_json = None
        # Schema is only mined for sku/image/brand — never rendered as HTML/script on PDP.
        if schema_raw:
            m = re.search(r"\{[\s\S]*\}", schema_raw)
            if m:
                try:
                    data = json.loads(m.group(0))
                    schema_json = data
                    sku = data.get("sku") or data.get("mpn")
                    if isinstance(sku, str):
                        sku = to_plain_text(sku) or None
                    img = data.get("image")
                    if isinstance(img, list) and img:
                        image_url = img[0]
                    elif isinstance(img, str):
                        image_url = img
                    b = data.get("brand")
                    if isinstance(b, dict) and b.get("name"):
                        brand = to_plain_text(str(b["name"])) or "Mixplus"
                    elif isinstance(b, str) and b.strip():
                        brand = to_plain_text(b) or "Mixplus"
                except Exception:
                    pass

        bl = brand.lower().replace(" ", "").replace("-", "")
        if bl in ("mixplus", "mixpluss") or "میکس" in brand:
            brand = "Mixplus"

        slug = slugify(title, sku)
        base = slug
        i = 2
        while slug in seen_slugs:
            slug = f"{base}-{i}"
            i += 1
        seen_slugs.add(slug)

        ext = f"mp-{n:04d}"
        if sku:
            sk = re.sub(r"[^a-zA-Z0-9]+", "-", str(sku)).strip("-").lower()
            if sk.startswith("mp-"):
                sk = sk[3:]
            if sk:
                ext = f"mp-{sk}"[:90]

        list_price = price
        sale = list_price
        if disc and disc > 0 and list_price > 0:
            sale = round(list_price * (1 - disc / 100))

        split = split_description(desc, product_title=title)

        products.append(
            {
                "row": n,
                "externalKey": ext,
                "title": title,
                "slug": slug,
                "categoryName": cat,
                "categoryKey": cat_key(cat) if cat else None,
                # Full plain dump kept for audit; PDP uses split fields.
                "descriptionHtml": desc,
                "descriptionPlain": desc,
                "introPreview": split["introPreview"],
                "introFull": split["introFull"],
                "expertReviewTitle": split["expertReviewTitle"],
                "expertReviewPreview": split["expertReviewPreview"],
                "expertReviewFull": split["expertReviewFull"],
                "features": split["features"],
                "warranty": split["warranty"],
                "specs": split["specs"],
                "brandIntro": split["brandIntro"],
                "tagline": split["tagline"],
                "listPrice": list_price,
                "salePrice": sale,
                "discountPercent": disc if disc and disc > 0 else None,
                "stock": stock,
                "inStock": stock > 0,
                "isPublished": active and list_price > 0,
                "weightKg": weight,
                "allowCashOnDelivery": cod,
                "minOrderQuantity": max(1, min_order),
                "taxPercent": tax,
                "dutyPercent": duty,
                "metaTitle": meta_title,
                "metaDescription": meta_desc,
                "metaKeywords": meta_kw,
                "imageAlt": image_alt or title,
                "skuCode": sku,
                "brandName": brand,
                "imageUrl": image_url,
                "schemaJson": schema_json,
            }
        )

    seen_keys: set[str] = set()
    for p in products:
        k = p["externalKey"]
        if k in seen_keys:
            p["externalKey"] = f"{k}-r{p['row']}"
        seen_keys.add(p["externalKey"])

    out = {
        "seller": {
            "externalKey": "sel-mixplus",
            "name": "میکس پلاس",
            "slug": "mixplus",
            "ownerPhone": "09913800445",
            "rating": 4.9,
        },
        "brand": {
            "externalKey": "b-mixplus",
            "name": "Mixplus",
            "slug": "mixplus",
            "logoUrl": "/brand/mixplus-logo.svg",
        },
        "products": products,
        "source": "data entry/products.xlsx",
        "stats": {
            "total": len(products),
            "published": sum(1 for p in products if p["isPublished"]),
            "withImage": sum(1 for p in products if p["imageUrl"]),
            "withSku": sum(1 for p in products if p["skuCode"]),
            "withWeight": sum(1 for p in products if p["weightKg"] is not None),
            "withDescription": sum(1 for p in products if p["descriptionPlain"]),
        },
        "xlsToPdpMapping": {
            "نام": "PDP title",
            "نام دسته": "category / breadcrumb",
            "توضیحات → معرفی کامل محصول": "ProductIntro",
            "توضیحات → tagline (A | B | C)": "ProductFeatures chips",
            "توضیحات → feature H2 blocks": "ProductExpertReview",
            "توضیحات → مشخصات فنی (label: value)": "ProductSpecs",
            "توضیحات → ضمانت محصول": "buy-box warranty",
            "توضیحات → معرفی برند": "brandIntro (needs PDP UI block)",
            "قیمت (تومان) + تخفیف": "buy-box price / original / discount",
            "موجودی / فعال بودن": "inStock / isPublished",
            "متاتگ *": "SEO meta only",
            "کد اسکیما": "sku / image extract only (never rendered)",
        },
        "missingFromSourceForPdp": [
            "Gallery images (no image column; ~3 from schema CDN)",
            "Delivery title / method / cost labels",
            "Price-policy label",
            "Insurance offer",
            "Ratings / reviews / Q&A",
            "Colors / variants / SKU matrix",
            "Brand column (defaulted Mixplus)",
            "Weight empty for all rows",
        ],
        "missingInPdpDesign": [
            "Brand intro block (معرفی برند) — data split to brandIntro JSON",
            "Optional dedicated 'highlights' strip beyond feature chips",
        ],
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    OUT_COPY.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {OUT} ({len(products)} products) stats={out['stats']}")
    # sanity: no tags in first desc
    sample = next((p for p in products if "CG9571M" in p["title"]), None)
    if sample:
        print("sample intro:", (sample.get("introFull") or "")[:120].replace("\n", " | "))
        print("sample expert sections chars:", len(sample.get("expertReviewFull") or ""))
        print("sample specs:", len(sample.get("specs") or []), "warranty:", sample.get("warranty"))
        print("sample features:", [f["value"] for f in (sample.get("features") or [])])
        print("brandIntro chars:", len(sample.get("brandIntro") or ""))
    wb.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
