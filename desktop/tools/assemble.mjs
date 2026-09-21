// Składa finalną aplikację MiraOS (desktop/app) z elementów:
//  - build Vite (desktop/resources/index.html)
//  - czcionki offline (tools/fonts-inline.css)
//  - klient Neutralino + globals (wstrzykiwane do index.html)
//  - warstwa natywna mira-win.js, ikony, tapeta, skrypty .bat
//  - MiraOS.exe (zbudowanyNeutralino)
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), ".."); // desktop/
const app = join(root, "app");
const res = join(app, "resources");

let html = readFileSync(join(root, "resources/index.html"), "utf8");
const fonts = readFileSync(join(root, "tools/fonts-inline.css"), "utf8");

html = html.replace("</head>", "<style>\n" + fonts + "\n</style>\n</head>");
html = html.replace(
  "</body>",
  '<script src="/__neutralino_globals.js"></script>\n<script src="/neutralino.js"></script>\n<script src="./mira-win.js"></script>\n<script src="./apps-launcher.js"></script>\n</body>'
);

mkdirSync(res, { recursive: true });
mkdirSync(join(res, "icons"), { recursive: true });
writeFileSync(join(res, "index.html"), html);

copyFileSync(join(root, "app-src/resources/mira-win.js"), join(res, "mira-win.js"));
copyFileSync(join(root, "app-src/resources/apps-launcher.js"), join(res, "apps-launcher.js"));
copyFileSync(join(root, "assets/logo.png"), join(res, "icons/appIcon.png"));
copyFileSync(join(root, "assets/wallpaper.png"), join(res, "wallpaper.png"));
if (existsSync(join(root, "neutralino/MiraOS-raw.exe"))) {
  copyFileSync(join(root, "neutralino/MiraOS-raw.exe"), join(app, "MiraOS.exe"));
} // w przeciwnym razie zostaje binarka z repo (app/MiraOS.exe)

console.log("Złożono desktop/app — index.html:", html.length, "bajtów");
