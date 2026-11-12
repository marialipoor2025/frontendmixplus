/**
 * Scrapes Digikala public product detail for every seller-managed product id
 * (the published form of what was registered in Digi seller panel).
 *
 * Input:  data/digikala-scrape/product-management.json
 * Output: data/digikala-scrape/product-details.json
 *
 * Usage: node scripts/scrape-digikala-product-details.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "data", "digikala-scrape");
const mgmtPath = path.join(outDir, "product-management.json");
const outPath = path.join(outDir, "product-details.json");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function imageAssetKey(u) {
  const m = String(u || "").match(/digikala-products\/([a-f0-9]+)_/i);
  return m ? m[1] : String(u || "").split("?")[0];
}

function pickImageUrls(product) {
  const urls = [];
  const seen = new Set();
  const push = (u) => {
    if (typeof u !== "string" || !u) return;
    const key = imageAssetKey(u);
    if (!key || seen.has(key)) return;
    seen.add(key);
    urls.push(u);
  };
  // Prefer gallery list first (main is often a duplicate of list[0]).
  for (const img of product?.images?.list ?? []) {
    const list = img?.url;
    if (Array.isArray(list)) list.forEach(push);
    else push(list);
  }
  const main = product?.images?.main?.url;
  if (Array.isArray(main)) main.forEach(push);
  else push(main);
  return urls;
}

function compactProduct(raw) {
  const p = raw?.data?.product;
  if (!p?.id) return null;

  const variants = (p.variants ?? []).map((v) => ({
    id: v.id,
    status: v.status,
    lead_time: v.lead_time,
    warranty: v.warranty
      ? { id: v.warranty.id, title_fa: v.warranty.title_fa }
      : null,
    seller: v.seller
      ? {
          id: v.seller.id,
          title: v.seller.title,
          code: v.seller.code,
        }
      : null,
    themes: (v.themes ?? []).map((t) => ({
      label: t.label,
      type: t.type,
      is_main: t.is_main,
      value: {
        id: t.value?.id,
        title: t.value?.title ?? t.value?.value,
        nature: t.value?.nature,
        hex: t.value?.hex_code ?? t.value?.color_hex ?? null,
      },
    })),
    price: v.price
      ? {
          selling_price: v.price.selling_price,
          rrp_price: v.price.rrp_price,
          discount_percent: v.price.discount_percent,
          order_limit: v.price.order_limit,
          bnpl_active: v.price.bnpl_active,
        }
      : null,
  }));

  return {
    id: p.id,
    title_fa: p.title_fa,
    title_en: p.title_en,
    url: p.url,
    status: p.status,
    brand: p.brand
      ? { id: p.brand.id, title_fa: p.brand.title_fa, title_en: p.brand.title_en }
      : null,
    category: p.category
      ? {
          id: p.category.id,
          title_fa: p.category.title_fa,
          return_reason_alert: p.category.return_reason_alert,
        }
      : null,
    breadcrumb: (p.breadcrumb ?? []).map((b) => ({
      title: b.title,
      url: b.url,
    })),
    rating: p.rating,
    comments_count: p.comments_count,
    questions_count: p.questions_count,
    imageUrls: pickImageUrls(p),
    review: {
      description: p.review?.description ?? "",
      short: p.expert_reviews?.short_review ?? p.review?.short_review ?? "",
    },
    expert_reviews: {
      description: p.expert_reviews?.description ?? "",
      short_review: p.expert_reviews?.short_review ?? "",
      attributes: p.expert_reviews?.attributes ?? [],
    },
    specifications: (p.specifications ?? []).map((g) => ({
      title: g.title,
      attributes: (g.attributes ?? []).map((a) => ({
        title: a.title,
        values: a.values ?? [],
      })),
    })),
    default_variant_id: p.default_variant?.id ?? null,
    variants,
    scrapedAt: new Date().toISOString(),
  };
}

async function fetchProduct(id) {
  const url = `https://api.digikala.com/v2/product/${id}/`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: `https://www.digikala.com/product/dkp-${id}/`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${url} ${text.slice(0, 160)}`);
  }
  return res.json();
}

async function main() {
  if (!fs.existsSync(mgmtPath)) {
    throw new Error(`Missing ${mgmtPath} — run scrape-digikala-seller.mjs first`);
  }

  const mgmt = JSON.parse(fs.readFileSync(mgmtPath, "utf8"));
  const ids = [
    ...new Set(
      (mgmt.items ?? [])
        .map((x) => Number(x.product_id))
        .filter((n) => Number.isFinite(n) && n > 0),
    ),
  ];

  console.log(`Scraping Digikala public PDP for ${ids.length} managed products…`);
  fs.mkdirSync(outDir, { recursive: true });

  const existing = fs.existsSync(outPath)
    ? JSON.parse(fs.readFileSync(outPath, "utf8"))
    : { items: [] };
  const byId = new Map((existing.items ?? []).map((x) => [x.id, x]));

  let ok = 0;
  let fail = 0;
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    process.stdout.write(`[${i + 1}/${ids.length}] dkp-${id} `);
    try {
      const raw = await fetchProduct(id);
      const compact = compactProduct(raw);
      if (!compact) throw new Error("empty product");
      byId.set(id, compact);
      ok++;
      console.log(
        `ok specs=${compact.specifications.reduce((n, g) => n + g.attributes.length, 0)} variants=${compact.variants.length} images=${compact.imageUrls.length}`,
      );
    } catch (e) {
      fail++;
      console.log(`FAIL ${e.message || e}`);
    }
    await sleep(250);
    if ((i + 1) % 10 === 0) {
      fs.writeFileSync(
        outPath,
        JSON.stringify(
          {
            source: "https://api.digikala.com/v2/product/{id}/",
            note: "Published Digikala PDP = registered seller-panel product content",
            scrapedAt: new Date().toISOString(),
            count: byId.size,
            items: [...byId.values()],
          },
          null,
          2,
        ),
      );
    }
  }

  const items = [...byId.values()].sort((a, b) => a.id - b.id);
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        source: "https://api.digikala.com/v2/product/{id}/",
        note: "Published Digikala PDP = registered seller-panel product content",
        scrapedAt: new Date().toISOString(),
        count: items.length,
        ok,
        fail,
        items,
      },
      null,
      2,
    ),
  );
  console.log(`Saved ${items.length} products → ${outPath} (ok=${ok} fail=${fail})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
