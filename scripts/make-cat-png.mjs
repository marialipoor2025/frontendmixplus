import sharp from "sharp";
import path from "node:path";

/**
 * Digikala category icons: soft gray circle + product, transparent everywhere else.
 * Source JPG has a white square fill — chroma-key that white to alpha.
 */
const src = path.join("public", "placeholders", "cat-appliance.jpg");
const dest = path.join("public", "placeholders", "cat-appliance.png");

const { data, info } = await sharp(src)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const out = Buffer.from(data);

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * channels;
    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    const isNeutral = max - min < 18;

    // Pure / near-white page fill → transparent (keep soft gray circle ~#e0e0e0)
    if (isNeutral && min > 248) {
      out[i + 3] = 0;
    } else if (isNeutral && min > 235) {
      // Soft fade so the circle rim doesn't get a hard halo
      const t = (min - 235) / (248 - 235);
      out[i + 3] = Math.round(255 * (1 - Math.min(1, Math.max(0, t))));
    }
  }
}

await sharp(out, { raw: { width, height, channels } }).png().toFile(dest);
console.log("wrote", dest, `${width}x${height}`);
