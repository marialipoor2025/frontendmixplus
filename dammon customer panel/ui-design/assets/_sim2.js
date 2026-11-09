const fs = require("fs");
const vm = require("vm");
const code = fs.readFileSync("shell.js", "utf8");

// Keep IIFE; inject mocks as globals before eval
class El {
  constructor(tag = "div", attrs = {}) {
    this.tagName = (tag || "div").toUpperCase();
    this.attrs = Object.assign({}, attrs);
    this.children = [];
    this.parent = null;
    this._html = "";
    this.value = "";
    this.hidden = false;
    this._class = this.attrs.class || "";
    this.id = this.attrs.id || "";
    this.textContent = "";
    this._listeners = {};
    this.style = {};
    const self = this;
    this.classList = {
      add(...c) {
        const p = new Set((self._class || "").split(/\s+/).filter(Boolean));
        c.forEach((x) => p.add(x));
        self._class = [...p].join(" ");
        self.attrs.class = self._class;
      },
      remove(...c) {
        self._class = (self._class || "")
          .split(/\s+/)
          .filter((x) => x && !c.includes(x))
          .join(" ");
        self.attrs.class = self._class;
      },
      toggle(c, force) {
        const has = (self._class || "").split(/\s+/).includes(c);
        if (force === true || (force == null && !has)) self.classList.add(c);
        else self.classList.remove(c);
      },
      contains(c) {
        return (self._class || "").split(/\s+/).includes(c);
      },
    };
  }
  get className() {
    return this._class;
  }
  set className(v) {
    this._class = v;
    this.attrs.class = v;
  }
  get innerHTML() {
    return this._html;
  }
  set innerHTML(html) {
    this._html = html || "";
    this.children = [];
    const re = /<([a-zA-Z0-9]+)([^>]*)>/g;
    let m;
    while ((m = re.exec(html))) {
      const tag = m[1];
      const attrs = {};
      const as = m[2];
      const ar = /([a-zA-Z_:][\w:-]*)="([^"]*)"/g;
      let am;
      while ((am = ar.exec(as))) attrs[am[1]] = am[2];
      const n = new El(tag, attrs);
      n.parent = this;
      this.children.push(n);
      if (n.id) IDMAP[n.id] = n;
    }
  }
  getAttribute(k) {
    return this.attrs[k];
  }
  setAttribute(k, v) {
    this.attrs[k] = v;
    if (k === "id") {
      this.id = v;
      IDMAP[v] = this;
    }
    if (k === "class") this.className = v;
  }
  addEventListener(t, fn) {
    (this._listeners[t] = this._listeners[t] || []).push(fn);
  }
  querySelector(sel) {
    const a = this.querySelectorAll(sel);
    return a[0] || null;
  }
  querySelectorAll(sel) {
    const out = [];
    const walk = (n) => {
      if (match(n, sel)) out.push(n);
      n.children.forEach(walk);
    };
    walk(this);
    return out;
  }
  closest(sel) {
    let n = this;
    while (n) {
      if (match(n, sel)) return n;
      n = n.parent;
    }
    return null;
  }
}

function match(n, sel) {
  sel = sel.trim();
  if (sel.startsWith("."))
    return (n.className || "").split(/\s+/).includes(sel.slice(1));
  if (sel.startsWith("#")) return n.id === sel.slice(1);
  if (sel.startsWith("[")) {
    const m = sel.match(/^\[([^=\]]+)(?:=\"([^\"]*)\")?\]$/);
    if (!m) return false;
    if (m[2] === undefined) return m[1] in n.attrs;
    return n.attrs[m[1]] === m[2];
  }
  return n.tagName.toLowerCase() === sel.toLowerCase();
}

const IDMAP = {};
const stage = new El("div", { id: "content-stage" });
IDMAP["content-stage"] = stage;
const shell = new El("div", { id: "app-shell" });
IDMAP["app-shell"] = shell;
const navLinks = [];
["dashboard", "products", "requests", "documents", "finance", "support", "reports", "account"].forEach((id) => {
  const a = new El("a", { "data-nav": id, href: "#" + id });
  navLinks.push(a);
});

global.document = {
  getElementById: (i) => IDMAP[i] || null,
  querySelector(sel) {
    if (sel.startsWith("#")) return IDMAP[sel.slice(1)] || null;
    if (sel === "[data-nav]") return navLinks[0] || null;
    return stage.querySelector(sel);
  },
  querySelectorAll(sel) {
    if (sel === "[data-nav]") return navLinks.slice();
    return stage.querySelectorAll(sel);
  },
  createElement: (t) => new El(t),
  title: "",
  addEventListener() {},
};
global.window = global;
global.location = { hash: "#dashboard" };
global.history = { replaceState() {} };
global.localStorage = { getItem: () => null, setItem() {} };
global.DamoonProducts = {
  buildHTML: () => '<div class="products-root">products</div>',
  bind() {},
  syncCompareDock() {},
  setNavigate() {},
  getMegaMenuData: () => [],
  quoteLines: () => [],
  compareLines: () => [],
  formatMoney: (n) => String(n),
};
global.DamoonChatbot = null;

const errors = [];
const origError = console.error;
console.error = (...a) => {
  errors.push(a.map(String).join(" "));
  origError(...a);
};

try {
  vm.runInThisContext(code, { filename: "shell.js", timeout: 8000 });
} catch (e) {
  console.error("INIT ERROR", e);
  process.exit(1);
}

// Re-trigger navigations via clicking nav handlers is hard; call by hash change isn't exported.
// Instead re-eval build/bind pieces by reading stage after init (started on dashboard due to hash).
console.log(
  "after init",
  JSON.stringify({
    htmlLen: stage.innerHTML.length,
    panel: ((stage.innerHTML.match(/data-panel=\"([^\"]+)\"/) || [])[1] || null),
    placeholder: /در صف بازطراحی|panel-eyebrow/.test(stage.innerHTML),
    errors,
  })
);

// Manually invoke by dispatching clicks on nav links
function clickNav(id) {
  errors.length = 0;
  const link = navLinks.find((l) => l.getAttribute("data-nav") === id);
  const handlers = (link._listeners && link._listeners.click) || [];
  handlers.forEach((fn) => fn({ preventDefault() {} }));
  // allow setTimeout(0) from navigate fade - our setTimeout runs sync if we patch
}

// Patch setTimeout to sync for subsequent navs
const _st = global.setTimeout;
global.setTimeout = (fn, ms) => {
  try {
    fn();
  } catch (e) {
    console.error(e);
  }
  return 1;
};

["requests", "documents", "finance", "support", "dashboard", "reports"].forEach((id) => {
  clickNav(id);
  const html = stage.innerHTML;
  const tbodyIds = {
    requests: "req-tbody",
    documents: "doc-tbody",
    finance: "fin-main",
    support: "sup-tbody",
    dashboard: null,
    reports: null,
  };
  const el = tbodyIds[id] ? document.getElementById(tbodyIds[id]) : null;
  const content = el ? el.innerHTML || "" : "";
  console.log(
    JSON.stringify({
      id,
      panel: ((html.match(/data-panel=\"([^\"]+)\"/) || [])[1] || null),
      placeholder: /در صف بازطراحی|panel-eyebrow/.test(html),
      rows: (content.match(/<tr/g) || []).length,
      contentLen: content.length,
      errors: errors.slice(),
      head: html.slice(0, 100).replace(/\s+/g, " "),
    })
  );
});
