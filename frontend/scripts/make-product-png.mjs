import sharp from "sharp";
import path from "node:path";

/**
 * Digikala product cards use a plain product photo on white — no category circle.
 * Build that from the appliance artwork by flattening the gray disk to white.
 */
const src = path.join("public", "placeholders", "cat-appliance.jpg");
const dest = path.join("public", "placeholders", "product-appliance.png");

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
    const isNeutral = max - min < 22;

    // White page fill + soft gray category circle → solid white product bg
    if (isNeutral && min > 200) {
      out[i] = 255;
      out[i + 1] = 255;
      out[i + 2] = 255;
      out[i + 3] = 255;
    }
  }
}

await sharp(out, { raw: { width, height, channels } }).png().toFile(dest);
console.log("wrote", dest, `${width}x${height}`);
