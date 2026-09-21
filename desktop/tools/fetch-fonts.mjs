// Pobiera czcionki z Google Fonts i generuje CSS z wbudowanymi plikami woff2 (base64),
// tak żeby MiraOS.exe działał w pełni offline (razem ze polskimi znakami latin-ext).
import { writeFile } from "node:fs/promises";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

const FAMILIES = [
  "family=Unbounded:wght@300;400;500;600;700;800",
  "family=Space+Grotesk:wght@300;400;500;600;700",
  "family=JetBrains+Mono:wght@400;500",
];

const cssUrl = `https://fonts.googleapis.com/css2?${FAMILIES.join("&")}&display=swap`;

const res = await fetch(cssUrl, { headers: { "User-Agent": UA } });
const css = await res.text();

// podziel na bloki z komentarzami /* latin */, /* latin-ext */ itd.
const blocks = [...css.matchAll(/\/\*\s*([a-z-]+)\s*\*\/\s*(@font-face\s*\{[^}]+\})/g)];
const keep = blocks.filter(([, subset]) => subset === "latin" || subset === "latin-ext");

let out = "/* MiraOS — czcionki wbudowane (latin + latin-ext) */\n";
const cache = new Map();

for (const [, subset, block] of keep) {
  const urlMatch = block.match(/url\((https:[^)]+\.woff2)\)/);
  if (!urlMatch) continue;
  const url = urlMatch[1];
  let b64 = cache.get(url);
  if (!b64) {
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (!r.ok) throw new Error(`Nie udało się pobrać: ${url}`);
    const buf = Buffer.from(await r.arrayBuffer());
    b64 = buf.toString("base64");
    cache.set(url, b64);
    console.log(`pobrano ${url.split("/").pop()} (${(buf.length / 1024).toFixed(1)} KB)`);
  }
  const inlined = block.replace(/url\((https:[^)]+\.woff2)\)/, `url(data:font/woff2;base64,${b64})`);
  out += `${inlined}\n`;
}

await writeFile(new URL("./fonts-inline.css", import.meta.url), out);
console.log(`OK: ${keep.length} bloków @font-face -> fonts-inline.css`);
