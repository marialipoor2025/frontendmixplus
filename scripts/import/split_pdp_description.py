"""Split MixPlus XLS plain descriptions into PDP-shaped sections."""

from __future__ import annotations

import re
from typing import Any

# Exact / normalized section titles found in the sheet copy.
_INTRO_TITLES = {"معرفی کامل محصول", "معرفی محصول"}
_WARRANTY_TITLES = {"ضمانت محصول", "گارانتی محصول", "گارانتی"}
_SPECS_TITLES = {"مشخصات فنی", "مشخصات", "مشخصات کالا"}
_BRAND_TITLE_RE = re.compile(r"^معرفی برند\b", re.I)

# Closing CTA / noise — drop from PDP body.
_DROP_LINE_RE = re.compile(
    r"^(هر سوالی|لطفا در چت|کار خود را تضمین)",
)


def _norm(line: str) -> str:
    return re.sub(r"\s+", " ", (line or "").strip())


def _is_bullet(line: str) -> bool:
    return bool(re.match(r"^[•\-\*]\s+", line))


def _is_key_value(line: str) -> bool:
    # برند: Mixplus  |  ابعاد صفحه: ۹۰ × ۵۳
    if ":" not in line and "：" not in line:
        return False
    left = re.split(r"[:：]", line, maxsplit=1)[0].strip()
    return 1 <= len(left) <= 40 and not left.endswith(".")


def _is_tagline(line: str) -> bool:
    if "|" not in line:
        return False
    parts = [p.strip() for p in line.split("|")]
    return 2 <= len(parts) <= 8 and all(1 <= len(p) <= 40 for p in parts)


def _is_heading(line: str, known: set[str]) -> bool:
    if not line or _is_bullet(line) or _is_key_value(line) or _is_tagline(line):
        return False
    if line in known or _BRAND_TITLE_RE.match(line):
        return True
    # Short title-like lines without sentence punctuation.
    if len(line) <= 48 and not re.search(r"[.!?۔…]$", line):
        if line.endswith(":") or re.match(
            r"^(قدرت|سرشعله|سیستم|طراحی|شبکه|ولوم|استاندارد|مزیت|ابعاد)",
            line,
        ):
            return True
        # Heuristic: no comma-heavy prose
        if line.count("،") == 0 and line.count(",") == 0 and " است" not in line:
            return True
    return False


def split_description(plain: str, product_title: str = "") -> dict[str, Any]:
    """
    Returns PDP-oriented buckets from a single plain-text description.
    Does not invent copy — only routes existing lines.
    """
    lines = [_norm(x) for x in (plain or "").splitlines()]
    lines = [x for x in lines if x]

    known = _INTRO_TITLES | _WARRANTY_TITLES | _SPECS_TITLES
    title_n = _norm(product_title)

    tagline = ""
    features: list[dict[str, str]] = []
    preamble_lines: list[str] = []
    intro_lines: list[str] = []
    expert_sections: list[dict[str, str]] = []
    warranty_lines: list[str] = []
    spec_rows: list[dict[str, str]] = []
    brand_lines: list[str] = []
    skipped: list[str] = []

    mode = "preamble"
    current_expert: dict[str, str] | None = None
    _WARRANTY_INLINE_RE = re.compile(
        r"\d+\s*سال\s*(ضمانت|گارانتی)| (ضمانت|گارانتی)\s*\d+\s*سال",
        re.I,
    )

    def flush_expert():
        nonlocal current_expert
        if current_expert and (current_expert.get("title") or current_expert.get("body")):
            body = current_expert.get("body", "").strip()
            expert_sections.append(
                {
                    "title": current_expert.get("title", "").strip(),
                    "body": body,
                }
            )
        current_expert = None

    for line in lines:
        if title_n and line == title_n:
            skipped.append(line)
            continue
        if _DROP_LINE_RE.match(line):
            skipped.append(line)
            continue

        # Tagline chips before first section.
        if mode == "preamble" and _is_tagline(line):
            tagline = line
            for part in [p.strip() for p in line.split("|")]:
                features.append({"id": f"chip-{len(features)+1}", "label": part, "value": part})
            continue

        is_known_section = (
            line in _INTRO_TITLES
            or line in _WARRANTY_TITLES
            or line in _SPECS_TITLES
            or bool(_BRAND_TITLE_RE.match(line))
        )
        # Subsection headings in preamble/intro/expert. Locked inside warranty/specs/brand
        # so lines like "2 سال ضمانت..." stay in the warranty body.
        is_subheading = (mode in {"preamble", "intro", "expert"}) and _is_heading(
            line, known
        )

        if is_known_section or is_subheading:
            flush_expert()
            if line in _INTRO_TITLES:
                mode = "intro"
                continue
            if line in _WARRANTY_TITLES:
                mode = "warranty"
                continue
            if line in _SPECS_TITLES:
                mode = "specs"
                continue
            if _BRAND_TITLE_RE.match(line):
                mode = "brand"
                continue
            mode = "expert"
            current_expert = {"title": line, "body": ""}
            continue

        # Body lines by mode
        if mode == "preamble":
            preamble_lines.append(line)
            continue
        if mode == "intro":
            intro_lines.append(line)
            continue
        if mode == "warranty":
            warranty_lines.append(line)
            continue
        if mode == "specs":
            if _is_key_value(line):
                left, right = re.split(r"[:：]", line, maxsplit=1)
                spec_rows.append(
                    {
                        "id": f"spec-{len(spec_rows)+1}",
                        "label": left.strip(),
                        "value": right.strip(),
                    }
                )
            else:
                skipped.append(line)
            continue
        if mode == "brand":
            brand_lines.append(line)
            continue
        if mode == "expert":
            if current_expert is None:
                current_expert = {"title": "", "body": ""}
            if current_expert["body"]:
                current_expert["body"] += "\n" + line
            else:
                current_expert["body"] = line
            continue

    flush_expert()

    intro_full = "\n".join(intro_lines).strip()
    # Products without «معرفی …» heading: use lead paragraphs as intro.
    if not intro_full and preamble_lines:
        intro_full = "\n".join(preamble_lines).strip()
        preamble_lines = []
    else:
        skipped.extend(preamble_lines)

    intro_preview = intro_full[:180] if intro_full else (tagline[:180] if tagline else "")

    # Expert review = feature subsections only (existing PDP «نقد و بررسی»).
    expert_parts: list[str] = []
    for sec in expert_sections:
        block = sec["title"]
        if sec["body"]:
            block = f"{sec['title']}\n{sec['body']}" if sec["title"] else sec["body"]
        expert_parts.append(block)
    expert_full = "\n\n".join(expert_parts).strip()
    expert_preview = expert_full[:180] if expert_full else ""

    warranty = ""
    for wl in warranty_lines:
        if _WARRANTY_INLINE_RE.search(wl):
            warranty = wl
            break
    if not warranty:
        useful = [
            wl
            for wl in warranty_lines
            if wl not in {"این محصول دارای:", "می‌باشد که شامل:", "است."}
        ]
        warranty = "\n".join(useful).strip()
    # Inline warranty inside intro/preamble/expert body (common in shorter sheets).
    if not warranty:
        for wl in [*intro_lines, *preamble_lines, *[s.get("body", "") for s in expert_sections]]:
            for part in str(wl).splitlines():
                part = _norm(part)
                if _WARRANTY_INLINE_RE.search(part):
                    warranty = part
                    break
            if warranty:
                break
        if not warranty:
            for part in lines:
                if _WARRANTY_INLINE_RE.search(part):
                    warranty = part
                    break

    brand_intro = "\n".join(brand_lines).strip()

    # If chips empty but specs exist, use first few specs as chips.
    if not features and spec_rows:
        for row in spec_rows[:6]:
            features.append(
                {
                    "id": row["id"],
                    "label": row["label"],
                    "value": row["value"],
                }
            )

    return {
        "tagline": tagline,
        "features": features,
        "introPreview": intro_preview,
        "introFull": intro_full,
        "expertReviewTitle": "نقد و بررسی" if expert_full else "",
        "expertReviewPreview": expert_preview,
        "expertReviewFull": expert_full,
        "warranty": warranty,
        "specs": spec_rows,
        "brandIntro": brand_intro,
        "skippedLines": skipped,
        "missingDesign": [
            x
            for x in [
                "brandIntro → no dedicated PDP brand block (kept in pdp JSON; not shown until UI exists)"
                if brand_intro
                else None,
            ]
            if x
        ],
    }
