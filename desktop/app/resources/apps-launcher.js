/* ============================================================
 * MiraOS — Launcher prawdziwych aplikacji v1.3
 *  • Skan Menu Start (scan-apps.ps1) → apps.json + ikonki PNG
 *  • Sortowanie: przypięte → najczęściej używane → alfabetycznie
 *  • Przypinanie do Rzeki (prawy przycisk na kafelku)
 *  • Liczenie uruchomień (trwałe)
 *  • window.MiraApps: loadApps / launch / reload / ordered()
 * ============================================================ */
(function () {
  "use strict";

  window.__MIRA_APPS = window.__MIRA_APPS || [];
  window.__MIRA_PINS = [];

  const loadedIcons = new Map(); // path -> objectURL
  let usage = {};                // nazwa -> liczba uruchomień
  let pins = [];                 // nazwy przypiętych (kolejność = kolejność w Rzece)

  function joinPath(a, b) {
    return a.replace(/[\\/]+$/, "") + "\\" + b.replace(/^[\\/]+/, "");
  }

  function notifyReact() {
    window.dispatchEvent(new Event("mira-apps-updated"));
  }

  async function storageGet(key) {
    try {
      return await Neutralino.storage.getData(key);
    } catch (_) {
      try { return localStorage.getItem(key); } catch (_) { return null; }
    }
  }
  async function storageSet(key, val) {
    try { await Neutralino.storage.setData(key, val); return; } catch (_) {}
    try { localStorage.setItem(key, val); } catch (_) {}
  }

  async function loadMeta() {
    try { const u = await storageGet("miraos-usage"); if (u) usage = JSON.parse(u) || {}; } catch (_) { usage = {}; }
    try { const p = await storageGet("miraos-pins"); if (p) pins = JSON.parse(p) || []; } catch (_) { pins = []; }
    window.__MIRA_PINS = pins;
  }

  async function saveMeta() {
    await storageSet("miraos-usage", JSON.stringify(usage));
    await storageSet("miraos-pins", JSON.stringify(pins));
    window.__MIRA_PINS = pins;
  }

  function score(a) {
    const u = usage[a.name] || 0;
    return u;
  }

  function ordered(list) {
    const pinIdx = (n) => { const i = pins.indexOf(n); return i === -1 ? 999 : i; };
    return [...list].sort((a, b) => {
      const pa = pinIdx(a.name), pb = pinIdx(b.name);
      if (pa !== pb) return pa - pb;
      const ua = score(a), ub = score(b);
      if (ua !== ub) return ub - ua;
      return a.name.localeCompare(b.name, "pl");
    });
  }

  function isPinned(name) { return pins.indexOf(name) !== -1; }

  async function togglePin(name) {
    if (isPinned(name)) pins = pins.filter((n) => n !== name);
    else { pins.push(name); pins = pins.slice(-12); }
    await saveMeta();
    publish(window.__MIRA_APPS.map(stripDecor));
    notifyReact();
  }

  function stripDecor(a) {
    return { name: a.name, lnk: a.lnk, target: a.target, type: a.type, icon: a.icon };
  }

  async function readApps() {
    const dataDir = await Neutralino.os.getPath("data");
    const jsonPath = joinPath(dataDir, "MiraOS\\apps.json");
    const raw = await Neutralino.filesystem.readFile(jsonPath);
    const parsed = JSON.parse(raw);
    const apps = Array.isArray(parsed) ? parsed : parsed.apps || [];
    return apps
      .filter((a) => a.name && (a.lnk || a.target))
      .map((a) => ({
        name: a.name,
        lnk: a.lnk || null,
        target: a.target || "",
        type: a.type || "win32",
        icon: a.icon || null,
      }));
  }

  async function loadIcons(apps) {
    const batch = apps.filter((a) => a.icon && !loadedIcons.has(a.icon)).slice(0, 400);
    for (const a of batch) {
      try {
        const data = await Neutralino.filesystem.readBinaryFile(a.icon); // ArrayBuffer
        const blob = new Blob([data], { type: "image/png" });
        loadedIcons.set(a.icon, URL.createObjectURL(blob));
      } catch (_) {
        loadedIcons.set(a.icon, null);
      }
    }
  }

  function publish(apps) {
    const sorted = ordered(apps);
    window.__MIRA_APPS = sorted.map((a) => ({
      ...a,
      iconDataUrl: a.icon ? loadedIcons.get(a.icon) || null : null,
      pinned: isPinned(a.name),
      uses: usage[a.name] || 0,
    }));
    notifyReact();
    return window.__MIRA_APPS;
  }

  async function scanApps() {
    const script = (window.NL_PATH || ".") + "/resources/scripts/scan-apps.ps1";
    await Neutralino.os.execCommand(
      'powershell -NoProfile -ExecutionPolicy Bypass -File "' + script + '"'
    );
  }

  let loadingPromise = null;
  async function loadApps(forceRescan = false) {
    if (loadingPromise) return loadingPromise;
    loadingPromise = (async () => {
      try {
        await loadMeta();
        let apps = null;
        if (!forceRescan) {
          try { apps = await readApps(); } catch (_) { apps = null; }
        }
        if (!apps) {
          window.__MIRA_APPS_STATUS = "skanowanie…";
          notifyReact();
          await scanApps();
          apps = await readApps();
        }
        publish(apps);
        await loadIcons(apps);
        publish(apps);
        window.__MIRA_APPS_STATUS = "ok";
      } catch (e) {
        console.warn("MiraOS: skan aplikacji nie powiódł się", e);
        window.__MIRA_APPS_STATUS = "blad";
      } finally {
        notifyReact();
        loadingPromise = null;
      }
    })();
    return loadingPromise;
  }

  async function launch(app) {
    if (!app) return;
    try {
      if (app.type === "uwp") {
        await Neutralino.os.execCommand("explorer.exe shell:AppsFolder\\" + app.target);
      } else if (app.lnk) {
        await Neutralino.os.execCommand('cmd /c start "" "' + app.lnk + '"');
      } else if (app.target) {
        await Neutralino.os.execCommand('cmd /c start "" "' + app.target + '"');
      }
      usage[app.name] = (usage[app.name] || 0) + 1;
      await saveMeta();
      // przesortuj lokalnie (bez czekania na odświeżenie ikon)
      const decor = window.__MIRA_APPS;
      const raw = decor.map(stripDecor);
      publish(raw);
    } catch (e) {
      console.warn("MiraOS: nie udało się uruchomić", app.name, e);
    }
  }

  window.MiraApps = { loadApps, launch, reload: () => loadApps(true), togglePin, isPinned };

  /* ---------- szklana siatka aplikacji (overlay) ---------- */
  let ctxMenu = null;

  function closeCtx() {
    if (ctxMenu) { ctxMenu.remove(); ctxMenu = null; }
  }

  function openCtx(x, y, app, tile) {
    closeCtx();
    ctxMenu = document.createElement("div");
    ctxMenu.style.cssText = [
      "position:fixed", "z-index:999999",
      "left:" + Math.min(x, window.innerWidth - 230) + "px",
      "top:" + Math.min(y, window.innerHeight - 110) + "px",
      "width:214px", "padding:8px", "border-radius:18px",
      "background:linear-gradient(160deg,rgba(16,18,32,.95),rgba(10,11,20,.97))",
      "backdrop-filter:blur(26px)", "border:1px solid rgba(255,255,255,.14)",
      "box-shadow:0 24px 80px -12px rgba(0,0,0,.8)",
      "font:12.5px/1.5 'Space Grotesk',system-ui,sans-serif", "color:#eef0ff",
    ].join(";");
    const item = (label, fn) => {
      const b = document.createElement("button");
      b.textContent = label;
      b.style.cssText = "display:block;width:100%;text-align:left;padding:9px 12px;border-radius:12px;" +
        "background:none;border:none;color:rgba(238,240,255,.85);font:600 12.5px 'Space Grotesk',sans-serif;cursor:pointer";
      b.onmouseenter = () => (b.style.background = "rgba(255,255,255,.1)");
      b.onmouseleave = () => (b.style.background = "none");
      b.onclick = () => { closeCtx(); fn(); };
      ctxMenu.appendChild(b);
    };
    item("▶  Uruchom", () => window.MiraApps.launch(app));
    item(isPinned(app.name) ? "✕  Odepnij z Rzeki" : "✦  Przypnij do Rzeki", async () => {
      await window.MiraApps.togglePin(app.name);
      renderGrid();
    });
    document.body.appendChild(ctxMenu);
    setTimeout(() => {
      document.addEventListener("click", closeCtx, { once: true });
      document.addEventListener("contextmenu", closeCtx, { once: true });
    }, 10);
  }

  function ensureOverlay() {
    if (document.getElementById("mira-launcher")) return document.getElementById("mira-launcher");
    const wrap = document.createElement("div");
    wrap.id = "mira-launcher";
    wrap.style.cssText = [
      "position:fixed", "inset:0", "z-index:999996", "display:none",
      "background:rgba(5,6,12,.55)", "backdrop-filter:blur(28px) saturate(1.2)",
      "align-items:flex-start", "justify-content:center",
      "font-family:'Space Grotesk',system-ui,sans-serif", "color:#eef0ff",
      "padding-top:9vh",
    ].join(";");
    wrap.innerHTML =
      '<div style="width:min(760px,92vw);max-height:76vh;display:flex;flex-direction:column;' +
      'background:linear-gradient(160deg,rgba(16,18,32,.86),rgba(10,11,20,.92));' +
      'backdrop-filter:blur(34px);border:1px solid rgba(255,255,255,.14);border-radius:30px;' +
      'box-shadow:0 32px 100px -20px rgba(0,0,0,.85),inset 0 1px 0 rgba(255,255,255,.16);overflow:hidden">' +
      '<div style="display:flex;align-items:center;gap:12px;padding:18px 22px 12px">' +
      '<input id="mira-launcher-q" placeholder="Szukaj wśród swoich aplikacji…  (Enter = pierwsza)" autocomplete="off"' +
      ' style="flex:1;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:#eef0ff;' +
      'border-radius:999px;padding:11px 18px;font:14px \'Space Grotesk\',sans-serif;outline:none"/>' +
      '<span id="mira-launcher-count" style="font:11px \'JetBrains Mono\',monospace;color:rgba(238,240,255,.4)"></span>' +
      '<button id="mira-launcher-close" style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);' +
      'color:rgba(238,240,255,.7);border-radius:999px;width:34px;height:34px;cursor:pointer;font-size:14px">✕</button>' +
      "</div>" +
      '<div id="mira-launcher-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(108px,1fr));' +
      'gap:10px;padding:8px 22px 22px;overflow-y:auto"></div></div>';
    document.body.appendChild(wrap);

    wrap.querySelector("#mira-launcher-close").onclick = closeLauncher;
    wrap.addEventListener("click", (e) => { if (e.target === wrap) closeLauncher(); });
    const q = wrap.querySelector("#mira-launcher-q");
    q.addEventListener("input", renderGrid);
    q.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const first = filtered()[0];
        if (first) { closeLauncher(); window.MiraApps.launch(first); }
      }
    });
    window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLauncher(); });
    return wrap;
  }

  function filtered() {
    const wrap = document.getElementById("mira-launcher");
    const q = wrap ? wrap.querySelector("#mira-launcher-q").value.trim().toLowerCase() : "";
    return (window.__MIRA_APPS || []).filter((a) => !q || a.name.toLowerCase().includes(q));
  }

  function tile(a) {
    const el = document.createElement("button");
    el.style.cssText = [
      "display:flex","flex-direction:column","align-items:center","gap:8px",
      "padding:14px 8px 10px","border-radius:20px","cursor:pointer","position:relative",
      "background:rgba(255,255,255,.05)","border:1px solid rgba(255,255,255,.1)",
      "transition:all .18s",
    ].join(";");
    el.onmouseenter = () => { el.style.background = "rgba(255,255,255,.11)"; el.style.transform = "translateY(-2px)"; };
    el.onmouseleave = () => { el.style.background = "rgba(255,255,255,.05)"; el.style.transform = "none"; };

    if (a.pinned) {
      const pin = document.createElement("span");
      pin.textContent = "✦";
      pin.style.cssText = "position:absolute;top:8px;right:10px;font-size:10px;color:#7df9c6";
      el.appendChild(pin);
    }

    const iconWrap = document.createElement("span");
    iconWrap.style.cssText = "width:48px;height:48px;border-radius:15px;display:flex;align-items:center;justify-content:center;" +
      "background:linear-gradient(135deg,rgba(125,249,198,.22),rgba(167,139,250,.22));overflow:hidden";
    if (a.iconDataUrl) {
      const img = document.createElement("img");
      img.src = a.iconDataUrl;
      img.style.cssText = "width:38px;height:38px;object-fit:contain";
      img.draggable = false;
      iconWrap.appendChild(img);
    } else {
      iconWrap.textContent = (a.name || "?").trim().charAt(0).toUpperCase();
      iconWrap.style.cssText += "color:#fff;font:700 20px 'Unbounded',sans-serif";
    }
    const label = document.createElement("span");
    label.textContent = a.name;
    label.style.cssText = "font-size:11px;font-weight:600;color:rgba(238,240,255,.85);text-align:center;" +
      "max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap";
    el.appendChild(iconWrap);
    el.appendChild(label);
    el.onclick = () => { closeLauncher(); window.MiraApps.launch(a); };
    el.oncontextmenu = (e) => { e.preventDefault(); openCtx(e.clientX, e.clientY, a, el); };
    el.title = a.name + (a.pinned ? "  • przypięta" : "");
    return el;
  }

  function renderGrid() {
    const wrap = document.getElementById("mira-launcher");
    if (!wrap) return;
    const q = wrap.querySelector("#mira-launcher-q").value.trim().toLowerCase();
    const grid = wrap.querySelector("#mira-launcher-grid");
    grid.innerHTML = "";
    const apps = filtered();
    wrap.querySelector("#mira-launcher-count").textContent = apps.length + " aplikacji";
    const frag = document.createDocumentFragment();
    for (const a of apps.slice(0, 300)) frag.appendChild(tile(a));
    grid.appendChild(frag);
    if (!apps.length) {
      const empty = document.createElement("div");
      empty.style.cssText = "grid-column:1/-1;text-align:center;color:rgba(238,240,255,.4);padding:36px 0;font-size:13px";
      empty.textContent = window.__MIRA_APPS_STATUS === "skanowanie…"
        ? "Mira liczy Twoje aplikacje… chwilka ✦"
        : "Cisza w Eterze — nie znaleziono aplikacji.";
      grid.appendChild(empty);
    }
  }

  function openLauncher() {
    const wrap = ensureOverlay();
    wrap.style.display = "flex";
    const q = wrap.querySelector("#mira-launcher-q");
    q.value = "";
    renderGrid();
    setTimeout(() => q.focus(), 60);
    loadApps();
  }
  function closeLauncher() {
    const wrap = document.getElementById("mira-launcher");
    if (wrap) wrap.style.display = "none";
  }
  window.MiraOpenLauncher = openLauncher;
  window.addEventListener("mira-open-launcher", openLauncher);

  function boot() {
    if (typeof Neutralino === "undefined" || !Neutralino.os) {
      setTimeout(boot, 40);
      return;
    }
    loadApps();
  }
  boot();
})();
