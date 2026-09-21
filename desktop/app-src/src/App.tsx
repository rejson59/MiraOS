import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { ACCENTS, uid, teraz, type AppId, type GardenId, type Okno, type Echo } from "./os/registry";
import { Tlo, Horyzont, Jadro, Rzeka, Echa, Szukaj, Panel, Okno as OknoW, Boot, Blokada, MenuKontekst } from "./components/osChrome";

type Faza = "boot" | "blokada" | "os";

export default function App() {
  const [faza, setFaza] = useState<Faza>("boot");
  const [postep, setPostep] = useState(0);

  // --- stan systemu ---
  const [okna, setOkna] = useState<Okno[]>([]);
  const [aktywne, setAktywne] = useState<string | null>(null);
  const [licznikZ, setLicznikZ] = useState(10);
  const [ogrod, setOgrod] = useState<GardenId>("skupienie");

  const [accent, setAccent] = useState(0);
  const [tapeta, setTapeta] = useState(0);
  const [poswiata] = useState(0.7);
  const [ziarno] = useState(0.5);
  const [jasnosc, setJasnosc] = useState(0.92);
  const [glos, setGlos] = useState(0.7);
  const [wifi, setWifi] = useState(true);
  const [skupienie, setSkupienie] = useState(false);

  const [jadroOtwarte, setJadroOtwarte] = useState(false);
  const [szukajOtwarte, setSzukajOtwarte] = useState(false);
  const [panelOtwarte, setPanelOtwarte] = useState(false);
  const [, setPrzegladOtwarte] = useState(false);
  const [echa, setEcha] = useState<Echo[]>([]);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [podpowiedz, setPodpowiedz] = useState(true);

  // --- boot ---
  useEffect(() => {
    if (faza !== "boot") return;
    const iv = setInterval(() => {
      setPostep((p) => {
        const n = p + Math.random() * 9 + 3;
        if (n >= 100) { clearInterval(iv); setTimeout(() => setFaza("blokada"), 450); return 100; }
        return n;
      });
    }, 160);
    return () => clearInterval(iv);
  }, [faza]);

  // --- akcenty jako zmienne CSS ---
  useEffect(() => {
    const a = ACCENTS[accent];
    const r = document.documentElement;
    r.style.setProperty("--accent", a.c1);
    r.style.setProperty("--accent-2", a.c2);
    r.style.setProperty("--accent-3", a.c3);
    r.style.setProperty("--glow", String(poswiata));
    r.style.setProperty("--grain", String(ziarno));
  }, [accent, poswiata, ziarno]);

  // --- zapamiętywanie wyglądu Miry (trwałe) ---
  useEffect(() => {
    (async () => {
      try {
        const nl = (window as any).Neutralino;
        if (!nl?.storage) return;
        const d = await nl.storage.getData("miraos-ui");
        const j = JSON.parse(d);
        if (typeof j.accent === "number") setAccent(j.accent % ACCENTS.length);
        if (typeof j.wallpaper === "number") setTapeta(j.wallpaper % 4);
        if (typeof j.jasnosc === "number") setJasnosc(Math.min(1, Math.max(0.2, j.jasnosc)));
      } catch (_) {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const nl = (window as any).Neutralino;
        nl?.storage?.setData?.("miraos-ui", JSON.stringify({ accent, wallpaper: tapeta, jasnosc }));
      } catch (_) {}
    }, 500);
    return () => clearTimeout(t);
  }, [accent, tapeta, jasnosc]);

  const powiadom = useCallback((title: string, body: string, icon = "✦") => {
    if (skupienie && title !== "Skupienie") return;
    setEcha((p) => [...p.slice(-5), { id: uid("echo"), title, body, icon, time: teraz() }]);
    try { (window as any).MiraSound?.ping(); } catch (_) {}
  }, [skupienie]);

  // powitalne echa
  useEffect(() => {
    if (faza !== "os") return;
    const t1 = setTimeout(() => powiadom("MiraOS przejął pulpit", "Dotknij Jądra pośrodku — zobaczysz swoje aplikacje.", "✦"), 1400);
    const t2 = setTimeout(() => powiadom("Twoje programy czekają", "Naciśnij / i wpisz np. Chrome albo Spotify.", "〜"), 6000);
    const t3 = setTimeout(() => powiadom("Szkło aktywne", "Okna Windows dostają mintową obwódkę i zaokrąglenie.", "❄"), 15000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [faza, powiadom]);

  // auto-znikanie ech
  useEffect(() => {
    if (!echa.length) return;
    const iv = setTimeout(() => setEcha((p) => p.slice(1)), 7000);
    return () => clearTimeout(iv);
  }, [echa]);

  // --- okna ---
  const otworz = useCallback((appId: AppId) => {
    setOkna((prev) => {
      const istnieje = prev.find((o) => o.appId === appId && o.garden === ogrod);
      if (istnieje) {
        setAktywne(istnieje.id);
        setLicznikZ((z) => z + 1);
        return prev.map((o) => (o.id === istnieje.id ? { ...o, minimized: false, z: licznikZ + 1 } : o));
      }
      const kaskada = (prev.length % 5) * 36;
      const W = Math.min(860, window.innerWidth - 32);
      const H = Math.min(600, window.innerHeight - 180);
      const id = uid("okno");
      const nowe: Okno = {
        id, appId,
        x: Math.max(12, (window.innerWidth - W) / 2 + kaskada - 60),
        y: Math.max(70, (window.innerHeight - H) / 2 + kaskada - 40),
        w: appId === "szept" ? Math.min(620, W) : W,
        h: appId === "szept" ? Math.min(520, H) : H,
        z: licznikZ + 1, minimized: false, maximized: window.innerWidth < 720, garden: ogrod,
      };
      setAktywne(id);
      setLicznikZ((z) => z + 1);
      return [...prev, nowe];
    });
    setJadroOtwarte(false);
    setSzukajOtwarte(false);
    setPrzegladOtwarte(false);
  }, [ogrod, licznikZ]);

  const fokus = useCallback((id: string) => {
    setLicznikZ((z) => {
      setOkna((prev) => prev.map((o) => (o.id === id ? { ...o, minimized: false, z: z + 1 } : o)));
      return z + 1;
    });
    setAktywne(id);
  }, []);

  const zamknij = useCallback((id: string) => {
    setOkna((prev) => prev.filter((o) => o.id !== id));
    setAktywne((a) => (a === id ? null : a));
  }, []);

  const uspij = useCallback((id: string) => {
    setOkna((prev) => prev.map((o) => (o.id === id ? { ...o, minimized: true } : o)));
  }, []);

  const maxymalizuj = useCallback((id: string) => {
    setOkna((prev) => prev.map((o) => (o.id === id ? { ...o, maximized: !o.maximized } : o)));
    setAktywne(id);
  }, []);

  // --- auto-blokada z warstwy natywnej ---
  useEffect(() => {
    const h = () => setFaza("blokada");
    window.addEventListener("mira-lock", h);
    return () => window.removeEventListener("mira-lock", h);
  }, []);

  // --- klawiatura ---
  useEffect(() => {
    if (faza !== "os") return;
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const pisze = tag === "INPUT" || tag === "TEXTAREA";
      if (e.key === "/" && !pisze) { e.preventDefault(); setSzukajOtwarte(true); }
      if (e.key === "Escape") { setSzukajOtwarte(false); setPanelOtwarte(false); setPrzegladOtwarte(false); setMenu(null); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSzukajOtwarte((v) => !v); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [faza]);

  const akcjaSzukaj = (id: string) => {
    setSzukajOtwarte(false);
    if (id === "aplikacje") window.dispatchEvent(new Event("mira-open-launcher"));
    if (id === "fullscreen") (window as any).MiraFullscreen?.();
    if (id === "zorzowy") { setTapeta((t) => (t + 1) % 4); powiadom("Nowy krajobraz", "Mira przebrała niebo. Spójrz w górę.", "✦"); }
    if (id === "wyjscie") (window as any).MiraExit?.();
    if (id === "blokada") setFaza("blokada");
    if (id === "uspijpc") (window as any).MiraPower?.("sleep");
    if (id === "restart") (window as any).MiraPower?.("restart");
    if (id === "wylacz") (window as any).MiraPower?.("shutdown");
  };

  const akcjaMenu = (id: string) => {
    setMenu(null);
    if (id === "jadro") setJadroOtwarte(true);
    if (id === "szukaj") setSzukajOtwarte(true);
    if (id === "aplikacje") window.dispatchEvent(new Event("mira-open-launcher"));
    if (id === "zorza") { setTapeta((t) => (t + 1) % 4); powiadom("Krajobraz", "Niebo zmieniło odcień.", "〜"); }
    if (id === "fullscreen") (window as any).MiraFullscreen?.();
    if (id === "wyjscie") (window as any).MiraExit?.();
  };

  const widoczne = useMemo(() => okna.filter((o) => o.garden === ogrod && !o.minimized), [okna, ogrod]);
  const jadroUkryte = widoczne.length > 0;

  const trescAplikacji = (_appId: AppId) => null;

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#07080f]"
      onContextMenu={(e) => { if (faza === "os") { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY }); } }}
      onDoubleClick={(e) => { if (faza !== "os") return; if ((e.target as HTMLElement).closest(".os-window, button")) return; setJadroOtwarte(true); }}>
      <Tlo wallpaper={tapeta} jasnosc={jasnosc}>
        {/* wskazówka pierwszego oddechu */}
        {faza === "os" && (
          <>
            <Horyzont garden={ogrod} setGarden={setOgrod} wifi={wifi} skupienie={skupienie} glos={glos}
              onSzukaj={() => setSzukajOtwarte(true)} onPanel={() => setPanelOtwarte(true)} onPrzeglad={() => window.dispatchEvent(new Event("mira-open-launcher"))} />

            <Jadro otwarte={jadroOtwarte} setOtwarte={setJadroOtwarte} onOpen={otworz} onSzukaj={() => setSzukajOtwarte(true)} ukryte={jadroUkryte} />

            {/* okna */}
            <AnimatePresence>
              {widoczne.map((o) => (
                <OknoW key={o.id} okno={o} aktywne={aktywne === o.id}
                  onFocus={() => fokus(o.id)} onZamknij={() => zamknij(o.id)}
                  onUspij={() => uspij(o.id)} onMax={() => maxymalizuj(o.id)}
                  onPrzenies={(x, y) => setOkna((p) => p.map((w) => (w.id === o.id ? { ...w, x, y } : w)))}
                  onRozmiar={(w, h) => setOkna((p) => p.map((w2) => (w2.id === o.id ? { ...w2, w, h } : w2)))}
                  dzieci={trescAplikacji(o.appId)} />
              ))}
            </AnimatePresence>

            {/* podpowiedź */}
            <AnimatePresence>
              {podpowiedz && okna.length === 0 && !jadroOtwarte && (
                <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ delay: 1 }}
                  onClick={() => { setJadroOtwarte(true); setPodpowiedz(false); }}
                  className="absolute bottom-28 left-1/2 -translate-x-1/2 z-[30] glass rounded-full pl-4 pr-2 py-2 flex items-center gap-3 text-[12.5px] hover:bg-white/[0.12]">
                  <Sparkles size={15} className="text-[var(--accent)]" />
                  <span className="text-white/70">Zacznij od <b className="text-white">Jądra</b> — tam mieszka cała Mira</span>
                  <span className="rounded-full px-2.5 py-1 text-black text-[11px] font-bold" style={{ background: "linear-gradient(120deg, var(--accent), var(--accent-2))" }}>pokaż</span>
                  <span onClick={(e) => { e.stopPropagation(); setPodpowiedz(false); }} className="p-1.5 rounded-full hover:bg-white/15 text-white/40"><X size={13} /></span>
                </motion.button>
              )}
            </AnimatePresence>

            <Rzeka okna={okna} aktywne={aktywne} garden={ogrod} setGarden={setOgrod}
              onFocus={fokus} onJadro={() => setJadroOtwarte((v) => !v)} jadroOtwarte={jadroOtwarte}
              onPrzeglad={() => window.dispatchEvent(new Event("mira-open-launcher"))} onSzukaj={() => setSzukajOtwarte(true)} zminimalizowane={okna.filter((o) => o.minimized).length} />

            <Echa echa={echa} onZamknij={(id) => setEcha((p) => p.filter((e) => e.id !== id))} />

            <Szukaj otwarte={szukajOtwarte} onZamknij={() => setSzukajOtwarte(false)} onOpen={otworz} onAkcja={akcjaSzukaj} />

            <Panel otwarte={panelOtwarte} onZamknij={() => setPanelOtwarte(false)}
              wifi={wifi} setWifi={setWifi} skupienie={skupienie} setSkupienie={(v) => { setSkupienie(v); if (v) powiadom("Skupienie", "Echa zasnęły. Zostałaś tylko Ty i nurt."); }}
              glos={glos} setGlos={setGlos} jasnosc={jasnosc} setJasnosc={setJasnosc}
              accent={accent} setAccent={setAccent} wallpaper={tapeta} setWallpaper={setTapeta}
              onLab={() => { setPanelOtwarte(false); window.dispatchEvent(new Event("mira-open-launcher")); }} onSen={() => setFaza("blokada")} />

            {menu && <MenuKontekst x={menu.x} y={menu.y} onZamknij={() => setMenu(null)} onAkcja={akcjaMenu} />}

            {/* pasek statusu dolny-prawy + lewa legenda */}
            <div className="absolute bottom-4 right-4 z-[55] hidden lg:flex items-center gap-2 text-[10px] font-mono2 text-white/30">
              <span>pulpit</span>
              <span>•</span><span>{teraz()}</span>
              <span>•</span><span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" /> oddycha</span>
            </div>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-[15] hidden xl:flex flex-col items-center gap-3">
              <span className="w-px h-16 bg-gradient-to-b from-transparent to-white/20" />
              <span className="text-[9px] tracking-[0.3em] uppercase text-white/25" style={{ writingMode: "vertical-rl" }}>strumień czasu • {new Date().toLocaleDateString("pl-PL", { day: "numeric", month: "long" })}</span>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--accent)", boxShadow: "0 0 10px var(--accent)" }} />
              <span className="w-px h-16 bg-gradient-to-t from-transparent to-white/20" />
            </div>
                      </>
        )}
      </Tlo>

      <AnimatePresence>{faza === "boot" && <Boot postep={postep} />}</AnimatePresence>
      <AnimatePresence>{faza === "blokada" && <Blokada onObudz={() => { setFaza("os"); try { (window as any).MiraSound?.unlock(); } catch (_) {} powiadom("Dzień dobry w Mirze", "Jądro czeka pośrodku. Oddychaj.", "✦"); }} />}</AnimatePresence>
    </div>
  );
}
