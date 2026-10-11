/**
 * HTML / scripts / emojis / list markers → plain lines for seller Format.
 * PDP UI supplies its own formatting — never keep source bullets or markup.
 */

const EMOJI_RE =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu;

/** Leading list markers: bullets, dashes, numbered / Persian-numbered lists. */
const LIST_MARKER_RE =
  /^(?:[•●○▪▫◆◇►▸‣∙·\*_-]|\d{1,2}[.)]|[\u06F0-\u06F9]{1,2}[.)]|\(\d{1,2}\))\s+/;

function stripEmojis(text: string): string {
  let t = text.replace(EMOJI_RE, "");
  t = [...t]
    .filter((ch) => {
      if (ch === "\u200c" || ch === "\u200d") return true;
      const code = ch.codePointAt(0) ?? 0;
      if (code >= 0x2190 && code <= 0x21ff) return false;
      if (code >= 0x2300 && code <= 0x23ff) return false;
      if (code >= 0x2460 && code <= 0x24ff) return false;
      if (code >= 0x25a0 && code <= 0x25ff) return false;
      if (code >= 0x2600 && code <= 0x27bf) return false;
      if (code >= 0x2b00 && code <= 0x2bff) return false;
      return true;
    })
    .join("");
  return t.replace(/❤️|❤|♥/g, "");
}

function decodeBasicEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, n: string) => {
      const code = Number(n);
      return Number.isFinite(code) ? String.fromCodePoint(code) : _;
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => {
      const code = Number.parseInt(h, 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : _;
    });
}

/** Remove leading bullet / numbered-list markers (repeat for nested). */
export function stripListMarker(line: string): string {
  let t = (line || "").trim();
  for (let i = 0; i < 4; i++) {
    const next = t.replace(LIST_MARKER_RE, "").trim();
    if (next === t) break;
    t = next;
  }
  // Bare bullet leftovers.
  if (/^[•●○▪▫◆◇►▸‣∙·\-*_]+$/.test(t)) return "";
  return t;
}

/** Drop markdown / leftover emphasis — PDP components style the text. */
export function stripInlineFormatting(text: string): string {
  return (text || "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/[ \t\f\v]+/g, " ")
    .trim();
}

/** Clean one line for storage in PDP fields. */
export function cleanPdpLine(line: string): string {
  return stripInlineFormatting(stripListMarker(line));
}

/**
 * Clean multi-line PDP body: no bullets, no markup, paragraph breaks for UI.
 */
export function formatPdpBody(text: string): string {
  const lines = (text || "")
    .split(/\r?\n/)
    .map(cleanPdpLine)
    .filter(Boolean);
  if (lines.length === 0) return "";

  // Group consecutive short fact lines into one paragraph; keep blank gaps.
  const paragraphs: string[] = [];
  let buf: string[] = [];

  const flush = () => {
    if (buf.length === 0) return;
    paragraphs.push(buf.join(" "));
    buf = [];
  };

  for (const line of lines) {
    const looksLikeHeading =
      line.length <= 48 &&
      !/[.!?۔…:：]$/.test(line) &&
      !line.includes("،") &&
      !line.includes(" است");
    if (looksLikeHeading && buf.length > 0) {
      flush();
      paragraphs.push(line);
      continue;
    }
    if (looksLikeHeading && buf.length === 0) {
      paragraphs.push(line);
      continue;
    }
    buf.push(line);
  }
  flush();

  return paragraphs.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function toPlainText(raw: string | null | undefined): string {
  if (raw == null) return "";
  let t = String(raw);
  if (!t.trim()) return "";

  t = t.replace(/<script[\s\S]*?<\/script>/gi, " ");
  t = t.replace(/<style[\s\S]*?<\/style>/gi, " ");
  t = t.replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");

  t = t.replace(/<(br|hr)\s*\/?>/gi, "\n");
  t = t.replace(
    /<\/(p|div|h[1-6]|li|tr|section|article|blockquote)>/gi,
    "\n",
  );
  // List items → plain lines (no bullet — PDP formats lists itself).
  t = t.replace(/<li[^>]*>/gi, "\n");
  t = t.replace(/<[^>]+>/g, " ");

  t = decodeBasicEntities(t);
  t = t.replace(/\u00a0/g, " ");
  t = stripEmojis(t);

  // Normalize odd bullet glyphs before stripping.
  t = t.replace(/[●○▪▫◆◇►▸‣∙]/g, "•");

  const lines: string[] = [];
  for (const line of t.split(/\r?\n/)) {
    const cleaned = cleanPdpLine(line.replace(/[ \t\f\v]+/g, " "));
    if (cleaned) lines.push(cleaned);
  }
  return lines.join("\n").trim();
}
