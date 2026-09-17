import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const input = path.join(__dirname, "../src/assets/smart-cafe-logo.png");
const output = path.join(__dirname, "../src/assets/smart-cafe-logo-transparent.png");

const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

const pixels = Buffer.from(data);
const { width: w, height: h } = info;

const isBackground = (r, g, b) => {
    if (r > 95 && g > 75 && b > 55) return false;
    const brownScore = r - g + (g - b);
    return r < 110 && g < 90 && b < 75 && brownScore > -15;
};

for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    if (isBackground(r, g, b)) {
        pixels[i + 3] = 0;
    }
}

const cx = w / 2;
const cy = h / 2;
const radius = (Math.min(w, h) / 2) * 0.96;

for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const dx = x - cx;
        const dy = y - cy;

        if (dx * dx + dy * dy > radius * radius) {
            pixels[idx + 3] = 0;
        }
    }
}

await sharp(pixels, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toFile(output);

console.log("Logo processed:", output);
