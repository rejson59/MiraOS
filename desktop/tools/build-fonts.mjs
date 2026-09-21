// Skleja czcionki z @fontsource w jeden CSS z wbudowanymi woff2 (base64, latin + latin-ext).
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const NM = join(here, "node_modules", "@fontsource");

const PLAN = [
  ["unbounded", [300, 400, 500, 600, 700, 800]],
  ["space-grotesk", [300, 400, 500, 600, 700]],
  ["jetbrains-mono", [400, 500]],
];

const cache = new Map();
async function inline(file) {
  let b64 = cache.get(file);
  if (!b64) {
    const buf = await readFile(file);
    b64 = buf.toString("base64");
    cache.set(file, b64);
    console.log(`${file.split("/").pop()} ${(buf.length / 1024).toFixed(1)} KB`);
  }
  return b64;
}

let out = "/* MiraOS — czcionki wbudowane (latin + latin-ext, offline) */\n";
let count = 0;
for (const [fam, weights] of PLAN) {
  for (const w of weights) {
    const css = await readFile(join(NM, fam, `${w}.css`), "utf8");
    const blocks = [...css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[^}]+\})/g)]
      .filter(([, tag]) => tag.includes("-latin-") || tag.includes("-latin-ext-"));
    for (const [, tag, block] of blocks) {
      // zostaw tylko woff2, wyrzuć zapasowy woff
      let b = block.replace(/,\s*url\(\.\/[^)]+\.woff\)\s*format\('woff'\)/, "");
      const m = b.match(/url\(\.\/([^)]+\.woff2)\)/);
      if (!m) continue;
      const b64 = await inline(join(NM, fam, m[1]));
      out += b.replace(/url\(\.\/[^)]+\.woff2\)/, `url(data:font/woff2;base64,${b64})`) + "\n";
      count++;
    }
  }
}

await writeFile(join(here, "fonts-inline.css"), out);
console.log(`OK: ${count} @font-face -> fonts-inline.css`);
