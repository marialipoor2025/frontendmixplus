import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const authPath = path.join(root, ".browser-auth", "digikala-seller.json");
const outDir = path.join(root, "data", "digikala-scrape");

function cookieHeader(auth) {
  return (auth.cookies || [])
    .filter((c) => String(c.domain || "").includes("digikala.com"))
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

async function fetchJson(url, cookie) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      Cookie: cookie,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: "https://seller.digikala.com/pwa/product-management",
    },
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    throw new Error(`${res.status} ${url} ${text.slice(0, 200)}`);
  }
  return json;
}

async function paginate(urlBase, cookie, { size = 50, maxPages = 50 } = {}) {
  const u = new URL(urlBase);
  u.searchParams.set("page", "1");
  u.searchParams.set("size", String(size));
  const first = await fetchJson(u.toString(), cookie);
  const pager = first?.data?.pager ?? null;
  const items = [...(first?.data?.items ?? [])];
  const totalPages = pager?.total_pages ?? 1;
  for (let p = 2; p <= Math.min(totalPages, maxPages); p++) {
    u.searchParams.set("page", String(p));
    const page = await fetchJson(u.toString(), cookie);
    items.push(...(page?.data?.items ?? []));
    process.stdout.write(`  page ${p}/${totalPages} (+${page?.data?.items?.length ?? 0})\n`);
  }
  return {
    source: urlBase,
    scrapedAt: new Date().toISOString(),
    pager,
    count: items.length,
    itemKeys: items[0] ? Object.keys(items[0]) : [],
    items,
  };
}

async function main() {
  if (!fs.existsSync(authPath)) {
    throw new Error(`Missing auth file: ${authPath}`);
  }
  const auth = JSON.parse(fs.readFileSync(authPath, "utf8"));
  const cookie = cookieHeader(auth);
  fs.mkdirSync(outDir, { recursive: true });

  console.log("Scraping product-management (products/seller)...");
  const management = await paginate(
    "https://seller.digikala.com/api/v2/products/seller?order=desc&categoryId=",
    cookie,
  );
  fs.writeFileSync(
    path.join(outDir, "product-management.json"),
    JSON.stringify(management, null, 2),
  );
  console.log(`  saved ${management.count} items`);

  console.log("Scraping product/list (product-creation/search/v2)...");
  const list = await paginate(
    "https://seller.digikala.com/api/v2/product-creation/search/v2",
    cookie,
  );
  fs.writeFileSync(path.join(outDir, "product-list.json"), JSON.stringify(list, null, 2));
  console.log(`  saved ${list.count} items`);

  console.log("Scraping variant-management (variants)...");
  const variants = await paginate(
    "https://seller.digikala.com/api/v2/variants?order=desc",
    cookie,
  );
  fs.writeFileSync(
    path.join(outDir, "variant-management.json"),
    JSON.stringify(variants, null, 2),
  );
  console.log(`  saved ${variants.count} items`);

  console.log("Fetching category 5808 registration bind (microwave)...");
  const validation = await fetchJson(
    "https://seller.digikala.com/api/v2/product-creation/category/5808/validation",
    cookie,
  );
  const bind = validation?.data?.bind ?? {};
  const reverse = {
    scrapedAt: new Date().toISOString(),
    sampleProductId: 22846237,
    sampleDkp: "DKP-22846237",
    categoryId: 5808,
    categoryPath: ["لوازم خانگی برقی", "لوازم پخت و پز", "مایکروویو، مایکروفر"],
    leafTitle: "مایکروویو، مایکروفر",
    createSteps: [
      {
        step: 1,
        title: "دسته‌بندی",
        url: "/pwa/product/create/1?categoryId=5808",
        notes: "Leaf category + تنوع گروه کالایی (رنگ for microwave)",
        fields: [
          { id: "categoryId", label: "دسته‌بندی", required: true, value: 5808 },
          {
            id: "variantGroup",
            label: "تنوع گروه کالایی",
            required: true,
            options: ["رنگ"],
            observed: "رنگ",
          },
        ],
      },
      {
        step: 2,
        title: "اطلاعات کلی",
        url: "/pwa/product/create/2?categoryId=5808",
        api: "/api/v2/product-creation/category/5808/validation",
        fields: [
          { id: "brand_id", label: "برند یا نام سازنده کالا", required: true },
          { id: "product_type", label: "نوع کالا", required: true, source: "category_product_types" },
          { id: "model", label: "مدل کالا", required: true },
          { id: "division_id", label: "دسته بندی کالا", required: true, source: "divisions" },
          { id: "is_iranian", label: "مبدا کالا", required: true },
          {
            id: "category_mefa_type",
            label: "شناسه عمومی / اختصاصی",
            required: true,
            options: ["general", "exclusive"],
            note: "allow_fake=false; non-original disabled for this category",
          },
          { id: "general_mefa_id", label: "شناسه عمومی", required: true, source: "general_mefa" },
          { id: "package_length", label: "طول بسته‌بندی", unit: "cm", required: true },
          { id: "package_width", label: "عرض بسته‌بندی", unit: "cm", required: true },
          { id: "package_height", label: "ارتفاع بسته‌بندی", unit: "cm", required: true },
          { id: "package_weight", label: "وزن با بسته‌بندی", unit: "g", required: true },
          { id: "description", label: "شرح کالا", required: false },
          { id: "pros_cons", label: "نقاط ضعف و قوت", required: false },
        ],
        bindSummary: {
          brandsCount: (bind.brands || []).length,
          category_product_types: bind.category_product_types,
          divisions: bind.divisions,
          allow_fake: bind.allow_fake,
          show_colors: bind.show_colors,
          dimension_level: bind.dimension_level,
          category_mefa_type: bind.category_mefa_type,
          general_mefa_keys: Object.keys(bind.general_mefa || {}),
          platforms: bind.platforms,
        },
      },
      {
        step: 3,
        title: "مشخصات",
        url: "/pwa/product/create/3",
        api: "POST /api/v2/product-creation/attributes (requires draft_product_id)",
        note: "Category-specific attribute schema loaded after draft creation",
        fieldsFromLiveProduct: null,
      },
      { step: 4, title: "عنوان", url: "/pwa/product/create/4" },
      { step: 5, title: "عکس", url: "/pwa/product/create/5" },
    ],
  };

  // Public Digikala PDP specs for the sample product (no seller cookie needed)
  try {
    const pdp = await fetch(
      "https://api.digikala.com/v2/product/22846237/",
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0",
        },
      },
    ).then((r) => r.json());
    const specs = pdp?.data?.product?.specifications ?? [];
    reverse.createSteps[2].fieldsFromLiveProduct = specs;
    reverse.sampleProduct = {
      id: pdp?.data?.product?.id,
      title_fa: pdp?.data?.product?.title_fa,
      brand: pdp?.data?.product?.brand,
      category: pdp?.data?.product?.category,
      breadcrumb: pdp?.data?.product?.breadcrumb,
    };
  } catch (e) {
    reverse.pdpError = String(e);
  }

  fs.writeFileSync(
    path.join(outDir, "reverse-dkp-22846237-microwave.json"),
    JSON.stringify(reverse, null, 2),
  );
  fs.writeFileSync(
    path.join(outDir, "category-5808-validation-bind.json"),
    JSON.stringify(
      {
        scrapedAt: new Date().toISOString(),
        categoryId: 5808,
        isValid: validation?.data?.isValid,
        bind,
      },
      null,
      2,
    ),
  );

  console.log("Done.");
  console.log(
    JSON.stringify(
      {
        management: management.count,
        list: list.count,
        variants: variants.count,
        outDir,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
