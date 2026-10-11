/**
 * Split pasted plain description into PDP-shaped buckets.
 * Strips source bullets/formatting; stores clean text for PDP components.
 */

import {
  cleanPdpLine,
  formatPdpBody,
  stripListMarker,
} from "@/lib/seller/to-plain-text";

export type SplitFeatureRow = { id: string; label: string; value: string };
export type SplitSpecRow = { id: string; label: string; value: string };

export type SplitPdpResult = {
  tagline: string;
  features: SplitFeatureRow[];
  introPreview: string;
  introFull: string;
  expertReviewTitle: string;
  expertReviewPreview: string;
  expertReviewFull: string;
  warranty: string;
  specs: SplitSpecRow[];
  brandIntro: string;
  skippedLines: string[];
};

const INTRO_TITLES = new Set(["معرفی کامل محصول", "معرفی محصول"]);
const WARRANTY_TITLES = new Set(["ضمانت محصول", "گارانتی محصول", "گارانتی"]);
const SPECS_TITLES = new Set([
  "مشخصات فنی",
  "مشخصات",
  "مشخصات کالا",
  "مشخصات کلی",
]);
const BRAND_TITLE_RE = /^معرفی برند\b/i;
const DROP_LINE_RE = /^(هر سوالی|لطفا در چت|کار خود را تضمین)/;
const WARRANTY_INLINE_RE =
  /\d+\s*سال\s*(ضمانت|گارانتی)|(ضمانت|گارانتی)\s*\d+\s*سال|\d+\s*ماه\s*(ضمانت|گارانتی)/i;
const SUBHEAD_PREFIX_RE =
  /^(قدرت|سرشعله|سیستم|طراحی|شبکه|ولوم|استاندارد|مزیت|ابعاد|ویژگی|تجهیزات|گواهینام|سایزبندی)/;

function norm(line: string): string {
  return cleanPdpLine(line);
}

function isKeyValue(line: string): boolean {
  const body = stripListMarker(line);
  if (!body.includes(":") && !body.includes("：")) return false;
  const left = body.split(/[:：]/, 2)[0]?.trim() ?? "";
  return left.length >= 1 && left.length <= 40 && !left.endsWith(".");
}

function splitKeyValue(line: string): { label: string; value: string } | null {
  const body = stripListMarker(line);
  if (!isKeyValue(body)) return null;
  const [left, ...rest] = body.split(/[:：]/);
  return {
    label: cleanPdpLine(left ?? ""),
    value: cleanPdpLine(rest.join(":")),
  };
}

function isTagline(line: string): boolean {
  if (!line.includes("|")) return false;
  const parts = line.split("|").map((p) => cleanPdpLine(p)).filter(Boolean);
  return (
    parts.length >= 2 &&
    parts.length <= 8 &&
    parts.every((p) => p.length >= 1 && p.length <= 40)
  );
}

function isSpecsHeading(line: string): boolean {
  if (SPECS_TITLES.has(line)) return true;
  return /^مشخصات(\s|$)/.test(line) || line.startsWith("مشخصات فنی");
}

function isHeading(line: string, known: Set<string>): boolean {
  if (!line || isKeyValue(line) || isTagline(line)) return false;
  if (known.has(line) || BRAND_TITLE_RE.test(line) || isSpecsHeading(line)) {
    return true;
  }
  if (line.length <= 48 && !/[.!?۔…]$/.test(line)) {
    if (line.endsWith(":") || SUBHEAD_PREFIX_RE.test(line)) return true;
    if (!line.includes("،") && !line.includes(",") && !line.includes(" است")) {
      return true;
    }
  }
  return false;
}

export function splitPdpDescription(
  plain: string,
  productTitle = "",
): SplitPdpResult {
  // Lines already cleaned of bullets/markup by toPlainText; clean again safely.
  const lines = (plain || "")
    .split(/\r?\n/)
    .map(norm)
    .filter(Boolean);

  const known = new Set([
    ...INTRO_TITLES,
    ...WARRANTY_TITLES,
    ...SPECS_TITLES,
  ]);
  const titleN = norm(productTitle);

  let tagline = "";
  const features: SplitFeatureRow[] = [];
  let preambleLines: string[] = [];
  const introLines: string[] = [];
  const expertSections: { title: string; body: string }[] = [];
  const warrantyLines: string[] = [];
  const specRows: SplitSpecRow[] = [];
  const brandLines: string[] = [];
  const skipped: string[] = [];

  type Mode = "preamble" | "intro" | "warranty" | "specs" | "brand" | "expert";
  let mode: Mode = "preamble";
  let currentExpert: { title: string; body: string } | null = null;

  const flushExpert = () => {
    if (currentExpert && (currentExpert.title || currentExpert.body)) {
      expertSections.push({
        title: cleanPdpLine(currentExpert.title),
        body: formatPdpBody(currentExpert.body),
      });
    }
    currentExpert = null;
  };

  for (const line of lines) {
    if (titleN && line === titleN) {
      skipped.push(line);
      continue;
    }
    if (DROP_LINE_RE.test(line)) {
      skipped.push(line);
      continue;
    }

    if (mode === "preamble" && isTagline(line)) {
      tagline = line
        .split("|")
        .map((p) => cleanPdpLine(p))
        .filter(Boolean)
        .join(" | ");
      for (const part of tagline.split("|").map((p) => p.trim()).filter(Boolean)) {
        features.push({
          id: `chip-${features.length + 1}`,
          label: part,
          value: part,
        });
      }
      continue;
    }

    const isKnownSection =
      INTRO_TITLES.has(line) ||
      WARRANTY_TITLES.has(line) ||
      isSpecsHeading(line) ||
      BRAND_TITLE_RE.test(line);

    const isSubheading =
      (mode === "preamble" || mode === "intro" || mode === "expert") &&
      isHeading(line, known);

    if (isKnownSection || isSubheading) {
      flushExpert();
      if (INTRO_TITLES.has(line)) {
        mode = "intro";
        continue;
      }
      if (WARRANTY_TITLES.has(line)) {
        mode = "warranty";
        continue;
      }
      if (isSpecsHeading(line)) {
        mode = "specs";
        continue;
      }
      if (BRAND_TITLE_RE.test(line)) {
        mode = "brand";
        continue;
      }
      mode = "expert";
      currentExpert = { title: line.replace(/:$/, "").trim(), body: "" };
      continue;
    }

    if (mode === "preamble") {
      preambleLines.push(line);
      continue;
    }
    if (mode === "intro") {
      introLines.push(line);
      continue;
    }
    if (mode === "warranty") {
      warrantyLines.push(line);
      continue;
    }
    if (mode === "specs") {
      const kv = splitKeyValue(line);
      if (kv) {
        specRows.push({
          id: `spec-${specRows.length + 1}`,
          label: kv.label,
          value: kv.value,
        });
      } else if (line.length > 0 && line.length <= 80) {
        // Fact line → specs table row (PDP table formatting, no bullet).
        specRows.push({
          id: `spec-${specRows.length + 1}`,
          label: line,
          value: "دارد",
        });
      } else {
        skipped.push(line);
      }
      continue;
    }
    if (mode === "brand") {
      brandLines.push(line);
      continue;
    }
    if (mode === "expert") {
      if (!currentExpert) currentExpert = { title: "", body: "" };
      const kv = splitKeyValue(line);
      if (kv) {
        // Key-values belong in the specs table, not bullet lists in expert.
        specRows.push({
          id: `spec-${specRows.length + 1}`,
          label: kv.label,
          value: kv.value,
        });
        continue;
      }
      currentExpert.body = currentExpert.body
        ? `${currentExpert.body}\n${line}`
        : line;
    }
  }

  flushExpert();

  let introFull = formatPdpBody(introLines.join("\n"));
  if (!introFull && preambleLines.length) {
    introFull = formatPdpBody(preambleLines.join("\n"));
    preambleLines = [];
  } else {
    skipped.push(...preambleLines);
  }

  const introPreview = introFull
    ? introFull.slice(0, 180)
    : tagline
      ? tagline.slice(0, 180)
      : "";

  // PDP expert: section title + blank line + body paragraphs.
  const expertParts = expertSections.map((sec) => {
    const title = cleanPdpLine(sec.title);
    const body = formatPdpBody(sec.body);
    if (title && body) return `${title}\n\n${body}`;
    return title || body;
  });
  const expertFull = expertParts.filter(Boolean).join("\n\n").trim();
  const expertPreview = expertFull ? expertFull.slice(0, 180) : "";

  let warranty = "";
  for (const wl of warrantyLines) {
    if (WARRANTY_INLINE_RE.test(wl)) {
      warranty = cleanPdpLine(wl);
      break;
    }
  }
  if (!warranty) {
    const useful = warrantyLines.filter(
      (wl) =>
        !["این محصول دارای:", "می‌باشد که شامل:", "است."].includes(wl),
    );
    warranty = formatPdpBody(useful.join("\n"));
  }
  if (!warranty) {
    const scan = [
      ...introLines,
      ...preambleLines,
      ...expertSections.map((s) => s.body),
      ...lines,
    ];
    for (const block of scan) {
      for (const part of String(block).split(/\r?\n/).map(norm)) {
        if (WARRANTY_INLINE_RE.test(part)) {
          warranty = cleanPdpLine(part);
          break;
        }
      }
      if (warranty) break;
    }
  }

  if (!features.length && specRows.length) {
    for (const row of specRows.slice(0, 6)) {
      features.push({
        id: row.id,
        label: row.label,
        value: row.value,
      });
    }
  }

  return {
    tagline,
    features: features.map((f) => ({
      ...f,
      label: cleanPdpLine(f.label),
      value: cleanPdpLine(f.value),
    })),
    introPreview,
    introFull,
    expertReviewTitle: expertFull ? "نقد و بررسی" : "",
    expertReviewPreview: expertPreview,
    expertReviewFull: expertFull,
    warranty: cleanPdpLine(warranty),
    specs: specRows.map((s) => ({
      ...s,
      label: cleanPdpLine(s.label),
      value: cleanPdpLine(s.value),
    })),
    brandIntro: formatPdpBody(brandLines.join("\n")),
    skippedLines: skipped,
  };
}
