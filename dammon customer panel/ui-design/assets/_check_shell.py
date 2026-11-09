# -*- coding: utf-8 -*-
from pathlib import Path
import re
from html.parser import HTMLParser

js = Path("shell.js").read_text(encoding="utf-8")
print("syntax already checked")

for n in [
    "bindPanelActions",
    "buildRequests",
    "buildDocuments",
    "buildFinance",
    "buildSupport",
    "renderRequestRows",
    "renderDocRows",
    "renderFinanceTab",
    "renderSupportRows",
    "navigate",
    "buildProducts",
    "buildProforma",
    "buildCompare",
    "buildReports",
    "bindReports",
    "bindProforma",
    "bindCompare",
]:
    print(n, "OK" if ("function " + n + "(") in js else "MISSING")

for n in [
    "buildRequests",
    "buildDocuments",
    "buildFinance",
    "buildSupport",
    "bindRequests",
    "bindDocuments",
    "bindFinance",
    "bindSupport",
]:
    print("count", n, js.count("function " + n + "("))

for n in [
    "REQUESTS",
    "DOCUMENTS",
    "FIN_OPEN",
    "TICKETS",
    "supSelected",
    "reqSelected",
    "docSelected",
]:
    print("var", n, len(re.findall(r"var " + n + r"\b", js)))

print("catalog count", js.count("catalog"))
print('data-goto catalog', js.count('data-goto="catalog"'))
print('data-goto products', js.count('data-goto="products"'))

ids = {
    "requests": [
        "req-search",
        "req-result-meta",
        "req-tbody",
        "req-detail",
        "req-detail-status",
        "req-detail-body",
        "req-new-blank",
        "page-requests",
        "req-pipe",
    ],
    "documents": [
        "doc-search",
        "doc-result-meta",
        "doc-tbody",
        "doc-preview",
        "doc-preview-type",
        "doc-preview-body",
        "page-documents",
        "doc-tab",
    ],
    "finance": [
        "fin-main",
        "fin-side",
        "fin-focus-pay",
        "page-finance",
        "fin-tab",
    ],
    "support": [
        "sup-tbody",
        "sup-thread",
        "sup-compose",
        "sup-layout",
        "sup-new-btn",
        "sup-form",
        "sup-subject",
        "sup-message",
        "sup-cat",
        "sup-deal",
        "page-support",
        "sup-filter",
    ],
}
for page, lst in ids.items():
    print("---", page)
    for i in lst:
        print(" ", i, "in file" if i in js else "MISSING")

# Extract build* HTML and verify ids present in returned strings
for name in ["buildRequests", "buildDocuments", "buildFinance", "buildSupport"]:
    m = re.search(r"function " + name + r"\(\) \{([\s\S]*?)\n  \}", js)
    body = m.group(1) if m else ""
    print(name, "len", len(body), "return" in body)

# Simulate mount with a minimal DOM
try:
    from jsdom import JSDOM  # type: ignore
except Exception:
    pass

# Use html5lib-less approach: exec render helpers with a fake document
class FakeEl:
    def __init__(self, tag="div", attrs=None, parent=None):
        self.tag = tag
        self.attrs = attrs or {}
        self.children = []
        self.parent = parent
        self.innerHTML = ""
        self.value = ""
        self.hidden = False
        self.className = ""
        self._listeners = []
        self.id = self.attrs.get("id", "")

    def getAttribute(self, k):
        return self.attrs.get(k)

    def setAttribute(self, k, v):
        self.attrs[k] = v

    def classList_toggle(self, *a):
        pass

    def querySelector(self, sel):
        return None

    def querySelectorAll(self, sel):
        return []

    def addEventListener(self, *a):
        self._listeners.append(a)

    def closest(self, sel):
        return None


# Compare restored build HTML vs transcript originals for structure drift
# Pull original from segment_001 for documents/finance/support
seg = Path(
    r"C:\Users\Maryam\.cursor\projects\c-Users-Maryam-frontendmixplus\agent-transcripts\e0c14f87-54af-4c0a-9669-0c46626f5076\compaction\segment_001.md"
).read_text(encoding="utf-8")

for fname in ["buildRequests", "buildDocuments", "buildFinance", "buildSupport"]:
    # current
    m1 = re.search(rf"function {fname}\(\) \{{([\s\S]*?)\n  \}}", js)
    cur = m1.group(0) if m1 else ""
    # original in segment - after new_string
    m2 = re.search(rf"- new_string:   function {fname}\(\) \{{([\s\S]*?)\n  \}}\n\n  function ", seg)
    if not m2:
        m2 = re.search(rf"function {fname}\(\) \{{([\s\S]*?)\n  \}}", seg)
    orig = ("function " + fname + "() {" + m2.group(1) + "\n  }") if m2 else ""
    # Normalize catalog->products for fair compare
    orig_n = orig.replace('data-goto="catalog"', 'data-goto="products"').replace("از کاتالوگ", "از محصولات").replace("navigate(\"catalog\")", "navigate(\"products\")")
    # Also normalize whitespace
    def norm(s):
        return re.sub(r"\s+", " ", s).strip()
    print(fname, "orig_found", bool(m2), "equal_norm", norm(cur) == norm(orig_n))
    if m2 and norm(cur) != norm(orig_n):
        # show first diff region
        a, b = norm(cur), norm(orig_n)
        for i in range(min(len(a), len(b))):
            if a[i] != b[i]:
                print("  diff at", i, "cur:", a[max(0,i-40):i+60])
                print("         orig:", b[max(0,i-40):i+60])
                break
        else:
            print("  length diff", len(a), len(b))
