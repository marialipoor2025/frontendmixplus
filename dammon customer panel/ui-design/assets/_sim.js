const fs = require("fs");
const vm = require("vm");
const code = fs.readFileSync("shell.js", "utf8");
const body = code
  .replace(/^\(function \(\) \{\s*"use strict";/, "")
  .replace(/\}\)\(\);\s*$/, "");

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
["dashboard", "products", "requests", "documents", "finance", "support", "reports"].forEach((id) => {
  const a = new El("a", { "data-nav": id });
  IDMAP["nav-" + id] = a;
  navLinks.push(a);
});

const document = {
  getElementById: (i) => IDMAP[i] || null,
  querySelector(sel) {
    if (sel.startsWith("#")) return IDMAP[sel.slice(1)] || null;
    if (sel === "[data-nav]") return navLinks[0] || null;
    return stage.querySelector(sel);
  },
  querySelectorAll(sel) {
    if (sel === "[data-nav]") return navLinks;
    return stage.querySelectorAll(sel);
  },
  createElement: (t) => new El(t),
  title: "",
  addEventListener() {},
};

const windowObj = {
  DamoonProducts: null,
  DamoonChatbot: null,
  addEventListener() {},
  location: { hash: "" },
  localStorage: { getItem: () => null, setItem() {} },
  history: { replaceState() {} },
};

const errors = [];
const sandbox = {
  document,
  window: windowObj,
  location: windowObj.location,
  history: windowObj.history,
  localStorage: windowObj.localStorage,
  console: {
    log() {},
    error(...a) {
      errors.push(a.map(String).join(" "));
      console.error(...a);
    },
  },
  Array,
  String,
  Object,
  Math,
  Date,
  Number,
  Boolean,
  parseInt,
  parseFloat,
  isNaN,
  JSON,
  setTimeout: (fn) => {
    fn();
    return 1;
  },
  clearTimeout() {},
};
vm.createContext(sandbox);

try {
  vm.runInContext(body, sandbox, { timeout: 5000 });
} catch (e) {
  console.error("INIT ERROR", e);
  process.exit(1);
}

function test(id) {
  errors.length = 0;
  try {
    sandbox.navigate(id);
  } catch (e) {
    console.error("navigate throw", id, e);
    return;
  }
  const html = stage.innerHTML;
  const hasPanel = html.includes('data-panel="' + id + '"');
  const placeholder =
    html.includes("panel-eyebrow") || html.includes("در صف بازطراحی");
  const tbodyIds = {
    requests: "req-tbody",
    documents: "doc-tbody",
    finance: "fin-main",
    support: "sup-tbody",
  };
  const el = document.getElementById(tbodyIds[id]);
  const content = el ? el.innerHTML || "" : "";
  const rows = (content.match(/<tr/g) || []).length;
  console.log(
    JSON.stringify({
      id,
      hasPanel,
      placeholder,
      el: !!el,
      rows,
      contentLen: content.length,
      errors: errors.slice(),
      htmlSnippet: html.slice(0, 120),
    })
  );
}

["requests", "documents", "finance", "support"].forEach(test);
