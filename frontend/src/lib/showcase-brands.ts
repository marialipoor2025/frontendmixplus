import type { Brand } from "@/types/brand";

/** Foreign / international brands (shown first). */
const FOREIGN_BRANDS: Brand[] = [
  {
    id: "showcase-aeg",
    name: "AEG",
    slug: "aeg",
    logoUrl: "/images/brands/aeg.png",
  },
  {
    id: "showcase-beko",
    name: "Beko",
    slug: "beko",
    logoUrl: "/images/brands/beko.svg",
  },
  {
    id: "showcase-bosch",
    name: "Bosch",
    slug: "bosch",
    logoUrl: "/images/brands/bosch.png",
  },
  {
    id: "showcase-daewoo",
    name: "Daewoo",
    slug: "daewoo",
    logoUrl: "/images/brands/daewoo.webp",
  },
  {
    id: "showcase-delonghi",
    name: "De'Longhi",
    slug: "delonghi",
    logoUrl: "/images/brands/delonghi.png",
  },
  {
    id: "showcase-elica",
    name: "Elica",
    slug: "elica",
    logoUrl: "/images/brands/elica.svg",
  },
  {
    id: "showcase-faber",
    name: "Faber",
    slug: "faber",
    logoUrl: "/images/brands/faber.avif",
  },
  {
    id: "showcase-gorenje",
    name: "Gorenje",
    slug: "gorenje",
    logoUrl: "/images/brands/gorenje.webp",
  },
  {
    id: "showcase-hisense",
    name: "Hisense",
    slug: "hisense",
    logoUrl: "/images/brands/hisense.png",
  },
  {
    id: "showcase-huawei",
    name: "Huawei",
    slug: "huawei",
    logoUrl: "/images/brands/huawei-mark.webp",
  },
  {
    id: "showcase-lg",
    name: "LG",
    slug: "lg",
    logoUrl: "/images/brands/lg.jpg",
  },
  {
    id: "showcase-midea",
    name: "Midea",
    slug: "midea",
    logoUrl: "/images/brands/midea.webp",
  },
  {
    id: "showcase-neff",
    name: "Neff",
    slug: "neff",
    logoUrl: "/images/brands/neff.svg",
  },
  {
    id: "showcase-ninja",
    name: "Ninja",
    slug: "ninja",
    logoUrl: "/images/brands/ninja.png",
  },
  {
    id: "showcase-panasonic",
    name: "Panasonic",
    slug: "panasonic",
    logoUrl: "/images/brands/panasonic.svg",
  },
  {
    id: "showcase-philips",
    name: "Philips",
    slug: "philips",
    logoUrl: "/images/brands/philips.png",
  },
  {
    id: "showcase-samsung",
    name: "Samsung",
    slug: "samsung",
    logoUrl: "/images/brands/samsung-wordmark.webp",
  },
  {
    id: "showcase-sharp",
    name: "Sharp",
    slug: "sharp",
    logoUrl: "/images/brands/sharp.svg",
  },
  {
    id: "showcase-siemens",
    name: "Siemens",
    slug: "siemens",
    logoUrl: "/images/brands/siemens.png",
  },
  {
    id: "showcase-smeg",
    name: "Smeg",
    slug: "smeg",
    logoUrl: "/images/brands/smeg.png",
  },
  {
    id: "showcase-tefal",
    name: "Tefal",
    slug: "tefal",
    logoUrl: "/images/brands/tefal.png",
  },
  {
    id: "showcase-teka",
    name: "Teka",
    slug: "teka",
    logoUrl: "/images/brands/teka.svg",
  },
  {
    id: "showcase-toshiba",
    name: "Toshiba",
    slug: "toshiba",
    logoUrl: "/images/brands/toshiba.webp",
  },
  {
    id: "showcase-xiaomi",
    name: "Xiaomi",
    slug: "xiaomi",
    logoUrl: "/images/brands/xiaomi.png",
  },
];

/** Iranian brands (shown after foreign). */
const IRANIAN_BRANDS: Brand[] = [
  {
    id: "showcase-alton",
    name: "Alton",
    slug: "alton",
    logoUrl: "/images/brands/alton.png",
  },
  {
    id: "showcase-bimax",
    name: "Bimax",
    slug: "bimax",
    logoUrl: "/images/brands/bimax.svg",
  },
  {
    id: "showcase-can",
    name: "CAN",
    slug: "can",
    logoUrl: "/images/brands/can.png",
  },
  {
    id: "showcase-datees",
    name: "Datees",
    slug: "datees",
    logoUrl: "/images/brands/datees.png",
  },
  {
    id: "showcase-derakhshan",
    name: "Derakhshan",
    slug: "derakhshan",
    logoUrl: "/images/brands/derakhshan.png",
  },
  {
    id: "showcase-dorsa",
    name: "Dorsa",
    slug: "dorsa",
    logoUrl: "/images/brands/dorsa.png",
  },
  {
    id: "showcase-ilia-steel",
    name: "Ilia Steel",
    slug: "ilia-steel",
    logoUrl: "/images/brands/ilia-steel.webp",
  },
  {
    id: "showcase-mixplus",
    name: "Mix+",
    slug: "mixplus",
    logoUrl: "/images/brands/mixplus.jpg",
  },
  {
    id: "showcase-pakshoma",
    name: "Pakshoma",
    slug: "pakshoma",
    logoUrl: "/images/brands/pakshoma.svg",
  },
  {
    id: "showcase-snowa",
    name: "Snowa",
    slug: "snowa",
    logoUrl: "/images/brands/snowa.png",
  },
  {
    id: "showcase-sportage",
    name: "Sportage",
    slug: "sportage",
    logoUrl: "/images/brands/sportage.png",
  },
  {
    id: "showcase-steel-alborz",
    name: "Steel Alborz",
    slug: "steel-alborz",
    logoUrl: "/images/brands/steel-alborz.png",
  },
  {
    id: "showcase-technogaz",
    name: "Technogaz",
    slug: "technogaz",
    logoUrl: "/images/brands/technogaz.png",
  },
  {
    id: "showcase-tecnogas",
    name: "Tecnogas",
    slug: "tecnogas",
    logoUrl: "/images/brands/tecnogas.png",
  },
  {
    id: "showcase-x-vision",
    name: "X.Vision",
    slug: "x-vision",
    logoUrl: "/images/brands/x-vision.png",
  },
];

/** Curated rail/page list: foreign first, then Iranian. */
export const SHOWCASE_BRANDS: Brand[] = [
  ...FOREIGN_BRANDS,
  ...IRANIAN_BRANDS,
];

/** Resolve a curated brand when Catalog has no Brands row (e.g. Mix+ seller house mark). */
export function resolveShowcaseBrand(slug: string): Brand | null {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return null;
  return (
    SHOWCASE_BRANDS.find((b) => b.slug.trim().toLowerCase() === normalized) ??
    null
  );
}
