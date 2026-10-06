import { mockHomePageData } from "@/lib/mocks/home";
import { siteConfig } from "@/config/site";
import type { ProductRailSection } from "@/types/home";
import type { Product } from "@/types/product";
import type { ProductDetailPageData } from "@/types/product-detail";

function allHomeProducts(): Product[] {
  return [
    ...mockHomePageData.amazingOffers,
    ...mockHomePageData.productRails.flatMap((r) => r.products),
  ];
}

function uniqueBySlug(products: Product[]): Product[] {
  const seen = new Set<string>();
  return products.filter((p) => {
    if (seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });
}

function withPrefixedIds(products: Product[], prefix: string): Product[] {
  return products.map((p, index) => ({
    ...p,
    id: `${prefix}-${p.id}-${index}`,
  }));
}

function filterByTitle(products: Product[], keywords: string[]): Product[] {
  return products.filter((p) =>
    keywords.some((kw) => p.title.includes(kw)),
  );
}

/** Pad a short list by cloning with slight price/title variation for carousel density. */
function padProducts(products: Product[], minCount: number): Product[] {
  if (products.length === 0) return [];
  const out = [...products];
  let i = 0;
  while (out.length < minCount) {
    const base = products[i % products.length]!;
    const n = out.length + 1;
    const discount = n % 3 === 0 ? 8 + (n % 7) : undefined;
    const price = Math.round(base.price.amount * (0.92 + (n % 9) * 0.02));
    out.push({
      ...base,
      id: `${base.id}-pad-${n}`,
      slug: `${base.slug}-v${n}`,
      title: `${base.title} — گزینه ${new Intl.NumberFormat("fa-IR").format(n)}`,
      price: { amount: price, currency: base.price.currency },
      originalPrice: discount
        ? {
            amount: Math.round(price / (1 - discount / 100)),
            currency: base.price.currency,
          }
        : undefined,
      discountPercent: discount,
      brandName: base.brandName,
    });
    i += 1;
  }
  return out.slice(0, minCount);
}

/** Build PDP recommendation carousels from home catalog mocks. */
function buildRecommendationRails(
  currentSlug: string,
): ProductRailSection[] {
  const catalog = uniqueBySlug(allHomeProducts()).filter(
    (p) => p.slug !== currentSlug,
  );
  const fridgeRail =
    mockHomePageData.productRails.find((r) => r.id === "rail-fridge")
      ?.products ?? [];
  const similar = padProducts(
    uniqueBySlug(fridgeRail.filter((p) => p.slug !== currentSlug)),
    12,
  );

  const washers = padProducts(filterByTitle(catalog, ["لباسشویی"]), 12);
  const tvs = padProducts(filterByTitle(catalog, ["تلویزیون"]), 12);
  const dishwashers = padProducts(filterByTitle(catalog, ["ظرفشویی"]), 12);
  const boughtTogether = padProducts(
    uniqueBySlug([
      ...filterByTitle(catalog, ["ظرفشویی"]),
      ...filterByTitle(catalog, ["لباسشویی"]),
      ...filterByTitle(catalog, ["جاروبرقی"]),
      ...filterByTitle(catalog, ["تلویزیون"]),
    ]),
    12,
  );

  const fallback = padProducts(catalog.slice(0, 4), 8);

  return [
    {
      id: "pdp-similar",
      title: "کالاهای مشابه",
      products: withPrefixedIds(
        similar.length > 0 ? similar : fallback,
        "sim",
      ),
    },
    {
      id: "pdp-bought-together",
      title: "درکنارش خریداری شده",
      products: withPrefixedIds(
        boughtTogether.length > 0 ? boughtTogether : fallback,
        "bt",
      ),
    },
    {
      id: "pdp-washers",
      title: "ماشین لباسشویی",
      products: withPrefixedIds(
        washers.length > 0 ? washers : fallback,
        "wm",
      ),
    },
    {
      id: "pdp-tvs",
      title: "تلویزیون",
      products: withPrefixedIds(tvs.length > 0 ? tvs : fallback, "tv"),
    },
    {
      id: "pdp-dishwashers",
      title: "ماشین ظرفشویی",
      products: withPrefixedIds(
        dishwashers.length > 0 ? dishwashers : fallback,
        "dw",
      ),
    },
  ];
}

const DEFAULT_CRUMBS = [
  { id: "home", title: siteConfig.nameFa, href: "/" },
  {
    id: "appliances",
    title: "لوازم خانگی برقی",
    href: "/categories",
  },
  {
    id: "fridge",
    title: "یخچال فریزر",
    href: "/categories/refrigerator-freezer",
  },
];

const EXTRA_GALLERY_URLS = [
  "/placeholders/product-appliance.png",
  "/placeholders/cat-appliance.jpg",
  "/placeholders/cat-appliance.png",
  "/placeholders/product-appliance.png",
  "/placeholders/cat-appliance.jpg",
];

function brandSlugFromId(brandId: string): string {
  return brandId.replace(/^b-/, "");
}

/** Temporary PDP payload until Catalog PDP API exists. */
export function getMockProductDetail(slug: string): ProductDetailPageData | null {
  const product =
    mockHomePageData.amazingOffers.find((p) => p.slug === slug) ??
    mockHomePageData.productRails.flatMap((r) => r.products).find((p) => p.slug === slug);

  if (!product) return null;

  const brandSlug = brandSlugFromId(product.brandId);
  const categorySlug = "refrigerator-freezer";
  const categoryTitle = "یخچال فریزر";

  // Digikala mosaic: 5 images → [large + 2 stacked] then [large + 1 stacked]
  const images = EXTRA_GALLERY_URLS.map((url, index) => ({
    id: `${product.id}-img-${index + 1}`,
    url: index === 0 ? product.imageUrl || url : url,
    alt: `تصویر ${index + 1} — ${product.title}`,
  }));

  return {
    slug: product.slug,
    title: product.title,
    sku: `MX-${product.id.replace(/\D/g, "").slice(0, 8) || "10000001"}`,
    brand: {
      id: product.brandId,
      name: product.brandName,
      slug: brandSlug,
    },
    titleNav: [
      {
        id: "brand",
        title: product.brandName,
        href: `/brand/${brandSlug}`,
      },
      {
        id: "category-brand",
        title: `${categoryTitle} ${product.brandName}`,
        href: `/categories/${categorySlug}/${brandSlug}`,
      },
    ],
    variant: {
      rating: product.rating ?? 3.6,
      ratingCount: Math.max(1, Math.round((product.reviewCount ?? 20) * 0.9)),
      commentCount: product.reviewCount ?? 21,
      questionCount: Math.max(5, Math.round((product.reviewCount ?? 20) * 0.13)),
      optionGroups: [
        {
          id: "opt-color",
          code: "color",
          name: "رنگ",
          ui: "swatch",
          values: [
            {
              id: "white-gloss",
              label: "سفید براق",
              swatchHex: "rgb(255, 253, 250)",
              available: true,
            },
            {
              id: "steel",
              label: "استیل",
              swatchHex: "rgb(235, 235, 235)",
              available: true,
            },
          ],
        },
        {
          id: "opt-capacity",
          code: "capacity",
          name: "ظرفیت",
          ui: "chip",
          values: [
            { id: "cap-28", label: "۲۸ فوت", available: true },
            { id: "cap-30", label: "۳۰ فوت", available: true },
            { id: "cap-32", label: "۳۲ فوت", available: false },
          ],
        },
      ],
      selectedOptionValueIds: {
        "opt-color": "white-gloss",
        "opt-capacity": "cap-28",
      },
      skus: [
        {
          id: "sku-wg-28",
          sku: `${product.slug}-wg-28`.toUpperCase().slice(0, 28),
          optionValueIds: ["white-gloss", "cap-28"],
          price: product.price.amount,
          originalPrice:
            product.originalPrice?.amount ??
            Math.round(product.price.amount * 1.19),
          discountPercent: product.discountPercent ?? 19,
          inStock: true,
        },
        {
          id: "sku-wg-30",
          sku: `${product.slug}-wg-30`.toUpperCase().slice(0, 28),
          optionValueIds: ["white-gloss", "cap-30"],
          price: product.price.amount + 4_500_000,
          originalPrice:
            (product.originalPrice?.amount ??
              Math.round(product.price.amount * 1.19)) + 5_000_000,
          discountPercent: product.discountPercent ?? 19,
          inStock: true,
        },
        {
          id: "sku-st-28",
          sku: `${product.slug}-st-28`.toUpperCase().slice(0, 28),
          optionValueIds: ["steel", "cap-28"],
          price: product.price.amount + 1_200_000,
          originalPrice:
            product.originalPrice?.amount ??
            Math.round((product.price.amount + 1_200_000) * 1.19),
          discountPercent: product.discountPercent ?? 19,
          inStock: true,
        },
        {
          id: "sku-st-30",
          sku: `${product.slug}-st-30`.toUpperCase().slice(0, 28),
          optionValueIds: ["steel", "cap-30"],
          price: product.price.amount + 5_800_000,
          inStock: false,
        },
      ],
      // Legacy fields kept for transitional readers.
      selectedColorId: "white-gloss",
      colors: [
        { id: "white-gloss", name: "سفید براق", hex: "rgb(255, 253, 250)" },
        { id: "steel", name: "استیل", hex: "rgb(235, 235, 235)" },
      ],
    },
    insurance: {
      id: "ins-appliance-saman",
      title: "بیمه لوازم خانگی برقی - بیمه سامان",
      price: 4_668_400,
      originalPrice: 9_335_700,
      discountPercent: 50,
      detailsHref: "#insurance-details",
    },
    features: [
      {
        id: "fridge-type",
        label: "نوع یخچال فریزر",
        value: "ساید بای ساید",
      },
      {
        id: "energy-grade",
        label: "گرید انرژی",
        value: "A+",
      },
      {
        id: "freezer-features",
        label: "امکانات اختصاصی فریزر",
        value: "بدون برفک، سرمایش سریع (Super Freezing)، لامپ فریزر",
      },
      {
        id: "fridge-features",
        label: "امکانات اختصاصی یخچال",
        value:
          "دارای کشو با تنظیم دما و رطوبت، لامپ یخچال، سرمایش سریع (Super Cooling)، درب بار خانگی",
      },
      {
        id: "frost-resistance",
        label: "نوع مقاومت در برابر برفک",
        value: "نوفراست",
      },
      {
        id: "accessories",
        label: "اقلام همراه یخچال/فریزر",
        value: "دفترچه راهنما",
      },
    ],
    returnNotice:
      'درخواست مرجوع کردن کالا در گروه یخچال و فریزر با دلیل "انصراف از خرید" تنها در صورتی قابل تایید است که کالا در شرایط اولیه باشد (در صورت پلمپ بودن، کالا نباید باز شده باشد).',
    touchPoints: {
      plus: {
        perk: "پشتیبانی اختصاصی",
        ctaLabel: "خرید اشتراک",
        href: "/plus",
      },
      finance: {
        title: "خرید این کالا با تسهیلات میکس‌پی",
        monthlyAmount: Math.max(
          1,
          Math.round(product.price.amount / 12 / 100) * 100,
        ),
        months: 12,
        suggestedCredit: 100_000_000,
        href: "/finance",
      },
    },
    buyBox: {
      seller: {
        id: product.sellerId,
        name: product.sellerName || siteConfig.nameFa,
        href: `/seller/${product.sellerId}`,
        performanceLabel: "عالی",
      },
      otherSellerCount: 1,
      price: product.price.amount,
      originalPrice:
        product.originalPrice?.amount ??
        Math.round(product.price.amount * 1.19),
      discountPercent: product.discountPercent ?? 19,
      /** Tip for switching to another seller — Digikala cheaper strip. */
      cheaperByAmount: 227_500,
      warranty: "گارانتی ۲۴ ماهه انتخاب سرویس حامی",
      delivery: {
        title: "روش و هزینه تحویل",
        methodLabel: `باربری توسط ${siteConfig.nameFa}`,
        costLabel: "وابسته به سبد",
      },
    },
    sellers: [
      {
        id: product.sellerId,
        name: product.sellerName || siteConfig.nameFa,
        href: `/seller/${product.sellerId}`,
        isOfficial: true,
        performanceLabel: "عالی",
        deliveryLabel: `باربری توسط ${siteConfig.nameFa}`,
        warranty: "گارانتی ۲۴ ماهه انتخاب سرویس حامی",
        price: product.price.amount,
        originalPrice: product.originalPrice?.amount,
        discountPercent: product.discountPercent,
        stats: {
          memberSinceLabel: "عضو از ۱۰ سال و ۲ ماه",
          onTimeSupplyPercent: 100,
          shipCommitmentPercent: 100,
          noReturnPercent: 99.9,
        },
      },
      {
        id: "seller-niavaran",
        name: "فروشگاه بازرگانی نیاوران",
        href: "/seller/niavaran",
        performanceLabel: "عالی",
        deliveryLabel: `باربری توسط ${siteConfig.nameFa} از ۲ روز دیگر`,
        warranty: "گارانتی ۲۴ ماهه انتخاب سرویس حامی",
        price: Math.max(1000, product.price.amount - 227_500),
        stats: {
          memberSinceLabel: "عضو از ۵ سال و ۱۰ ماه",
          onTimeSupplyPercent: 98.4,
          shipCommitmentPercent: 96.1,
          noReturnPercent: 99,
        },
      },
    ],
    content: {
      intro: {
        preview:
          "یخچال فریزر ساید بای ساید اسنوا S1Di-S110، با شکوهی به وسعت ۲۷ فوت و ظرفیت ۷۸۰ لیتر، تجسمی از آسایش و هوشمندی در آشپزخانه‌ی شماست. این دستگاه با رنگ سفید و دستگیره‌های مخفی، زیبایی را با عملکردی بی‌نقص در هم می‌آمیزد.\nدر قلب این غول دوست‌داشتنی، کمپرسور اینورتر با رده‌ی انرژی A+، در سکوت و با کمترین مصرف، طراوت را به بخش یخچال ۳۹۴ لیتری و فریزر ۱۹۷ لیتری تزریق می‌کند. سیستم گردش هوای چندگانه و نوفراست کامل، تازگی پایدار مواد غذایی را تضمین می‌کنند. آبسردکن و یخ‌ساز اتوماتیک م ...",
        full:
          "یخچال فریزر ساید بای ساید اسنوا S1Di-S110، با شکوهی به وسعت ۲۷ فوت و ظرفیت ۷۸۰ لیتر، تجسمی از آسایش و هوشمندی در آشپزخانه‌ی شماست. این دستگاه با رنگ سفید و دستگیره‌های مخفی، زیبایی را با عملکردی بی‌نقص در هم می‌آمیزد.\nدر قلب این غول دوست‌داشتنی، کمپرسور اینورتر با رده‌ی انرژی A+، در سکوت و با کمترین مصرف، طراوت را به بخش یخچال ۳۹۴ لیتری و فریزر ۱۹۷ لیتری تزریق می‌کند. سیستم گردش هوای چندگانه و نوفراست کامل، تازگی پایدار مواد غذایی را تضمین می‌کنند. آبسردکن و یخ‌ساز اتوماتیک متصل به آب شهری، همراه با قابلیت اتصال هوشمند، تجربه‌ای راحت و به‌روز از نگهداری مواد غذایی را فراهم می‌کند.",
      },
      expertReview: {
        title:
          "بررسی یخچال فریزر ساید بای ساید ۲۷ فوت اسنوا مدل S1Di-S110-W: تلفیقی از ظرفیت، هوشمندی و طراوت پایدار",
        preview:
          "یخچال فریزر ساید بای ساید اسنوا مدل S1Di-S110-W، با گنجایش اسمی قابل توجه ۲۷ فوت مکعب که معادل ۷۸۰ لیتر فضای ذخیره‌سازی است، به عنوان یک مرکز فرماندهی پیشرفته و جادار برای نگهداری مواد غذایی در آشپزخانه‌های مدرن ایرانی طراحی شده است. این محصول از برند نام‌آشنای اسنوا، با رنگ سفید و طراحی چشم‌نواز، مجموعه‌ای از فناوری‌های نوین سرمایشی، کمپرسور اینورتر کارآمد، آبسردکن و یخ‌ساز اتوماتیک متصل به آب شهری، و قابلیت اتصال به اینترنت (IoT)، تجربه‌ای بی‌نظیر از مدیریت طراوت، راحتی و سبک زندگی هوشمند را برای خانواده‌های ایرانی به ارمغان می‌آورد.",
        full:
          "یخچال فریزر ساید بای ساید اسنوا مدل S1Di-S110-W، با گنجایش اسمی قابل توجه ۲۷ فوت مکعب که معادل ۷۸۰ لیتر فضای ذخیره‌سازی است، به عنوان یک مرکز فرماندهی پیشرفته و جادار برای نگهداری مواد غذایی در آشپزخانه‌های مدرن ایرانی طراحی شده است. این محصول از برند نام‌آشنای اسنوا، با رنگ سفید و طراحی چشم‌نواز، مجموعه‌ای از فناوری‌های نوین سرمایشی، کمپرسور اینورتر کارآمد، آبسردکن و یخ‌ساز اتوماتیک متصل به آب شهری، و قابلیت اتصال به اینترنت (IoT)، تجربه‌ای بی‌نظیر از مدیریت طراوت، راحتی و سبک زندگی هوشمند را برای خانواده‌های ایرانی به ارمغان می‌آورد.\nفضای یخچال و فریزر با قفسه‌بندی منعطف، کشوهای تنظیم‌شونده و نورپردازی داخلی، چیدمان مواد غذایی را ساده می‌کند. نوفراست کامل و گردش هوای چندگانه از ایجاد برفک جلوگیری کرده و تازگی مواد را طولانی‌تر نگه می‌دارد.",
      },
      specs: [
        {
          id: "general",
          title: "مشخصات کلی",
          previewCount: 5,
          attributes: [
            {
              id: "sku-ids",
              label: "شناسه کالا",
              values: ["۲۹۰۰۱۷۶۵۰۹۲۰۹ - ۲۹۰۰۱۷۶۵۰۹۲۱۶"],
            },
            { id: "model", label: "مدل", values: ["S۱Di-S۱۱۰-W"] },
            {
              id: "type",
              label: "نوع یخچال فریزر",
              values: ["ساید بای ساید"],
            },
            { id: "gas", label: "نوع گاز (مبرد)", values: ["R۶۰۰a"] },
            { id: "energy", label: "گرید انرژی", values: ["A+"] },
            {
              id: "capacity-l",
              label: "گنجایش کل به لیتر",
              values: ["۷۸۰"],
            },
            {
              id: "capacity-ft",
              label: "گنجایش کل به فوت",
              values: ["۲۷ فوت"],
            },
            {
              id: "frost",
              label: "نوع مقاومت در برابر برفک",
              values: ["نوفراست"],
            },
            {
              id: "display",
              label: "امکانات صفحه نمایش",
              values: ["نمایشگر لمسی", "کنترل دمای یخچال و فریزر"],
            },
            {
              id: "water",
              label: "امکانات آب‌ریز",
              values: ["فیلتر تصفیه آب"],
            },
            {
              id: "features",
              label: "ویژگی‌های یخچال فریزر",
              values: [
                "لزوم اتصال به شیر آب",
                "سیستم گردش هوای چندگانه",
                "هشدار باز بودن درب",
              ],
            },
            {
              id: "other",
              label: "سایر ویژگی‌ها",
              values: ["کمپرسور اینورتر"],
            },
            {
              id: "accessories",
              label: "اقلام همراه یخچال/فریزر",
              values: ["دفترچه راهنما"],
            },
          ],
        },
      ],
      comments: {
        averageRating: product.rating ?? 3.6,
        ratingCount: Math.max(1, Math.round((product.reviewCount ?? 20) * 0.9)),
        totalCount: product.reviewCount ?? 21,
        photos: [
          {
            id: "cphoto-1",
            url: product.imageUrl || "/placeholders/product-appliance.png",
          },
          { id: "cphoto-2", url: "/placeholders/cat-appliance.jpg" },
        ],
        topicFilters: ["کیفیت و کارایی", "شباهت یا مغایرت"],
        comments: [
          {
            id: "c1",
            authorName: "فاطمه حسین زاده",
            isBuyer: true,
            expertLabel: "صاحب‌نظر لوازم خانگی برقی",
            dateLabel: "۴ مرداد ۱۴۰۵",
            rating: 5,
            body: "بسیار بسیار راضی هستم\nزیباست کم صداست دوست داشتنیه هنوز بعد از یکسال و نیم هر وقت استفاده میکنم از زیباییش لذت میبرم حس عاطفی خوبی بهش پیدا کردم امیدوارم شما هم بتونید بخرید و مثل من از داشتنش لذت ببرید\nمن فقط عاشق محصولات الجی بودم ولی مجبور شدم به اجبار اینو بخرم ولی الان از داشتنش به اندازه محصولات الجی لذت میبرم",
            sellerName: "فروشگاه لوازم خانگی عبدالهی",
            sellerHref: "/seller/abdollahi",
            colorName: "سفید متالیک",
            colorHex: "rgb(251, 252, 246)",
            likes: 7,
            dislikes: 0,
          },
          {
            id: "c2",
            authorName: "محمد دهدشتی",
            isBuyer: true,
            expertLabel: "صاحب‌نظر لوازم خانگی برقی",
            dateLabel: "۷ فروردین ۱۴۰۵",
            rating: 1,
            body: "سلام، وقت بخیر\nمن ۱۶ اسفند این محصول رو از فروشگاه رز پارسا سفارش دادم ۳ فروردین دقیقا وسط تعطیلات دستمون رسید تا طبقه سوم آوردمش بالا بعد که برای نصب اومدن متوجه شدیم مدل متفاوتی فرستادن و بد تر از اون این که یخچال دارای خط و خش هست و مشخصه یخچال ویترینی بوده. وسط تعطیلات عید نمیتونم مرجوع کنم، برای فروشنده متاسفم و امیدوارم برخوردی با این قبیل فروشنده ها بشه. اگر میخواستم ویترینی بخرم از فروشگاه های شهر خودم میخریدم نه اینکه ۲۰ روز معطل باشم",
            sellerName: "رز پارسا",
            sellerHref: "/seller/rozparsa",
            colorName: "سفید براق",
            colorHex: "rgb(255, 253, 250)",
            likes: 33,
            dislikes: 1,
          },
          {
            id: "c3",
            authorName: "زهرا قدرتی جلده باخان",
            isBuyer: true,
            dateLabel: "۱۳ بهمن ۱۴۰۳",
            rating: 5,
            body: `بسیار زیبا و جادار.\nبه موقع دستم رسید. اما ماموران ${siteConfig.nameFa} از من ۵۰۰ تومان پول درخواست کردن تا طبقه چهارم بیارن. درصورتیکه ${siteConfig.nameFa} جداگانه ۶۰۰ تومن گرفته بود و نوشته بود که تا سه طبقه رایگانه.\nنصب هم به موقع انجام شد.`,
            sellerName: "فروشگاه لوازم خانگی عبدالهی",
            sellerHref: "/seller/abdollahi",
            colorName: "سفید متالیک",
            colorHex: "rgb(251, 252, 246)",
            likes: 22,
            dislikes: 6,
          },
          {
            id: "c4",
            authorName: "اسماعیل زارعی",
            dateLabel: "۲۳ شهریور ۱۴۰۵",
            body: "از فروشگاه انتخاب من در کرج خریداری کردم و چون در انبار موجود نداشتن یخچال ویترین رو برای ما ارسال کردن ولی باز من راضی هستم ازشون خدا هم راضی باشه یخچال هم الان دو ساله که دارمش تا الان خداروشکر همه چیش خوب بوده",
            likes: 0,
            dislikes: 0,
          },
          {
            id: "c5",
            authorName: "کاربر دیجی‌کالا",
            dateLabel: "۲۷ مهر ۱۴۰۳",
            body: "دوستان دقت کنید آقای هاتف بجای رنگ استیل رنگ سفید ارسال میکنند فکر کردن چون جای دور ارسال کردند مرجوع نمیکنم. یک میلیون هم پول کارگر دادم برای جابه جایی به طبقه دوم که حتما ازشون شکایت میکنم.",
            likes: 205,
            dislikes: 9,
          },
        ],
      },
      questions: {
        totalCount: 27,
        questions: [
          {
            id: "q1",
            text: "سلام فروشندگان محترم آیا یخچال آکبند و پلمپ ارسال می‌کند یا نمایشگاهی رو جعبه می‌زنید؟",
            answer: {
              id: "q1-a1",
              authorName: "لوازم خانگی مالکی",
              role: "seller",
              body: "فعلا کالای فیزیکی موجودی نیست",
              dateLabel: "۹ دی ۱۴۰۴",
              likes: 1,
              dislikes: 8,
            },
            extraAnswer: {
              id: "q1-a2",
              authorName: "انتخاب کلیک",
              role: "seller",
              body: "سلام وقت بخیر\nکالای آکبند و پلمپ شرکتی ارسال میشه خدمتتون",
              dateLabel: "۱۷ آبان ۱۴۰۴",
              likes: 2,
              dislikes: 0,
            },
          },
          {
            id: "q2",
            text: "سلام ببخشید این مدل ویترینی هستش",
            answer: {
              id: "q2-a1",
              authorName: "آیدا حیدری",
              body: "بله ویترینی هست",
              dateLabel: "۲۸ تیر ۱۴۰۵",
              likes: 0,
              dislikes: 0,
            },
            extraAnswer: {
              id: "q2-a2",
              authorName: "فاطمه سعیدی نصر",
              body: "خود نمایندگی ادعا می کرد دیجی کالا اکثرا ویترینی می فرسته",
              dateLabel: "۲۲ اردیبهشت ۱۴۰۵",
              likes: 2,
              dislikes: 0,
            },
          },
          {
            id: "q3",
            text: "موتور اینورتر هستش",
            answer: {
              id: "q3-a1",
              authorName: "محمدحسن مهدي نژادساري",
              role: "buyer",
              expertLabel: "صاحب‌نظر لوازم خانگی برقی",
              body: "بله کم صداست",
              dateLabel: "۱۶ آبان ۱۴۰۴",
              likes: 1,
              dislikes: 0,
            },
            extraAnswer: {
              id: "q3-a2",
              authorName: "آیدا حیدری",
              body: "بله تمام کالاهای اسنوا کمپرسرش اینورتر هست خیالت راحت",
              dateLabel: "۲۸ تیر ۱۴۰۵",
              likes: 0,
              dislikes: 0,
            },
          },
          {
            id: "q4",
            text: "سلام ببخشید قابلیت یخ پودری و قالبی داره؟",
            answer: {
              id: "q4-a1",
              authorName: "لوازم خانگی مالکی",
              role: "seller",
              body: "سلام لطفا به سایت اسنوا مراجعه فرمایید اونجا اطلاعات کلی و مشخصات کامل بعلاوه عکسهای مختلف ثبت شده است",
              dateLabel: "۹ دی ۱۴۰۴",
              likes: 0,
              dislikes: 5,
            },
            extraAnswer: {
              id: "q4-a2",
              authorName: "امیرمحمد دربانی",
              body: "بله دارد",
              dateLabel: "۱۰ بهمن ۱۴۰۴",
              likes: 0,
              dislikes: 0,
            },
          },
          {
            id: "q5",
            text: "لطفا راهنمایی میکنید تفاوت این مدل با s100_w در چی هست لطفا آیا هردو هوم بار دارن و اسمارت هستن؟",
            answer: {
              id: "q5-a1",
              authorName: "محمدحسن مهدي نژادساري",
              role: "buyer",
              expertLabel: "صاحب‌نظر لوازم خانگی برقی",
              body: "هر دو اسمارت هستن\nولی ۱۱۰ بار داره\n۱۰۰ نداره",
              dateLabel: "۱۶ آبان ۱۴۰۴",
              likes: 4,
              dislikes: 0,
            },
            extraAnswer: {
              id: "q5-a2",
              authorName: "رضا نادری",
              body: "فرقش اندازشه این 27 فوت اون 28 فوت گرونتره",
              dateLabel: "۲۲ آبان ۱۴۰۳",
              likes: 0,
              dislikes: 2,
            },
          },
        ],
      },
    },
    recommendationRails: buildRecommendationRails(product.slug),
    breadcrumb: DEFAULT_CRUMBS,
    gallery: {
      images,
      sale: {
        label: "فروش ویژه",
        soldPercent: 12,
      },
    },
  };
}
