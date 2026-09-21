/* ============================================================
 * MiraOS — warstwa natywna (Windows) v1.3
 *  • Kiosk: pełny ekran + ukryty pasek zadań; F11 / Ctrl+Alt+Q
 *  • Zasilanie: uśpij / restart / wyłącz (z potwierdzeniem)
 *  • Telemetria: bateria + WiFi → Horyzont (co 30 s)
 *  • Głośność systemowa: MiraSetVolume(0..100)
 *  • Dźwięki Miry: MiraSound.unlock() / .ping() (synteza WebAudio)
 *  • Auto-blokada po bezczynności (opcja w panelu ✦)
 *  • Aplikacje: autostart, motyw, tapeta, szkło DWM, panel ✦
 * ============================================================ */
(function () {
  "use strict";

  function start() {
    if (typeof Neutralino === "undefined" || !Neutralino.init) {
      setTimeout(start, 30);
      return;
    }
    Neutralino.init();
    if (window.NL_MODE !== "window") return;

    const SCRIPTS = "/resources/scripts/";
    const STORE_KEY = "miraos-win-integration";

    const state = {
      autostart: true,
      themeApplied: false,
      rounded: true,
      kiosk: true,
      taskbarHidden: true,
      idleLock: false,
      firstRun: false,
    };

    /* ---------- trwałość ---------- */
    async function loadState() {
      try {
        const data = await Neutralino.storage.getData(STORE_KEY);
        Object.assign(state, JSON.parse(data));
      } catch (_) {
        state.firstRun = true;
      }
    }
    async function saveState() {
      try {
        await Neutralino.storage.setData(STORE_KEY, JSON.stringify(state));
      } catch (e) {
        console.warn("MiraOS: zapis ustawień nie powiódł się", e);
      }
    }

    /* ---------- skrypty ---------- */
    async function runScript(name) {
      try {
        await Neutralino.os.execCommand('"' + (window.NL_PATH || ".") + SCRIPTS + name + '"');
        return true;
      } catch (e) {
        console.warn("MiraOS: skrypt nie powiódł się:", name, e);
        return false;
      }
    }

    /* ---------- toast w stylu Ech ---------- */
    function miraToast(title, body) {
      const t = document.createElement("div");
      t.style.cssText = [
        "position:fixed", "right:20px", "bottom:84px", "z-index:999998",
        "max-width:340px", "padding:14px 18px", "border-radius:18px",
        "background:linear-gradient(160deg,rgba(16,18,32,.92),rgba(10,11,20,.96))",
        "backdrop-filter:blur(24px)", "border:1px solid rgba(255,255,255,.14)",
        "box-shadow:0 24px 80px -12px rgba(0,0,0,.7)",
        "color:#eef0ff", "font:13px/1.5 'Space Grotesk',system-ui,sans-serif",
        "transform:translateY(16px)", "opacity:0",
        "transition:all .5s cubic-bezier(.2,.9,.3,1)", "pointer-events:none",
      ].join(";");
      t.innerHTML =
        '<div style="font-weight:600;margin-bottom:3px">' +
        '<span style="color:#7df9c6">✦ </span>' + title + "</div>" +
        '<div style="color:rgba(238,240,255,.55);font-size:12px">' + body + "</div>";
      document.body.appendChild(t);
      requestAnimationFrame(() => {
        t.style.transform = "translateY(0)";
        t.style.opacity = "1";
      });
      setTimeout(() => {
        t.style.opacity = "0";
        t.style.transform = "translateY(16px)";
        setTimeout(() => t.remove(), 600);
      }, 6500);
    }

    /* ---------- pełny ekran ---------- */
    let fullscreen = false;
    async function setFs(on) {
      try {
        if (on) { await Neutralino.window.setFullScreen(); fullscreen = true; }
        else { await Neutralino.window.exitFullScreen(); fullscreen = false; }
      } catch (_) { fullscreen = false; }
    }
    window.MiraFullscreen = () => setFs(!fullscreen);

    /* ---------- pasek zadań ---------- */
    async function taskbar(show) {
      await runScript(show ? "taskbar-show.bat" : "taskbar-hide.bat");
    }

    /* ---------- dźwięki Miry (synteza, zero plików) ---------- */
    const MiraSound = (function () {
      let ctx = null;
      let master = null;
      let vol = 0.7;
      function ensure() {
        try {
          if (!ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return null;
            ctx = new AC();
            master = ctx.createGain();
            master.gain.value = 0.22 * vol;
            master.connect(ctx.destination);
          }
          if (ctx.state === "suspended") ctx.resume();
          return ctx;
        } catch (_) { return null; }
      }
      function tone(freq, t0, dur, type, gain) {
        const c = ensure();
        if (!c) return;
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = type || "sine";
        o.frequency.value = freq;
        const t = c.currentTime + t0;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(gain || 0.5, t + 0.04);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(master);
        o.start(t); o.stop(t + dur + 0.05);
      }
      return {
        setVolume(v) {
          vol = Math.max(0, Math.min(1, v));
          if (master) master.gain.value = 0.22 * vol;
        },
        unlock() { // miękki akord obudzenia
          tone(392, 0, 1.6, "sine", 0.5);
          tone(523.25, 0.09, 1.6, "sine", 0.4);
          tone(659.25, 0.18, 1.8, "triangle", 0.22);
          tone(783.99, 0.3, 1.8, "sine", 0.14);
        },
        ping() { // cichy znak powiadomienia
          tone(880, 0, 0.5, "sine", 0.28);
          tone(1318.5, 0.07, 0.4, "sine", 0.1);
        },
        close() { // zamknięcie
          tone(659.25, 0, 0.7, "sine", 0.3);
          tone(523.25, 0.1, 0.8, "sine", 0.25);
          tone(392, 0.22, 1.1, "triangle", 0.18);
        },
      };
    })();
    window.MiraSound = MiraSound;

    /* ---------- głośność systemowa ---------- */
    let volTimer = null;
    window.MiraSetVolume = function (percent) {
      const p = Math.max(0, Math.min(100, Math.round(percent)));
      clearTimeout(volTimer);
      volTimer = setTimeout(async () => {
        try {
          await Neutralino.os.execCommand(
            'powershell -NoProfile -ExecutionPolicy Bypass -File "' +
            (window.NL_PATH || ".") + SCRIPTS + 'set-volume.ps1" -Percent ' + p
          );
        } catch (_) {}
      }, 250);
    };

    /* ---------- telemetria: bateria + wifi ---------- */
    async function pollSystem() {
      try {
        const r = await Neutralino.os.execCommand(
          'powershell -NoProfile -ExecutionPolicy Bypass -File "' +
          (window.NL_PATH || ".") + SCRIPTS + 'get-system.ps1"'
        );
        const out = (r.stdout || "").trim();
        if (out) {
          const j = JSON.parse(out);
          window.MiraSysInfo = { battery: j.battery, charging: !!j.charging, ssid: j.ssid || null };
          window.dispatchEvent(new Event("mira-sysinfo"));
        }
      } catch (_) {}
    }
    setInterval(pollSystem, 30000);

    /* ---------- zasilanie ---------- */
    function powerConfirm(action) {
      const info = {
        sleep:    { t: "Uśpić komputer",    d: "Mira zaśnie razem z Windows.",        cmd: null },
        restart:  { t: "Uruchomić ponownie",d: "Windows zrestartuje się za chwilę.",  cmd: "shutdown /r /t 0" },
        shutdown: { t: "Wyłączyć komputer", d: "Windows zamknie się całkowicie.",     cmd: "shutdown /s /t 0" },
      }[action];
      if (!info) return;
      if (document.getElementById("mira-power")) return;
      const wrap = document.createElement("div");
      wrap.id = "mira-power";
      wrap.style.cssText = [
        "position:fixed", "inset:0", "z-index:999999",
        "background:rgba(4,5,10,.8)", "backdrop-filter:blur(26px)",
        "display:flex", "align-items:center", "justify-content:center",
        "font-family:'Space Grotesk',system-ui,sans-serif", "color:#eef0ff",
      ].join(";");
      wrap.innerHTML =
        '<div style="text-align:center;max-width:340px">' +
        '<div style="font-size:34px;margin-bottom:12px">◉</div>' +
        '<div style="font-weight:700;font-size:17px;margin-bottom:8px">' + info.t + "?</div>" +
        '<div style="color:rgba(238,240,255,.55);font-size:13px;margin-bottom:26px">' + info.d + "</div>" +
        '<div style="display:flex;gap:12px;justify-content:center">' +
        '<button id="mira-power-yes" style="padding:11px 26px;border-radius:999px;border:1px solid rgba(125,249,198,.4);background:rgba(125,249,198,.14);color:#7df9c6;font-weight:600;font-size:13px;cursor:pointer">Tak, wykonaj</button>' +
        '<button id="mira-power-no" style="padding:11px 26px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:rgba(238,240,255,.75);font-weight:600;font-size:13px;cursor:pointer">Anuluj</button>' +
        "</div></div>";
      document.body.appendChild(wrap);
      wrap.querySelector("#mira-power-no").onclick = () => wrap.remove();
      wrap.onclick = (e) => { if (e.target === wrap) wrap.remove(); };
      wrap.querySelector("#mira-power-yes").onclick = async () => {
        wrap.style.opacity = "0";
        wrap.style.transition = "opacity .3s";
        MiraSound.close();
        if (action === "sleep") {
          await runScript("power-sleep.ps1".replace(".ps1", ".ps1")); // ps1 bezposrednio nizej
        }
        try {
          if (info.cmd) {
            await Neutralino.os.execCommand(info.cmd);
          } else if (action === "sleep") {
            await Neutralino.os.execCommand(
              'powershell -NoProfile -ExecutionPolicy Bypass -File "' +
              (window.NL_PATH || ".") + SCRIPTS + 'power-sleep.ps1"'
            );
          }
        } catch (_) {}
        setTimeout(() => wrap.remove(), 350);
      };
    }
    window.MiraPower = powerConfirm;

    /* ---------- ekran wyjścia ---------- */
    function showExitScreen() {
      if (document.getElementById("mira-exit")) return;
      const wrap = document.createElement("div");
      wrap.id = "mira-exit";
      wrap.style.cssText = [
        "position:fixed", "inset:0", "z-index:999999",
        "background:rgba(4,5,10,.82)", "backdrop-filter:blur(30px)",
        "display:flex", "align-items:center", "justify-content:center",
        "font-family:'Space Grotesk',system-ui,sans-serif", "color:#eef0ff",
      ].join(";");
      wrap.innerHTML =
        '<div style="text-align:center">' +
        '<div style="width:74px;height:74px;margin:0 auto 22px;border-radius:50%;' +
        'background:radial-gradient(circle at 32% 28%,rgba(255,255,255,.9),rgba(255,255,255,.15) 22%,transparent 45%),' +
        "radial-gradient(circle,#7df9c6,#ff9ed2 55%,#a78bfa);box-shadow:0 0 60px rgba(125,249,198,.5)" +
        '"></div>' +
        '<div style="font-family:\'Unbounded\',sans-serif;font-weight:800;letter-spacing:.25em;font-size:26px;margin-bottom:10px">MiraOS</div>' +
        '<div style="color:rgba(238,240,255,.55);font-size:13.5px;margin-bottom:30px">Kończysz pracę w nurcie Mira. Pasek zadań wróci na swoje miejsce.</div>' +
        '<div style="display:flex;gap:12px;justify-content:center">' +
        '<button id="mira-exit-yes" style="padding:11px 26px;border-radius:999px;border:1px solid rgba(125,249,198,.4);background:rgba(125,249,198,.14);color:#7df9c6;font-weight:600;font-size:13px;cursor:pointer">Wyjdź z MiraOS</button>' +
        '<button id="mira-exit-no" style="padding:11px 26px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:rgba(238,240,255,.75);font-weight:600;font-size:13px;cursor:pointer">Zostań</button>' +
        "</div>" +
        '<div style="margin-top:26px;display:flex;gap:18px;justify-content:center">' +
        '<button data-p="sleep" style="background:none;border:none;color:rgba(238,240,255,.4);font:12px \'Space Grotesk\',sans-serif;cursor:pointer;border-bottom:1px dashed rgba(255,255,255,.2);padding-bottom:2px">☾ uśpij</button>' +
        '<button data-p="restart" style="background:none;border:none;color:rgba(238,240,255,.4);font:12px \'Space Grotesk\',sans-serif;cursor:pointer;border-bottom:1px dashed rgba(255,255,255,.2);padding-bottom:2px">↻ restart</button>' +
        '<button data-p="shutdown" style="background:none;border:none;color:rgba(238,240,255,.4);font:12px \'Space Grotesk\',sans-serif;cursor:pointer;border-bottom:1px dashed rgba(255,255,255,.2);padding-bottom:2px">⏻ wyłącz</button>' +
        "</div></div>";
      document.body.appendChild(wrap);
      wrap.querySelectorAll("[data-p]").forEach((b) => {
        b.onclick = () => { wrap.remove(); powerConfirm(b.getAttribute("data-p")); };
      });
      wrap.querySelector("#mira-exit-yes").onclick = async () => {
        wrap.style.opacity = "0";
        wrap.style.transition = "opacity .4s";
        MiraSound.close();
        await taskbar(true);
        setTimeout(async () => {
          try { await Neutralino.app.exit(); } catch (_) { window.close(); }
        }, 380);
      };
      wrap.querySelector("#mira-exit-no").onclick = () => wrap.remove();
      wrap.onclick = (e) => { if (e.target === wrap) wrap.remove(); };
    }
    window.MiraExit = showExitScreen;

    /* ---------- auto-blokada ---------- */
    let idleLast = Date.now();
    ["pointermove", "pointerdown", "keydown", "wheel"].forEach((ev) =>
      window.addEventListener(ev, () => { idleLast = Date.now(); }, { passive: true })
    );
    setInterval(() => {
      if (!state.idleLock) return;
      if (document.hidden) return;
      if (Date.now() - idleLast > 10 * 60 * 1000) {
        idleLast = Date.now();
        window.dispatchEvent(new Event("mira-lock"));
      }
    }, 30000);

    /* ---------- karta „System MiraOS" ---------- */
    function buildPanel() {
      const fab = document.createElement("div");
      fab.id = "mira-fab";
      fab.style.cssText = [
        "position:fixed", "right:16px", "bottom:16px", "z-index:999997",
        "width:42px", "height:42px", "border-radius:50%",
        "background:linear-gradient(160deg,rgba(16,18,32,.9),rgba(10,11,20,.95))",
        "backdrop-filter:blur(18px)", "border:1px solid rgba(255,255,255,.12)",
        "display:flex", "align-items:center", "justify-content:center",
        "cursor:pointer", "font-size:16px", "color:rgba(238,240,255,.7)",
        "box-shadow:0 10px 30px -8px rgba(0,0,0,.6)",
        "transition:all .25s", "user-select:none",
      ].join(";");
      fab.textContent = "✦";
      fab.title = "System MiraOS";
      fab.onmouseenter = () => (fab.style.transform = "scale(1.1)");
      fab.onmouseleave = () => (fab.style.transform = "scale(1)");

      const card = document.createElement("div");
      card.id = "mira-fab-card";
      card.style.cssText = [
        "position:fixed", "right:16px", "bottom:66px", "z-index:999997",
        "width:304px", "max-height:74vh", "overflow-y:auto",
        "padding:18px", "border-radius:22px", "display:none",
        "background:linear-gradient(160deg,rgba(16,18,32,.94),rgba(10,11,20,.97))",
        "backdrop-filter:blur(28px)", "border:1px solid rgba(255,255,255,.13)",
        "box-shadow:0 24px 80px -12px rgba(0,0,0,.75)",
        "color:#eef0ff", "font:12.5px/1.55 'Space Grotesk',system-ui,sans-serif",
      ].join(";");

      const row = (label, btnId, btnText, on) =>
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 0">' +
        '<div style="color:rgba(238,240,255,.8)">' + label + "</div>" +
        '<button id="' + btnId + '" style="padding:6px 14px;border-radius:999px;border:1px solid ' +
        (on ? "rgba(125,249,198,.45);background:rgba(125,249,198,.14);color:#7df9c6" : "rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:rgba(238,240,255,.75)") +
        ';font-weight:600;font-size:11.5px;cursor:pointer;white-space:nowrap">' + btnText + "</button></div>";

      card.innerHTML =
        '<div style="font-family:\'Unbounded\',sans-serif;font-weight:700;font-size:12px;letter-spacing:.12em;margin-bottom:2px">SYSTEM MIRAOS</div>' +
        '<div style="color:rgba(238,240,255,.4);font-size:11px;margin-bottom:10px">MiraOS 1.3 • Windows x64 • natywnie</div>' +
        row("Autostart z Windows", "mira-autostart", state.autostart ? "włączony" : "wyłączony", state.autostart) +
        row("Motyw Mira dla Windows", "mira-theme", state.themeApplied ? "zastosuj ponownie" : "zastosuj", false) +
        row("Tapeta MiraOS", "mira-wall", "ustaw", false) +
        row("Szkło: zaokrąglone okna", "mira-round", state.rounded ? "włączone" : "wyłączone", state.rounded) +
        row("Pełny ekran przy starcie", "mira-kiosk", state.kiosk ? "włączony" : "wyłączony", state.kiosk) +
        row("Pasek zadań Windows", "mira-taskbar", state.taskbarHidden ? "ukryty" : "widoczny", state.taskbarHidden) +
        row("Blokada po 10 min bezczynności", "mira-idle", state.idleLock ? "włączona" : "wyłączona", state.idleLock) +
        row("Twoje aplikacje w Mirze", "mira-apps", "odśwież", false) +
        row("Przywróć domyślne", "mira-restore", "przywróć", false) +
        '<div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.08);color:rgba(238,240,255,.4);font-size:11px">' +
        "F11 — pełny ekran • Ctrl+Alt+Q — wyjście • / — szukaj</div>";

      document.body.appendChild(fab);
      document.body.appendChild(card);

      fab.onclick = () => {
        card.style.display = card.style.display === "block" ? "none" : "block";
      };

      const toggleBtn = (id, on) => {
        const b = card.querySelector(id);
        b.style.border = "1px solid " + (on ? "rgba(125,249,198,.45)" : "rgba(255,255,255,.16)");
        b.style.color = on ? "#7df9c6" : "rgba(238,240,255,.75)";
        b.style.background = on ? "rgba(125,249,198,.14)" : "rgba(255,255,255,.06)";
      };

      card.querySelector("#mira-autostart").onclick = async () => {
        state.autostart = !state.autostart;
        await saveState();
        await runScript(state.autostart ? "autostart-on.bat" : "autostart-off.bat");
        miraToast(
          state.autostart ? "MiraOS będzie witać Cię codziennie" : "Autostart wyłączony",
          state.autostart ? "Mira obudzi się razem z Windows." : "Mira zasnęła wśród procesów. Dobranoc."
        );
        card.querySelector("#mira-autostart").textContent = state.autostart ? "włączony" : "wyłączony";
        toggleBtn("#mira-autostart", state.autostart);
      };

      card.querySelector("#mira-theme").onclick = async () => {
        await runScript("apply-miraos-theme.bat");
        state.themeApplied = true;
        await saveState();
        miraToast("Motyw Mira zastosowany", "Ciemny motyw + akcent zorzy. Pełnia kolorów po ponownym logowaniu.");
        card.querySelector("#mira-theme").textContent = "zastosuj ponownie";
      };

      card.querySelector("#mira-wall").onclick = async () => {
        await runScript("set-wallpaper.bat");
        miraToast("Tapeta MiraOS ustawiona", "Twoje tło pochłonęła zorza nad fiordem ciszy.");
      };

      card.querySelector("#mira-round").onclick = async () => {
        state.rounded = !state.rounded;
        await saveState();
        await runScript(state.rounded ? "round-on.bat" : "round-off.bat");
        miraToast(
          state.rounded ? "Szkło aktywne" : "Szkło wyłączone",
          state.rounded ? "Nowe okna dostają zaokrąglenie i mintową obwódkę." : "Okna wracają do standardowych kształtów Windows."
        );
        card.querySelector("#mira-round").textContent = state.rounded ? "włączone" : "wyłączone";
        toggleBtn("#mira-round", state.rounded);
      };

      card.querySelector("#mira-kiosk").onclick = async () => {
        state.kiosk = !state.kiosk;
        await saveState();
        await setFs(state.kiosk);
        miraToast(state.kiosk ? "Tryb kiosk" : "Tryb okna",
          state.kiosk ? "MiraOS zawsze startuje na całym ekranie." : "MiraOS startuje jako zwykłe okno (F11 przywraca pełny ekran).");
        card.querySelector("#mira-kiosk").textContent = state.kiosk ? "włączony" : "wyłączony";
        toggleBtn("#mira-kiosk", state.kiosk);
      };

      card.querySelector("#mira-taskbar").onclick = async () => {
        state.taskbarHidden = !state.taskbarHidden;
        await saveState();
        await taskbar(!state.taskbarHidden);
        miraToast(state.taskbarHidden ? "Pasek zadań ukryty" : "Pasek zadań widoczny",
          state.taskbarHidden ? "Windows prawie zniknął. Pasek wróci po wyjściu z Miry." : "Pasek zadań wrócił na dolną krawędź.");
        card.querySelector("#mira-taskbar").textContent = state.taskbarHidden ? "ukryty" : "widoczny";
        toggleBtn("#mira-taskbar", state.taskbarHidden);
      };

      card.querySelector("#mira-idle").onclick = async () => {
        state.idleLock = !state.idleLock;
        await saveState();
        miraToast(state.idleLock ? "Auto-blokada włączona" : "Auto-blokada wyłączona",
          state.idleLock ? "Po 10 minutach ciszy Mira zaśnie." : "Mira będzie czuwać bez końca.");
        card.querySelector("#mira-idle").textContent = state.idleLock ? "włączona" : "wyłączona";
        toggleBtn("#mira-idle", state.idleLock);
      };

      card.querySelector("#mira-apps").onclick = async () => {
        miraToast("Mira rozgląda się po komputerze", "Skanuję Menu Start i wyłapuję ikonki Twoich aplikacji…");
        try { await (window.MiraApps && window.MiraApps.reload()); } catch (_) {}
        miraToast("Gotowe ✦", "Twoje aplikacje są już w Jądrze i pod klawiszem /.");
      };

      card.querySelector("#mira-restore").onclick = async () => {
        await runScript("restore-defaults.bat");
        await runScript("round-off.bat");
        await taskbar(true);
        state.rounded = false;
        state.taskbarHidden = false;
        state.themeApplied = false;
        await saveState();
        miraToast("Windows wrócił do siebie", "Akcent, autostart i pasek zadań przywrócone. Tapetę zmienisz w Ustawieniach.");
        card.querySelector("#mira-round").textContent = "wyłączone";
        toggleBtn("#mira-round", false);
        card.querySelector("#mira-taskbar").textContent = "widoczny";
        toggleBtn("#mira-taskbar", false);
        card.querySelector("#mira-theme").textContent = "zastosuj";
      };
    }

    /* ---------- znak wodny ---------- */
    function buildWatermark() {
      const w = document.createElement("div");
      w.style.cssText = [
        "position:fixed", "left:14px", "bottom:14px", "z-index:999990",
        "font:10px 'JetBrains Mono',monospace", "color:rgba(238,240,255,.28)",
        "letter-spacing:.14em", "pointer-events:none", "user-select:none",
      ].join(";");
      w.textContent = "MiraOS 1.3 • NATIVE/WIN64";
      document.body.appendChild(w);
    }

    /* ---------- start ---------- */
    Neutralino.events.on("ready", async () => {
      await loadState();

      // samonaprawa: najpierw pokaż pasek (gdyby poprzednia sesja go zostawiła)
      await taskbar(true);

      if (state.firstRun) {
        await saveState();
        await runScript("autostart-on.bat");
        await runScript("apply-miraos-theme.bat");
        await runScript("set-wallpaper.bat");
        await runScript("round-on.bat");
        state.autostart = true;
        state.themeApplied = true;
        state.rounded = true;
        await saveState();
        setTimeout(() => miraToast(
          "Mira przejęła stery",
          "Motyw, tapeta, szkło i autostart ustawione. Panel ✦ (prawy dolny róg) pozwala to cofnąć."
        ), 2600);
      }

      // kiosk: pełny ekran + ukryty pasek, potem pokaż okno (bez mignięcia ramką)
      await setFs(state.kiosk);
      if (state.taskbarHidden) await taskbar(false);
      try { await Neutralino.window.show(); } catch (_) {}
      setTimeout(async () => { try { await Neutralino.window.show(); } catch (_) {} }, 3000);

      pollSystem();
      buildPanel();
      buildWatermark();
    });

    /* ---------- skróty ---------- */
    window.addEventListener("keydown", (e) => {
      if (e.key === "F11") { e.preventDefault(); window.MiraFullscreen(); }
      if (e.ctrlKey && e.altKey && (e.key === "q" || e.key === "Q")) { e.preventDefault(); showExitScreen(); }
    });
    window.addEventListener("beforeunload", () => { taskbar(true); });
  }

  start();
})();
