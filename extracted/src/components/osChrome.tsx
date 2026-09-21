import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Wifi, WifiOff, BatteryMedium, Search, Settings2, LayoutGrid,
  Minus, X, Maximize2, Minimize2, Moon, Sun, BellOff, Bell,
  ChevronUp, Lock, Sparkles, Command, ArrowRight, Flower2, Waves, Eclipse,
} from "lucide-react";
import { APPS, APP_LIST, GARDENS, MANTRY, ACCENTS, WALLPAPERS, teraz, type AppId, type GardenId, type Okno, type Echo } from "../os/registry";

/* ============ TŁO ============ */
export function Tlo({ wallpaper, jasnosc, dzieci, children }: { wallpaper: number; jasnosc: number; dzieci?: React.ReactNode; children?: React.ReactNode }) {
  const [par, setPar] = useState({ x: 0, y: 0 });
  useEffect(() => {
    let raf = 0;
    const h = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setPar({ x: (e.clientX / window.innerWidth - 0.5) * 26, y: (e.clientY / window.innerHeight - 0.5) * 26 });
      });
    };
    window.addEventListener("mousemove", h);
    return () => { window.removeEventListener("mousemove", h); cancelAnimationFrame(raf); };
  }, []);
  const gwiazdki = useMemo(() => Array.from({ length: 90 }, () => ({
    l: Math.random() * 100, t: Math.random() * 100, s: Math.random() * 2 + 0.6,
    d: Math.random() * 4, o: Math.random() * 0.7 + 0.2,
  })), []);
  return (
    <div className={`absolute inset-0 overflow-hidden wp-${wallpaper} grain transition-all duration-1000`}>
      {/* żywe mgławice z parallaksą */}
      <div className="absolute -top-40 -left-40 w-[640px] h-[640px] rounded-full blur-[110px] transition-transform duration-300 ease-out" style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 65%)", animation: "drift 18s ease-in-out infinite", opacity: 0.28, transform: `translate(${par.x}px, ${par.y}px)` }} />
      <div className="absolute top-1/3 -right-48 w-[720px] h-[720px] rounded-full blur-[120px] transition-transform duration-300 ease-out" style={{ background: "radial-gradient(circle, var(--accent-2) 0%, transparent 65%)", animation: "drift 22s ease-in-out infinite reverse", opacity: 0.24, transform: `translate(${-par.x * 1.4}px, ${-par.y}px)` }} />
      <div className="absolute -bottom-56 left-1/3 w-[680px] h-[680px] rounded-full blur-[120px] transition-transform duration-300 ease-out" style={{ background: "radial-gradient(circle, var(--accent-3) 0%, transparent 65%)", animation: "drift 26s ease-in-out infinite", opacity: 0.30, transform: `translate(${par.x * 0.6}px, ${-par.y * 0.8}px)` }} />
      {/* gwiazdki */}
      {gwiazdki.map((g, i) => (
        <span key={i} className="absolute rounded-full bg-white" style={{ left: `${g.l}%`, top: `${g.t}%`, width: g.s, height: g.s, opacity: g.o, animation: `twinkle ${2 + g.d}s ease-in-out infinite` }} />
      ))}
      {/* siatka oddechu */}
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)", backgroundSize: "34px 34px" }} />
      {/* jasność */}
      <div className="absolute inset-0 bg-black pointer-events-none transition-opacity" style={{ opacity: (1 - jasnosc) * 0.55 }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(120% 90% at 50% 10%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
      {children ?? dzieci}
    </div>
  );
}

/* ============ HORYZONT (górna wyspa) ============ */
export function Horyzont(props: {
  garden: GardenId; setGarden: (g: GardenId) => void;
  wifi: boolean; skupienie: boolean; glos: number;
  onSzukaj: () => void; onPanel: () => void; onPrzeglad: () => void;
}) {
  const [czas, setCzas] = useState(teraz());
  const [data, setData] = useState("");
  useEffect(() => {
    const f = () => {
      setCzas(teraz());
      setData(new Date().toLocaleDateString("pl-PL", { weekday: "short", day: "numeric", month: "short" }));
    };
    f(); const iv = setInterval(f, 10000); return () => clearInterval(iv);
  }, []);
  const h = new Date().getHours();
  const puls = Math.min(100, Math.max(4, ((h - 5) / 17) * 100));
  return (
    <motion.div initial={{ y: -70, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35, type: "spring", stiffness: 120, damping: 18 }}
      className="absolute top-3 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-1 pl-2 pr-1.5 py-1.5 rounded-full glass max-w-[96vw]">
      <button onClick={props.onPrzeglad} title="Przegląd ogrodów" className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-white/10 transition-all group">
        <span className="relative flex w-7 h-7">
          <span className="absolute inset-0 rounded-full orb-halo" />
          <span className="absolute inset-[3px] rounded-full orb-core animate-breathe" />
        </span>
        <span className="text-left leading-none hidden sm:block">
          <span className="block font-display font-bold text-[11px] tracking-wide">MIRA</span>
          <span className="block text-[9px] text-white/45">{GARDENS[props.garden].nazwa}</span>
        </span>
      </button>
      <span className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />
      {/* ogrody */}
      <span className="hidden md:flex items-center gap-1 rounded-full bg-black/25 border border-white/10 p-1">
        {(Object.keys(GARDENS) as GardenId[]).map((g) => (
          <button key={g} onClick={() => props.setGarden(g)} title={GARDENS[g].opis}
            className={`px-2.5 py-1 rounded-full text-[10.5px] font-semibold transition-all ${props.garden === g ? "text-black" : "text-white/45 hover:text-white"}`}
            style={props.garden === g ? { background: GARDENS[g].kolor, boxShadow: `0 0 14px ${GARDENS[g].kolor}` } : {}}>{GARDENS[g].nazwa}</button>
        ))}
      </span>
      {/* puls dnia */}
      <span className="hidden lg:flex items-center gap-2 px-3">
        <span className="font-mono2 text-[12px] font-semibold tabular-nums">{czas}</span>
        <span className="text-[10px] text-white/40 capitalize">{data}</span>
        <span className="w-20 h-1 rounded-full bg-white/10 relative overflow-hidden" title="Puls dnia">
          <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${puls}%`, background: "linear-gradient(90deg, var(--accent), var(--accent-2))" }} />
        </span>
      </span>
      <button onClick={props.onSzukaj} className="flex items-center gap-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 px-3.5 py-1.5 text-[12px] text-white/55 transition-all">
        <Search size={13} /> <span className="hidden sm:inline">Zapytaj Mirę…</span>
        <kbd className="hidden md:inline text-[9px] font-mono2 border border-white/15 rounded-md px-1.5 py-0.5 bg-black/30">/</kbd>
      </button>
      <span className="flex items-center gap-0.5 pl-1">
        {props.skupienie
          ? <span className="p-2 rounded-full text-[var(--accent)]" title="Tryb skupienia"><BellOff size={14} /></span>
          : <span className="p-2 rounded-full text-white/55" title="Echa włączone"><Bell size={14} /></span>}
        <span className="p-2 rounded-full text-white/60">{props.wifi ? <Wifi size={14} /> : <WifiOff size={14} className="text-rose-300" />}</span>
        <span className="hidden sm:flex p-2 rounded-full text-white/60 items-center gap-1"><BatteryMedium size={15} /><span className="text-[10px] font-mono2">87</span></span>
        <button onClick={props.onPanel} className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all" title="Strojenie"><Settings2 size={14} /></button>
      </span>
    </motion.div>
  );
}

/* ============ JĄDRO + KONSTELACJA ============ */
export function Jadro(props: { otwarte: boolean; setOtwarte: (v: boolean) => void; onOpen: (a: AppId) => void; onSzukaj: () => void; ukryte: boolean }) {
  const [mantra] = useState(() => MANTRY[Math.floor(Math.random() * MANTRY.length)]);
  const [czas, setCzas] = useState(teraz());
  useEffect(() => { const iv = setInterval(() => setCzas(teraz()), 5000); return () => clearInterval(iv); }, []);
  const R = typeof window !== "undefined" && window.innerWidth < 700 ? 132 : 196;
  return (
    <div className={`absolute inset-0 z-[20] flex items-center justify-center pointer-events-none transition-opacity duration-700 ${props.ukryte && !props.otwarte ? "opacity-0 scale-95" : "opacity-100"}`}>
      <div className="relative flex items-center justify-center pointer-events-auto">
        {/* pierścienie orbity */}
        <AnimatePresence>
          {props.otwarte && (
            <>
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="absolute rounded-full orbit-ring" style={{ width: R * 2, height: R * 2 }} />
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ delay: 0.06 }} className="absolute rounded-full orbit-ring opacity-60" style={{ width: R * 2 + 56, height: R * 2 + 56 }} />
            </>
          )}
        </AnimatePresence>
        {/* aplikacje na orbicie */}
        <AnimatePresence>
          {props.otwarte && APP_LIST.map((app, i) => {
            const kat = (i / APP_LIST.length) * Math.PI * 2 - Math.PI / 2;
            const x = Math.cos(kat) * R, y = Math.sin(kat) * R;
            const I = app.ikona;
            return (
              <motion.button key={app.id} initial={{ x: 0, y: 0, scale: 0, opacity: 0 }} animate={{ x, y, scale: 1, opacity: 1 }} exit={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 210, damping: 20, delay: i * 0.03 }}
                onClick={() => props.onOpen(app.id)} title={app.opis}
                className="absolute group flex flex-col items-center gap-1.5 w-[86px]">
                <span className={`w-[52px] h-[52px] rounded-[18px] bg-gradient-to-br ${app.gradient} flex items-center justify-center text-black/70 transition-transform group-hover:scale-110 group-hover:-translate-y-1`} style={{ boxShadow: `0 10px 36px -8px ${app.glow}` }}>
                  <I size={23} strokeWidth={2.2} />
                </span>
                <span className="text-[10.5px] font-semibold bg-black/45 backdrop-blur px-2 py-0.5 rounded-full border border-white/10">{app.nazwa}</span>
              </motion.button>
            );
          })}
        </AnimatePresence>
        {/* centralne jądro */}
        <div className="relative flex flex-col items-center">
          {!props.otwarte && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-5 select-none">
              <div className="font-mono2 text-[12px] tracking-[0.35em] text-white/40 uppercase">{new Date().toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" })}</div>
              <div className="font-display font-extrabold text-[64px] md:text-[92px] leading-none tabular-nums text-glow mt-1">{czas}</div>
              <div className="font-display text-[13px] md:text-[15px] text-white/70 mt-2">Dobry czas na oddech. {mantra}</div>
            </motion.div>
          )}
          <button onClick={() => props.setOtwarte(!props.otwarte)} className="relative group" title={props.otwarte ? "Zwiń Jądro" : "Obudź Jądro — wszystkie miejsca Miry"}>
            <span className="absolute -inset-10 rounded-full orb-halo animate-breathe2" />
            <span className="absolute -inset-5 rounded-full border border-white/15 animate-spin-slower" style={{ borderStyle: "dashed" }} />
            <span className="absolute -inset-5 rounded-full overflow-hidden"><span className="absolute inset-0 rounded-full animate-pulse-ring border-2 border-white/30" /></span>
            <span className="relative block w-[118px] h-[118px] rounded-full orb-core animate-breathe border border-white/25 shadow-2xl overflow-hidden">
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_32%_26%,rgba(255,255,255,0.85),transparent_42%)]" />
              <span className="absolute inset-0 flex items-center justify-center">
                <Flower2 size={34} className="text-white/90 drop-shadow-lg transition-transform duration-500 group-hover:rotate-45" />
              </span>
            </span>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10.5px] font-semibold tracking-[0.22em] uppercase text-white/50 group-hover:text-white transition-colors">
              {props.otwarte ? "— zwiń oddech —" : "✦ dotknij jądra ✦"}
            </span>
          </button>
          {props.otwarte && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-10 flex items-center gap-2">
              <button onClick={props.onSzukaj} className="flex items-center gap-2 rounded-full glass px-5 py-2.5 text-[13px] text-white/70 hover:text-white">
                <Command size={14} className="text-[var(--accent)]" /> Czego szukasz w Eterze? <ArrowRight size={14} />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============ RZEKA (dolny nurt) ============ */
export function Rzeka(props: {
  okna: Okno[]; aktywne: string | null; garden: GardenId; setGarden: (g: GardenId) => void;
  onFocus: (id: string) => void; onJadro: () => void; jadroOtwarte: boolean;
  onPrzeglad: () => void; onSzukaj: () => void; zminimalizowane: number;
}) {
  const biegnace = props.okna.filter((o) => o.garden === props.garden);
  return (
    <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, type: "spring", stiffness: 110, damping: 18 }}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-1.5 max-w-[96vw]">
      <div className="flex items-center gap-1 rounded-[26px] glass pl-2 pr-2 py-2">
        <button onClick={props.onJadro} title="Jądro" className={`w-11 h-11 rounded-full relative shrink-0 transition-transform hover:scale-105 ${props.jadroOtwarte ? "scale-105" : ""}`}>
          <span className="absolute inset-0 rounded-full orb-halo" />
          <span className="absolute inset-[4px] rounded-full orb-core border border-white/25" />
          <Flower2 size={17} className="absolute inset-0 m-auto text-white" />
        </button>
        <button onClick={props.onSzukaj} title="Szukaj" className="w-11 h-11 rounded-2xl bg-white/[0.06] hover:bg-white/[0.13] border border-white/10 flex items-center justify-center text-white/70"><Search size={17} /></button>
        <button onClick={props.onPrzeglad} title="Przegląd ogrodów" className="w-11 h-11 rounded-2xl bg-white/[0.06] hover:bg-white/[0.13] border border-white/10 flex items-center justify-center text-white/70"><LayoutGrid size={17} /></button>
        {biegnace.length > 0 && <span className="w-px h-8 bg-white/10 mx-1" />}
        <AnimatePresence mode="popLayout">
          {biegnace.map((o) => {
            const m = APPS[o.appId]; const I = m.ikona;
            const akt = props.aktywne === o.id && !o.minimized;
            return (
              <motion.button key={o.id} layout initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                onClick={() => props.onFocus(o.id)} title={`${m.nazwa} — ${o.minimized ? "uśpione, dotknij by obudzić" : "na wierzch"}`}
                className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${akt ? "bg-white/15 border border-white/25 -translate-y-1" : "bg-white/[0.05] border border-white/10 hover:bg-white/10"}`}>
                <span className={`w-7 h-7 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center text-black/70`}><I size={15} /></span>
                {o.minimized && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black/60 border border-white/20 flex items-center justify-center"><Moon size={9} className="text-white/70" /></span>}
                {akt && <span className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)", boxShadow: "0 0 8px var(--accent)" }} />}
              </motion.button>
            );
          })}
        </AnimatePresence>
        {biegnace.length === 0 && (
          <span className="px-3 text-[11px] text-white/35 italic whitespace-nowrap hidden sm:block">Rzeka jest spokojna — obudź coś z Jądra</span>
        )}
      </div>
      <div className="flex items-center gap-2 text-[10px]">
        {(Object.keys(GARDENS) as GardenId[]).map((g) => (
          <button key={g} onClick={() => props.setGarden(g)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border backdrop-blur transition-all ${props.garden === g ? "bg-white/12 border-white/25 text-white" : "bg-black/30 border-white/10 text-white/40 hover:text-white/70"}`}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: GARDENS[g].kolor, boxShadow: props.garden === g ? `0 0 8px ${GARDENS[g].kolor}` : "none" }} />
            {GARDENS[g].nazwa}
            <span className="font-mono2 opacity-50">{props.okna.filter((o) => o.garden === g && !o.minimized).length || ""}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/* ============ ECHA (powiadomienia) ============ */
export function Echa({ echa, onZamknij }: { echa: Echo[]; onZamknij: (id: string) => void }) {
  return (
    <div className="absolute left-4 bottom-24 z-[70] flex flex-col gap-2 w-[290px] max-w-[80vw] pointer-events-none">
      <AnimatePresence>
        {echa.slice(-4).map((e) => (
          <motion.div key={e.id} layout initial={{ x: -80, opacity: 0, scale: 0.9 }} animate={{ x: 0, opacity: 1, scale: 1 }} exit={{ x: -60, opacity: 0, scale: 0.9 }}
            className="pointer-events-auto glass rounded-3xl p-3.5 flex gap-3 cursor-pointer hover:bg-white/[0.12]" onClick={() => onZamknij(e.id)}>
            <span className="w-9 h-9 rounded-2xl flex items-center justify-center text-[16px] shrink-0 bg-white/10 border border-white/10">{e.icon}</span>
            <span className="min-w-0">
              <span className="flex items-center gap-2"><span className="font-bold text-[12.5px] truncate">{e.title}</span><span className="ml-auto text-[10px] font-mono2 text-white/35 shrink-0">{e.time}</span></span>
              <span className="block text-[12px] text-white/60 leading-snug mt-0.5">{e.body}</span>
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ============ SZUKAJ ============ */
export function Szukaj(props: { otwarte: boolean; onZamknij: () => void; onOpen: (a: AppId) => void; onAkcja: (a: string) => void }) {
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { if (props.otwarte) { setQ(""); setTimeout(() => input.current?.focus(), 80); } }, [props.otwarte]);
  const apps = APP_LIST.filter((a) => (a.nazwa + a.opis + a.podtytul).toLowerCase().includes(q.toLowerCase()));
  const akcje = [
    { id: "przeglad", t: "Przegląd ogrodów", d: "zobacz wszystkie nurty naraz", ikona: "◈" },
    { id: "uspij", t: "Uśpij wszystkie fale", d: "zminimalizuj każde okno", ikona: "☾" },
    { id: "zorzowy", t: "Losowa zorza", d: "zmień krajobraz Miry", ikona: "✦" },
    { id: "echo", t: "Wyślij sobie echo", d: "mały znak w Rzece", ikona: "〜" },
    { id: "blokada", t: "Zapaść w sen", d: "zablokuj Mirę", ikona: "◉" },
  ].filter((a) => (a.t + a.d).toLowerCase().includes(q.toLowerCase()));
  return (
    <AnimatePresence>
      {props.otwarte && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[80] bg-black/45 backdrop-blur-sm flex justify-center pt-[12vh] px-4" onClick={props.onZamknij}>
          <motion.div initial={{ y: -26, scale: 0.96, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: -18, scale: 0.97, opacity: 0 }} transition={{ type: "spring", stiffness: 260, damping: 26 }}
            onClick={(e) => e.stopPropagation()} className="w-full max-w-xl glass-deep rounded-[28px] overflow-hidden h-fit max-h-[70vh] flex flex-col">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
              <Sparkles size={18} className="text-[var(--accent)] shrink-0" />
              <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && apps[0]) { props.onOpen(apps[0].id); } if (e.key === "Escape") props.onZamknij(); }}
                placeholder="Zapytaj Mirę o wszystko… miejsca, fale, ciszę" className="bg-transparent w-full text-[15px] placeholder:text-white/30" />
              <kbd className="text-[10px] font-mono2 border border-white/15 rounded-lg px-2 py-1 bg-black/30 text-white/40">esc</kbd>
            </div>
            <div className="overflow-y-auto p-3">
              {apps.length > 0 && <div className="text-[10px] uppercase tracking-[0.2em] text-white/35 font-bold px-2 pt-1 pb-2">Miejsca</div>}
              {apps.map((a) => {
                const I = a.ikona;
                return (
                  <button key={a.id} onClick={() => props.onOpen(a.id)} className="w-full flex items-center gap-3 rounded-2xl p-2.5 hover:bg-white/10 text-left group">
                    <span className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${a.gradient} flex items-center justify-center text-black/70 shrink-0`} style={{ boxShadow: `0 6px 20px -6px ${a.glow}` }}><I size={19} /></span>
                    <span className="min-w-0 flex-1"><span className="block font-bold text-[13.5px]">{a.nazwa} <span className="font-normal text-white/35 text-[11px]">• {a.podtytul}</span></span><span className="block text-[12px] text-white/45 truncate">{a.opis}</span></span>
                    <span className="text-[10px] font-mono2 border border-white/15 rounded-lg px-1.5 py-0.5 text-white/40">⌘{a.skrot}</span>
                  </button>
                );
              })}
              {akcje.length > 0 && <div className="text-[10px] uppercase tracking-[0.2em] text-white/35 font-bold px-2 pt-3 pb-2">Rytuały</div>}
              {akcje.map((a) => (
                <button key={a.id} onClick={() => props.onAkcja(a.id)} className="w-full flex items-center gap-3 rounded-2xl p-2.5 hover:bg-white/10 text-left">
                  <span className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-[18px] shrink-0">{a.ikona}</span>
                  <span><span className="block font-bold text-[13px]">{a.t}</span><span className="block text-[12px] text-white/45">{a.d}</span></span>
                  <ArrowRight size={15} className="ml-auto opacity-30" />
                </button>
              ))}
              {apps.length === 0 && akcje.length === 0 && (
                <div className="text-center py-10 text-white/40"><div className="text-[30px] mb-2">〜</div>Eter milczy. Spróbuj: ogród, fala, sen, światło…</div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============ PANEL BOCZNY ============ */
export function Panel(props: {
  otwarte: boolean; onZamknij: () => void;
  wifi: boolean; setWifi: (v: boolean) => void;
  skupienie: boolean; setSkupienie: (v: boolean) => void;
  glos: number; setGlos: (v: number) => void;
  jasnosc: number; setJasnosc: (v: number) => void;
  accent: number; setAccent: (i: number) => void;
  wallpaper: number; setWallpaper: (i: number) => void;
  onLab: () => void; onSen: () => void;
}) {
  return (
    <AnimatePresence>
      {props.otwarte && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={props.onZamknij} className="absolute inset-0 z-[75] bg-black/30" />
          <motion.div initial={{ x: 380 }} animate={{ x: 0 }} exit={{ x: 380 }} transition={{ type: "spring", stiffness: 240, damping: 28 }}
            className="absolute right-3 top-[70px] bottom-24 w-[300px] max-w-[88vw] z-[76] glass-deep rounded-[26px] p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display font-bold text-[13px]">Strojenie</span>
              <button onClick={props.onZamknij} className="p-1.5 rounded-full hover:bg-white/10"><X size={15} /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => props.setWifi(!props.wifi)} className={`rounded-2xl p-3 text-left border ${props.wifi ? "text-black border-transparent" : "bg-white/[0.05] border-white/10 text-white/60"}`} style={props.wifi ? { background: "linear-gradient(130deg, var(--accent), var(--accent-2))" } : {}}>
                {props.wifi ? <Wifi size={17} /> : <WifiOff size={17} />}<span className="block text-[12px] font-bold mt-1.5">Eter</span><span className="block text-[10px] opacity-70">{props.wifi ? "480 Mb/s" : "offline"}</span>
              </button>
              <button onClick={() => props.setSkupienie(!props.skupienie)} className={`rounded-2xl p-3 text-left border ${props.skupienie ? "text-black border-transparent" : "bg-white/[0.05] border-white/10 text-white/60"}`} style={props.skupienie ? { background: "linear-gradient(130deg, var(--accent-3), var(--accent-2))" } : {}}>
                {props.skupienie ? <Moon size={17} /> : <Sun size={17} />}<span className="block text-[12px] font-bold mt-1.5">Skupienie</span><span className="block text-[10px] opacity-70">{props.skupienie ? "cisza" : "otwarte"}</span>
              </button>
            </div>
            <div className="mt-3 space-y-3">
              <div><div className="flex justify-between text-[12px] font-semibold"><span>Głośność Eteru</span><span className="font-mono2 text-white/40">{Math.round(props.glos * 100)}</span></div><input type="range" min={0} max={100} value={Math.round(props.glos * 100)} onChange={(e) => props.setGlos(+e.target.value / 100)} className="w-full mt-1" /></div>
              <div><div className="flex justify-between text-[12px] font-semibold"><span>Jasność oddechu</span><span className="font-mono2 text-white/40">{Math.round(props.jasnosc * 100)}</span></div><input type="range" min={20} max={100} value={Math.round(props.jasnosc * 100)} onChange={(e) => props.setJasnosc(+e.target.value / 100)} className="w-full mt-1" /></div>
            </div>
            <div className="mt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/35">Barwa</div>
            <div className="flex gap-2 mt-1.5">
              {ACCENTS.map((a, i) => (
                <button key={a.id} onClick={() => props.setAccent(i)} title={a.nazwa} className={`w-9 h-9 rounded-full border-2 ${props.accent === i ? "border-white scale-110" : "border-white/15"}`} style={{ background: `linear-gradient(135deg, ${a.c1}, ${a.c2})`, boxShadow: props.accent === i ? `0 0 14px ${a.c1}` : "none" }} />
              ))}
            </div>
            <div className="mt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/35">Krajobraz</div>
            <div className="grid grid-cols-2 gap-1.5 mt-1.5">
              {WALLPAPERS.map((w) => (
                <button key={w.id} onClick={() => props.setWallpaper(w.id)} className={`rounded-xl overflow-hidden border-2 ${props.wallpaper === w.id ? "border-white/70" : "border-white/10"}`}><span className={`block h-10 wp-${w.id}`} /><span className="block text-[9.5px] font-semibold py-1 bg-black/40">{w.nazwa}</span></button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button onClick={props.onLab} className="rounded-2xl py-2.5 bg-white/10 border border-white/10 text-[12px] font-bold hover:bg-white/15 flex items-center justify-center gap-1.5"><Settings2 size={13} /> Laboratorium</button>
              <button onClick={props.onSen} className="rounded-2xl py-2.5 bg-white/[0.06] border border-white/10 text-[12px] font-bold hover:bg-white/10 flex items-center justify-center gap-1.5"><Lock size={13} /> Sen</button>
            </div>
            <div className="mt-3 rounded-2xl bg-white/[0.04] border border-white/10 p-3 text-[11.5px] text-white/55 flex gap-2"><Waves size={14} className="shrink-0 text-[var(--accent)]" /> Rzeka niesie dziś {props.glos > 0.5 ? "głośny" : "cichy"} nurt. {props.skupienie ? "Echa śpią." : "Echa czuwają."}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ============ PRZEGLĄD OGRODÓW ============ */
export function Przeglad(props: {
  otwarte: boolean; onZamknij: () => void; okna: Okno[]; garden: GardenId; setGarden: (g: GardenId) => void;
  onFocus: (id: string) => void; onZamknijOkno: (id: string) => void; onOpen: (a: AppId) => void;
}) {
  return (
    <AnimatePresence>
      {props.otwarte && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[78] bg-black/60 backdrop-blur-2xl p-6 md:p-10 overflow-y-auto" onClick={props.onZamknij}>
          <div className="max-w-5xl mx-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-display font-bold text-[20px]">Ogrody</span>
              <span className="text-white/40 text-[13px]">trzy nurty • jeden oddech</span>
              <button onClick={props.onZamknij} className="ml-auto p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10"><X size={16} /></button>
            </div>
            <div className="flex gap-2 mt-4">
              {(Object.keys(GARDENS) as GardenId[]).map((g) => (
                <button key={g} onClick={() => props.setGarden(g)} className={`flex-1 rounded-3xl p-4 text-left border transition-all ${props.garden === g ? "bg-white/12 border-white/30" : "bg-white/[0.04] border-white/10 hover:bg-white/[0.08]"}`}>
                  <span className="flex items-center gap-2 font-display font-bold text-[14px]"><span className="w-2.5 h-2.5 rounded-full" style={{ background: GARDENS[g].kolor, boxShadow: `0 0 10px ${GARDENS[g].kolor}` }} />{GARDENS[g].nazwa}</span>
                  <span className="block text-[11.5px] text-white/45 mt-0.5">{GARDENS[g].opis}</span>
                  <span className="block text-[11px] font-mono2 text-white/35 mt-1">{props.okna.filter((o) => o.garden === g).length} fal</span>
                </button>
              ))}
            </div>
            {props.okna.length === 0 ? (
              <div className="text-center py-14 text-white/40">
                <Eclipse size={40} className="mx-auto opacity-40" />
                <div className="font-display font-semibold mt-3 text-white/70">Wszystkie ogrody śpią</div>
                <div className="text-[13px] mt-1">Obudź coś z konstelacji:</div>
                <div className="flex justify-center gap-2 mt-4 flex-wrap">
                  {APP_LIST.slice(0, 5).map((a) => { const I = a.ikona; return <button key={a.id} onClick={() => props.onOpen(a.id)} className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${a.gradient} flex items-center justify-center text-black/70 hover:scale-110 transition-transform`}><I size={20} /></button>; })}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
                {props.okna.map((o) => {
                  const m = APPS[o.appId]; const I = m.ikona;
                  return (
                    <div key={o.id} className={`rounded-3xl border p-4 cursor-pointer transition-all hover:scale-[1.02] ${props.garden === o.garden ? "bg-white/[0.08] border-white/20" : "bg-white/[0.03] border-white/10 opacity-70"}`} onClick={() => { props.setGarden(o.garden); props.onFocus(o.id); }}>
                      <div className="flex items-center gap-2.5">
                        <span className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${m.gradient} flex items-center justify-center text-black/70`}><I size={18} /></span>
                        <span><span className="block font-bold text-[13.5px]">{m.nazwa}</span><span className="block text-[11px] text-white/40">{GARDENS[o.garden].nazwa} • {o.minimized ? "uśpione" : "płynie"}</span></span>
                        <button onClick={(e) => { e.stopPropagation(); props.onZamknijOkno(o.id); }} className="ml-auto p-1.5 rounded-full hover:bg-white/15 text-white/40 hover:text-rose-300"><X size={14} /></button>
                      </div>
                      <div className="mt-3 h-20 rounded-2xl bg-black/30 border border-white/[0.07] relative overflow-hidden">
                        <span className="absolute inset-0 opacity-30" style={{ background: `linear-gradient(120deg, ${m.glow}44, transparent)` }} />
                        <span className="absolute bottom-2 left-3 text-[10px] font-mono2 text-white/40">{o.w}x{o.h} • nurt {o.garden}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============ OKNO ============ */
export function Okno(props: {
  okno: Okno; aktywne: boolean; onFocus: () => void; onZamknij: () => void;
  onUspij: () => void; onMax: () => void; onPrzenies: (x: number, y: number) => void;
  onRozmiar: (w: number, h: number) => void; dzieci: React.ReactNode;
}) {
  const { okno } = props;
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const meta = APPS[okno.appId]; const I = meta.ikona;
  const styl: React.CSSProperties = okno.maximized
    ? { left: 8, top: 64, width: "calc(100vw - 16px)", height: "calc(100vh - 160px)", zIndex: okno.z }
    : { left: okno.x, top: okno.y, width: okno.w, height: okno.h, zIndex: okno.z };
  return (
    <motion.div initial={{ scale: 0.85, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: "spring", stiffness: 260, damping: 26 }}
      onPointerDown={props.onFocus}
      className={`absolute os-window glass-deep flex flex-col ${props.aktywne ? "os-window-active" : "os-window-inactive"}`}
      style={styl}>
      {/* pasek oddechu */}
      <div
        className="flex items-center gap-2 px-3.5 py-2.5 cursor-grab active:cursor-grabbing shrink-0 border-b border-white/10 bg-white/[0.03] touch-none"
        onPointerDown={(e) => {
          if (okno.maximized) return;
          if ((e.target as HTMLElement).closest("button")) return;
          props.onFocus();
          drag.current = { sx: e.clientX, sy: e.clientY, ox: okno.x, oy: okno.y };
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          props.onPrzenies(drag.current.ox + e.clientX - drag.current.sx, Math.max(60, drag.current.oy + e.clientY - drag.current.sy));
        }}
        onPointerUp={() => { drag.current = null; }}
        onDoubleClick={props.onMax}
      >
        <span className={`w-8 h-8 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-black/70 shrink-0`}><I size={15} /></span>
        <span className="leading-none min-w-0">
          <span className="block font-display font-bold text-[12px] truncate">{meta.nazwa}</span>
          <span className="block text-[10px] text-white/40 truncate">{meta.podtytul}</span>
        </span>
        <span className="ml-auto flex items-center gap-1 shrink-0">
          <button onClick={props.onUspij} title="Uśpij (zminimalizuj)" className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 flex items-center justify-center text-white/60 hover:text-white"><Minus size={13} /></button>
          <button onClick={props.onMax} title={okno.maximized ? "Zwiń" : "Rozkwitnij (maksymalizuj)"} className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 flex items-center justify-center text-white/60 hover:text-white">{okno.maximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}</button>
          <button onClick={props.onZamknij} title="Rozpuść (zamknij)" className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-rose-400/80 hover:text-black border border-white/10 flex items-center justify-center text-white/60"><X size={13} /></button>
        </span>
      </div>
      <div className="flex-1 min-h-0 relative bg-black/20">{props.dzieci}</div>
      {!okno.maximized && (
        <span
          className="absolute bottom-1 right-1 w-6 h-6 cursor-nwse-resize opacity-40 hover:opacity-100 touch-none"
          onPointerDown={(e) => {
            e.stopPropagation();
            const sx = e.clientX, sy = e.clientY, ow = okno.w, oh = okno.h;
            const move = (ev: PointerEvent) => props.onRozmiar(Math.max(320, ow + ev.clientX - sx), Math.max(240, oh + ev.clientY - sy));
            const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
            window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
          }}
        >
          <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M20 20 L12 20 M20 20 L20 12" stroke="white" strokeWidth={2.4} strokeLinecap="round" /></svg>
        </span>
      )}
    </motion.div>
  );
}

/* ============ BOOT ============ */
export function Boot({ postep }: { postep: number }) {
  const wskazowki = ["Mira nie ma pulpitu. Ma ogród.", "Okna nie zamykasz. Pozwalasz im odpłynąć.", "Jądro świeci jaśniej, gdy jesteś w skupieniu.", "Rzeka pamięta wszystko, co niosła."];
  const w = wskazowki[Math.min(wskazowki.length - 1, Math.floor(postep / 28))];
  return (
    <motion.div exit={{ opacity: 0, scale: 1.06 }} className="absolute inset-0 z-[100] bg-[#07080f] flex flex-col items-center justify-center grain overflow-hidden">
      <div className="absolute -top-40 left-1/4 w-[560px] h-[560px] rounded-full blur-[130px] opacity-30" style={{ background: "radial-gradient(circle, var(--accent), transparent 65%)" }} />
      <div className="absolute -bottom-40 right-1/4 w-[560px] h-[560px] rounded-full blur-[130px] opacity-25" style={{ background: "radial-gradient(circle, var(--accent-2), transparent 65%)" }} />
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative">
        <span className="absolute -inset-12 rounded-full orb-halo animate-breathe2" />
        <span className="relative block w-[110px] h-[110px] rounded-full orb-core animate-breathe border border-white/25 mx-auto">
          <Flower2 size={40} className="absolute inset-0 m-auto text-white" />
        </span>
      </motion.div>
      <div className="font-display font-extrabold text-[34px] tracking-[0.3em] mt-8 ml-2">MIRA</div>
      <div className="text-[12px] tracking-[0.3em] uppercase text-white/35 mt-1">system, który oddycha</div>
      <div className="w-56 h-1 rounded-full bg-white/10 mt-8 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${postep}%`, background: "linear-gradient(90deg, var(--accent), var(--accent-2), var(--accent-3))", boxShadow: "0 0 16px var(--accent)" }} />
      </div>
      <div className="font-mono2 text-[12px] text-white/50 mt-3 tabular-nums">{Math.floor(postep)}% — {postep < 40 ? "budzenie jądra" : postep < 75 ? "napełnianie rzeki" : "otwieranie ogrodu"}</div>
      <div className="text-[12.5px] text-white/40 mt-6 italic px-6 text-center">✦ {w} ✦</div>
    </motion.div>
  );
}

/* ============ BLOKADA ============ */
export function Blokada({ onObudz }: { onObudz: () => void }) {
  const [czas, setCzas] = useState(teraz());
  useEffect(() => { const iv = setInterval(() => setCzas(teraz()), 5000); return () => clearInterval(iv); }, []);
  return (
    <motion.div exit={{ y: "-100%", opacity: 0.6 }} transition={{ type: "spring", stiffness: 90, damping: 20 }}
      className="absolute inset-0 z-[100] flex flex-col items-center justify-center cursor-pointer overflow-hidden wp-0 grain"
      onClick={onObudz}>
      <div className="absolute inset-0 bg-black/25" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative text-center select-none">
        <div className="text-[13px] tracking-[0.35em] uppercase text-white/50">{new Date().toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" })}</div>
        <div className="font-display font-extrabold text-[110px] md:text-[150px] leading-none tabular-nums text-glow">{czas}</div>
        <div className="flex items-center justify-center gap-3 mt-2">
          <span className="w-14 h-14 rounded-full orb-core animate-breathe border border-white/25 inline-flex items-center justify-center"><Flower2 size={22} className="text-white" /></span>
        </div>
        <div className="font-display text-[14px] text-white/75 mt-5">Mira śpi. Oddycha powoli.</div>
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-6 inline-flex flex-col items-center gap-1.5 rounded-full glass px-6 py-3 text-[12.5px] font-semibold">
          <ChevronUp size={16} className="text-[var(--accent)]" /> dotknij, by się obudzić
        </motion.div>
      </motion.div>
      <div className="absolute bottom-6 inset-x-0 flex justify-center gap-6 text-white/30 text-[11px] font-mono2">
        <span>◉ jądro: śpi</span><span>〜 rzeka: cicha</span><span>✦ ogrody: 3</span>
      </div>
    </motion.div>
  );
}

/* ============ MENU KONTEKSTOWE ============ */
export function MenuKontekst({ x, y, onZamknij, onAkcja }: { x: number; y: number; onZamknij: () => void; onAkcja: (a: string) => void }) {
  const opcje = [
    { id: "jadro", t: "Obudź Jądro", ikona: "✦" },
    { id: "szukaj", t: "Zapytaj Mirę", ikona: "⌘" },
    { id: "przeglad", t: "Przegląd ogrodów", ikona: "◈" },
    { id: "zorza", t: "Zmień krajobraz", ikona: "〜" },
    { id: "uloz", t: "Ułóż fale (kaskada)", ikona: "▦" },
    { id: "uspij", t: "Uśpij wszystkie", ikona: "☾" },
  ];
  return (
    <>
      <div className="fixed inset-0 z-[85]" onClick={onZamknij} onContextMenu={(e) => { e.preventDefault(); onZamknij(); }} />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="fixed z-[86] w-[220px] glass-deep rounded-3xl p-2" style={{ left: Math.min(x, window.innerWidth - 236), top: Math.min(y, window.innerHeight - 300) }}>
        <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-[0.2em] text-white/35 font-bold">Eter odpowiada</div>
        {opcje.map((o) => (
          <button key={o.id} onClick={() => onAkcja(o.id)} className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-white/10 text-[13px] font-medium text-left">
            <span className="w-7 h-7 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-[13px]">{o.ikona}</span>{o.t}
          </button>
        ))}
      </motion.div>
    </>
  );
}
