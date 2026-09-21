import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus, Search, Play, Pause, SkipBack, SkipForward, Heart, Volume2,
  FolderOpen, LayoutGrid, List, ChevronRight, ArrowLeft, ArrowRight,
  RotateCcw, Star, Download, Eraser, Sparkles, MapPin, Droplets, Wind,
  CalendarDays, Clock, Trash2, Pin, Check, Globe, Bookmark, Send, Command,
} from "lucide-react";
import type { AppId } from "../os/registry";
import { APPS, ACCENTS, WALLPAPERS } from "../os/registry";

/* ================= OGROD — notatki ================= */
const START_NOTES = [
  { id: "n1", tytul: "Manifest poranka", tresc: "Obudź się powoli.\nZaparz herbatę.\nZapisz jedno zdanie, które chcesz zapamiętać.\n\nMira pamięta resztę za Ciebie.", kolor: "#7df9c6", data: "dziś 07:42", pin: true },
  { id: "n2", tytul: "Pomysł na ogród", tresc: "Co gdyby okna miały zapach?\nKażda aplikacja pachniałaby inaczej:\n— Ogród: mokra ziemia\n— Fala: sól i wiatr\n— Atelier: terpentyna i deszcz", kolor: "#ff9ed2", data: "wczoraj 21:13", pin: false },
  { id: "n3", tytul: "Lista wdzięczności", tresc: "1. Światło o 17:04\n2. Dźwięk deszczu w Kapsule\n3. To, że system oddycha razem ze mną", kolor: "#a78bfa", data: "pn 18:02", pin: false },
];

export function OgrodApp() {
  const [notatki, setNotatki] = useState(START_NOTES);
  const [aktywna, setAktywna] = useState("n1");
  const [szukaj, setSzukaj] = useState("");
  const n = notatki.find((x) => x.id === aktywna) ?? notatki[0];
  const filtrowane = notatki.filter((x) => (x.tytul + x.tresc).toLowerCase().includes(szukaj.toLowerCase()));
  const edytuj = (tresc: string) => setNotatki((p) => p.map((x) => (x.id === aktywna ? { ...x, tresc } : x)));
  const edytujTytul = (tytul: string) => setNotatki((p) => p.map((x) => (x.id === aktywna ? { ...x, tytul } : x)));
  const dodaj = () => {
    const id = `n${Date.now()}`;
    setNotatki((p) => [{ id, tytul: "Nowe nasiono", tresc: "", kolor: "#7df9c6", data: "przed chwilą", pin: false }, ...p]);
    setAktywna(id);
  };
  const slowa = (n?.tresc.trim().split(/\s+/).filter(Boolean).length ?? 0);
  return (
    <div className="flex h-full text-[13px]">
      <div className="w-[218px] shrink-0 border-r border-white/10 p-3 flex flex-col gap-2 bg-white/[0.02]">
        <div className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1.5">
          <Search size={13} className="opacity-50" />
          <input value={szukaj} onChange={(e) => setSzukaj(e.target.value)} placeholder="Przesiej myśli…" className="bg-transparent w-full placeholder:text-white/30 text-white/90" />
        </div>
        <button onClick={dodaj} className="flex items-center justify-center gap-1.5 rounded-full py-2 text-[12px] font-semibold text-black" style={{ background: "linear-gradient(120deg, var(--accent), var(--accent-2))" }}>
          <Plus size={14} /> Zasiej myśl
        </button>
        <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
          {filtrowane.map((x) => (
            <button key={x.id} onClick={() => setAktywna(x.id)}
              className={`w-full text-left rounded-2xl p-3 border transition-all ${x.id === aktywna ? "bg-white/10 border-white/20" : "bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.07]"}`}>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: x.kolor, boxShadow: `0 0 8px ${x.kolor}` }} />
                <span className="font-semibold truncate text-white/90">{x.tytul || "Bez tytułu"}</span>
                {x.pin && <Pin size={11} className="ml-auto opacity-60 shrink-0" />}
              </div>
              <div className="text-white/40 text-[11px] mt-1 line-clamp-2 leading-snug">{x.tresc || "Puste nasiono…"}</div>
              <div className="text-white/25 text-[10px] mt-1.5 font-mono2">{x.data}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {n ? (
          <>
            <div className="flex items-center gap-2 px-5 pt-4">
              <span className="w-2.5 h-2.5 rounded-full animate-breathe" style={{ background: n.kolor }} />
              <input value={n.tytul} onChange={(e) => edytujTytul(e.target.value)} className="bg-transparent font-display text-[17px] font-semibold w-full placeholder:text-white/20" placeholder="Tytuł nasiona…" />
              <button onClick={() => setNotatki((p) => p.filter((x) => x.id !== n.id))} className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-rose-300"><Trash2 size={14} /></button>
            </div>
            <textarea value={n.tresc} onChange={(e) => edytuj(e.target.value)} placeholder="Pisz… Mira podlewa każde słowo."
              className="flex-1 bg-transparent resize-none px-5 py-3 leading-relaxed text-white/80 placeholder:text-white/25 allow-select" />
            <div className="flex items-center gap-3 px-5 pb-4 text-[11px] text-white/35">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" /> zapisane w Ogrodzie</span>
              <span className="ml-auto font-mono2">{slowa} słów • {n.tresc.length} znaków</span>
            </div>
          </>
        ) : <div className="m-auto opacity-40">Ogród pusty. Zasiej pierwszą myśl.</div>}
      </div>
    </div>
  );
}

/* ================= FALA — muzyka ================= */
const TRACKS = [
  { tytul: "Oddech Zorzy", artysta: "Mira Ensemble", czas: 214, grad: "from-emerald-300 via-teal-400 to-cyan-500" },
  { tytul: "Sól na wietrze", artysta: "Fale Północy", czas: 186, grad: "from-sky-300 via-blue-400 to-indigo-500" },
  { tytul: "Wrzosowisko o 4 rano", artysta: "Sen i Cień", czas: 243, grad: "from-violet-300 via-purple-400 to-fuchsia-500" },
  { tytul: "Bursztynowy Przypływ", artysta: "Ciepłe Maszyny", czas: 197, grad: "from-amber-200 via-orange-400 to-rose-400" },
  { tytul: "Kapsuła do gwiazd", artysta: "Eteronautki", czas: 228, grad: "from-pink-300 via-rose-400 to-orange-300" },
];
function fmt(s: number) { return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`; }

export function FalaApp() {
  const [idx, setIdx] = useState(0);
  const [gra, setGra] = useState(false);
  const [postep, setPostep] = useState(42);
  const [glos, setGlos] = useState(70);
  const [lubiane, setLubiane] = useState<Set<number>>(new Set([0, 2]));
  const t = TRACKS[idx];
  useEffect(() => {
    if (!gra) return;
    const iv = setInterval(() => setPostep((p) => (p + 1 >= t.czas ? 0 : p + 1)), 1000);
    return () => clearInterval(iv);
  }, [gra, idx, t.czas]);
  const bars = useMemo(() => Array.from({ length: 42 }, (_, i) => ({ h: 18 + Math.abs(Math.sin(i * 1.7)) * 82, d: (i % 12) * 0.13 })), []);
  return (
    <div className="h-full flex flex-col md:flex-row">
      <div className="md:w-[290px] shrink-0 p-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/10 bg-white/[0.02]">
        <div className={`w-44 h-44 rounded-[36px] bg-gradient-to-br ${t.grad} relative overflow-hidden shadow-2xl animate-breathe`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.7),transparent_55%)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-black/35 backdrop-blur flex items-center justify-center border border-white/30">
              <div className="w-3.5 h-3.5 rounded-full bg-white/90" />
            </div>
          </div>
          <div className="absolute bottom-2 inset-x-0 flex justify-center gap-[3px] items-end h-8 px-4">
            {bars.slice(0, 24).map((b, i) => (
              <span key={i} className="w-[3px] rounded-full bg-white/80 origin-bottom" style={{ height: `${b.h * 0.35}px`, animation: gra ? `eq 1.1s ease-in-out ${b.d}s infinite` : "none", opacity: gra ? 1 : 0.4 }} />
            ))}
          </div>
        </div>
        <div className="mt-4 text-center">
          <div className="font-display font-semibold text-[15px]">{t.tytul}</div>
          <div className="text-white/45 text-[12px]">{t.artysta}</div>
        </div>
        <div className="w-full mt-4">
          <div className="flex justify-between text-[10px] font-mono2 text-white/40"><span>{fmt(postep)}</span><span>{fmt(t.czas)}</span></div>
          <div className="h-1.5 rounded-full bg-white/10 mt-1 cursor-pointer" onClick={(e) => { const r = (e.target as HTMLDivElement).getBoundingClientRect(); setPostep(Math.floor(((e.clientX - r.left) / r.width) * t.czas)); }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${(postep / t.czas) * 100}%`, background: "linear-gradient(90deg, var(--accent), var(--accent-2))" }} />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button onClick={() => { setIdx((idx + TRACKS.length - 1) % TRACKS.length); setPostep(0); }} className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/12"><SkipBack size={16} /></button>
          <button onClick={() => setGra(!gra)} className="w-12 h-12 rounded-full flex items-center justify-center text-black font-bold" style={{ background: "linear-gradient(130deg, var(--accent), var(--accent-2))", boxShadow: "0 8px 30px -6px var(--accent)" }}>
            {gra ? <Pause size={19} /> : <Play size={19} className="ml-0.5" />}
          </button>
          <button onClick={() => { setIdx((idx + 1) % TRACKS.length); setPostep(0); }} className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/12"><SkipForward size={16} /></button>
        </div>
        <div className="flex items-center gap-2 mt-4 w-full text-white/50">
          <Volume2 size={14} />
          <input type="range" min={0} max={100} value={glos} onChange={(e) => setGlos(+e.target.value)} className="flex-1" />
          <span className="text-[11px] font-mono2 w-8">{glos}</span>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="text-[11px] uppercase tracking-[0.2em] text-white/35 mb-2 font-semibold">Przypływy • playlista dnia</div>
        <div className="space-y-1.5">
          {TRACKS.map((x, i) => (
            <button key={i} onClick={() => { setIdx(i); setPostep(0); setGra(true); }}
              className={`w-full flex items-center gap-3 rounded-2xl p-2.5 border text-left transition-all ${i === idx ? "bg-white/10 border-white/20" : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.07]"}`}>
              <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${x.grad} shrink-0 flex items-center justify-center text-black/60`}>
                {i === idx && gra ? <span className="flex gap-[2px] items-end h-4">{[0, 1, 2].map((k) => <span key={k} className="w-[3px] bg-black/70 rounded-full" style={{ height: "100%", animation: `eq 0.9s ease-in-out ${k * 0.2}s infinite` }} />)}</span> : <Play size={14} className="ml-0.5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-[13px]">{x.tytul}</span>
                <span className="block truncate text-white/40 text-[11px]">{x.artysta}</span>
              </span>
              <span className="font-mono2 text-[11px] text-white/35">{fmt(x.czas)}</span>
              <span onClick={(e) => { e.stopPropagation(); setLubiane((p) => { const n = new Set(p); if (n.has(i)) n.delete(i); else n.add(i); return n; }); }}
                className={`p-1.5 rounded-full ${lubiane.has(i) ? "text-rose-300" : "text-white/25 hover:text-white/60"}`}>
                <Heart size={14} fill={lubiane.has(i) ? "currentColor" : "none"} />
              </span>
            </button>
          ))}
        </div>
        <div className="mt-3 rounded-2xl p-3 bg-gradient-to-r from-white/[0.07] to-transparent border border-white/10 text-[12px] text-white/60 flex items-center gap-2">
          <Sparkles size={14} className="text-[var(--accent)]" /> Mira dobrała te fale do Twojego pulsu: 68 uderzeń na minutę.
        </div>
      </div>
    </div>
  );
}

/* ================= SOCZEWKA — galeria ================= */
const ZDJECIA = [
  { url: "https://images.pexels.com/photos/6906610/pexels-photo-6906610.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", tytul: "Wiśniowy poranek", tag: "ogród" },
  { url: "https://images.pexels.com/photos/6954009/pexels-photo-6954009.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", tytul: "Różany pył", tag: "atelier" },
  { url: "https://images.pexels.com/photos/18809860/pexels-photo-18809860.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", tytul: "Biała cisza", tag: "sen" },
  { url: "https://images.pexels.com/photos/7486413/pexels-photo-7486413.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", tytul: "Fioletowa godzina", tag: "zorza" },
  { url: "https://images.pexels.com/photos/7354707/pexels-photo-7354707.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", tytul: "Liść na talerzu", tag: "ogród" },
  { url: "https://images.pexels.com/photos/7301826/pexels-photo-7301826.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", tytul: "Kula i kwiat", tag: "atelier" },
  { url: "https://images.pexels.com/photos/8166888/pexels-photo-8166888.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", tytul: "Skręt łodygi", tag: "ogród" },
  { url: "https://images.pexels.com/photos/15402790/pexels-photo-15402790.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", tytul: "Mgła w kwiatach", tag: "sen" },
];

export function SoczewkaApp() {
  const [filtr, setFiltr] = useState("wszystko");
  const [ulub, setUlub] = useState<Set<number>>(new Set([1, 3]));
  const [podglad, setPodglad] = useState<number | null>(null);
  const tagi = ["wszystko", "ogród", "atelier", "sen", "zorza", "ulubione"];
  const lista = ZDJECIA.map((z, i) => ({ ...z, i })).filter((z) => filtr === "wszystko" ? true : filtr === "ulubione" ? ulub.has(z.i) : z.tag === filtr);
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 flex-wrap">
        {tagi.map((t) => (
          <button key={t} onClick={() => setFiltr(t)} className={`px-3 py-1 rounded-full text-[11px] font-semibold border capitalize ${filtr === t ? "text-black border-transparent" : "text-white/55 border-white/10 bg-white/[0.04] hover:bg-white/10"}`}
            style={filtr === t ? { background: "linear-gradient(120deg, var(--accent), var(--accent-2))" } : {}}>{t}</button>
        ))}
        <span className="ml-auto text-[11px] text-white/35 font-mono2">{lista.length} świateł</span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
          {lista.map((z) => (
            <button key={z.i} onClick={() => setPodglad(z.i)} className="group relative rounded-2xl overflow-hidden aspect-[4/5] border border-white/10 bg-white/5">
              <img src={z.url} alt={z.tytul} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <span onClick={(e) => { e.stopPropagation(); setUlub((p) => { const n = new Set(p); if (n.has(z.i)) n.delete(z.i); else n.add(z.i); return n; }); }}
                className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur bg-black/30 ${ulub.has(z.i) ? "text-rose-300" : "text-white/60"}`}>
                <Star size={13} fill={ulub.has(z.i) ? "currentColor" : "none"} />
              </span>
              <span className="absolute bottom-0 inset-x-0 p-2.5 text-left">
                <span className="block text-[12px] font-semibold leading-tight">{z.tytul}</span>
                <span className="text-[10px] text-white/55 uppercase tracking-widest">{z.tag}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
      {podglad !== null && (
        <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-xl flex flex-col p-5" onClick={() => setPodglad(null)}>
          <img src={ZDJECIA[podglad].url} alt="" className="max-h-[70%] m-auto rounded-3xl border border-white/20 shadow-2xl object-contain" />
          <div className="text-center mt-3">
            <div className="font-display font-semibold">{ZDJECIA[podglad].tytul}</div>
            <div className="text-white/45 text-[12px]">światło {podglad + 1} z {ZDJECIA.length} • dotknij, by wrócić</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= KAPSUŁA — przeglądarka ================= */
const ZAKLADKI = [
  { id: "start", nazwa: "Przystań", adres: "eter://przystan" },
  { id: "dziennik", nazwa: "Dziennik Eteru", adres: "eter://dziennik/poranny" },
  { id: "atlas", nazwa: "Atlas Czułości", adres: "eter://atlas/miejsc" },
];

export function KapsulaApp({ onOpenApp }: { onOpenApp?: (a: AppId) => void }) {
  const [tab, setTab] = useState("start");
  const [hist, setHist] = useState<string[]>(["start"]);
  const [hi, setHi] = useState(0);
  const [szukaj, setSzukaj] = useState("");
  const idz = (id: string) => { const h = hist.slice(0, hi + 1); h.push(id); setHist(h); setHi(h.length - 1); setTab(id); };
  const karty = [
    { t: "Jak oddycha Mira?", d: "Sekret Jądra i trzech ogrodów", tag: "esej", app: "laboratorium" as AppId },
    { t: "Mapa cichych miejsc", d: "7 adresów bez powiadomień", tag: "atlas", app: "zorza" as AppId },
    { t: "Dźwięki do snu", d: "Fale o częstotliwości serca", tag: "fala", app: "fala" as AppId },
    { t: "Rysuj światłem", d: "Atelier i tryb odbicia", tag: "tworzenie", app: "atelier" as AppId },
  ].filter((k) => (k.t + k.d).toLowerCase().includes(szukaj.toLowerCase()));
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-1.5 px-3 pt-2.5">
        <button onClick={() => hi > 0 && (setHi(hi - 1), setTab(hist[hi - 1]))} className="p-1.5 rounded-full hover:bg-white/10 disabled:opacity-25" disabled={hi === 0}><ArrowLeft size={14} /></button>
        <button onClick={() => hi < hist.length - 1 && (setHi(hi + 1), setTab(hist[hi + 1]))} className="p-1.5 rounded-full hover:bg-white/10 disabled:opacity-25" disabled={hi === hist.length - 1}><ArrowRight size={14} /></button>
        <button onClick={() => idz("start")} className="p-1.5 rounded-full hover:bg-white/10"><RotateCcw size={13} /></button>
        <div className="flex-1 flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/10 px-3.5 py-1.5 text-[12px]">
          <Globe size={13} className="text-[var(--accent)] shrink-0" />
          <span className="font-mono2 text-white/70 truncate">{ZAKLADKI.find((z) => z.id === tab)?.adres}</span>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-300 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" /> szyfrowane oddechem</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-3 mt-2">
        {ZAKLADKI.map((z) => (
          <button key={z.id} onClick={() => idz(z.id)} className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border ${tab === z.id ? "bg-white/12 border-white/20 text-white" : "text-white/45 border-transparent hover:bg-white/5"}`}>{z.nazwa}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {tab === "start" && (
          <div>
            <div className="text-center py-4">
              <div className="font-display text-[22px] font-bold shimmer-text">Dokąd dziś płyniesz?</div>
              <div className="flex items-center gap-2 max-w-md mx-auto mt-3 rounded-full bg-white/[0.06] border border-white/12 px-4 py-2.5">
                <Search size={15} className="opacity-50 shrink-0" />
                <input value={szukaj} onChange={(e) => setSzukaj(e.target.value)} placeholder="Zapytaj Eter… np. sen, światło, cisza" className="bg-transparent w-full text-[13px] placeholder:text-white/30" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-1">
              {karty.map((k, i) => (
                <button key={i} onClick={() => onOpenApp?.(k.app)} className="text-left rounded-3xl p-4 border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] hover:from-white/[0.12] transition-all group">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent)] font-bold">{k.tag}</div>
                  <div className="font-display font-semibold text-[14px] mt-1 group-hover:underline underline-offset-4">{k.t}</div>
                  <div className="text-white/45 text-[12px] mt-0.5">{k.d}</div>
                  <div className="mt-2 text-[11px] text-white/50 flex items-center gap-1">Otwórz w Mirze <ChevronRight size={12} /></div>
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              {["poranek", "praca głęboka", "deszcz", "mapy", "poezja"].map((b) => (
                <span key={b} className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[11px] text-white/55 flex items-center gap-1"><Bookmark size={10} /> {b}</span>
              ))}
            </div>
          </div>
        )}
        {tab === "dziennik" && (
          <article className="max-w-lg mx-auto allow-select">
            <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--accent-2)] font-bold">Dziennik Eteru • wydanie poranne</div>
            <h1 className="font-display text-[22px] font-bold leading-tight mt-2">Koniec ery okien. Początek ery ogrodów.</h1>
            <div className="text-white/40 text-[12px] mt-1">przez Mirę • 6 min dryfu • dziś o świcie</div>
            <div className="h-40 rounded-3xl mt-4 bg-gradient-to-br from-emerald-300 via-teal-300 to-violet-400 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.6),transparent_50%)]" />
              <div className="absolute bottom-3 left-4 font-display font-bold text-black/60 text-[13px]">ilustracja: pierwszy oddech systemu</div>
            </div>
            <p className="mt-4 text-[13.5px] leading-relaxed text-white/75">Przez czterdzieści lat komputery udawały biurka. Blaty, teczki, kosze. Mira udaje coś starszego: <em className="text-white">organizm</em>. Nie otwierasz tu programów — budzisz je. Nie zamykasz okien — pozwalasz im odpłynąć. Każde okno ma puls. Każda przerwa ma sens.</p>
            <p className="mt-3 text-[13.5px] leading-relaxed text-white/60">Jądro pośrodku ekranu nie jest przyciskiem. Jest sercem. Im dłużej pracujesz w skupieniu, tym jaśniej świeci. Gdy się spieszysz — zwalnia, żeby przypomnieć Ci o oddechu.</p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 text-[12.5px] text-white/65 italic">„Nie chcieliśmy szybszego systemu. Chcieliśmy wolniejszego człowieka." — zespół Miry</div>
          </article>
        )}
        {tab === "atlas" && (
          <div className="max-w-lg mx-auto">
            <div className="font-display font-bold text-[18px]">Atlas Czułości</div>
            <div className="text-white/45 text-[12px]">miejsca, gdzie internet szumi ciszej</div>
            <div className="space-y-2 mt-3">
              {[["Latarnia w Rozewiu", "wiatr 14 km/h • 3 ławki • zero zasięgu", "morze"], ["Szklarnia na dachu", "wilgoć 80% • zapach pomidorów", "miasto"], ["Czytelnia pod jaworem", "otwarta do zmierzchu • hamaki", "las"], ["Peron 0 o świcie", "pusty • echo • kawa z automatu", "podróż"]].map(([t, d, tag], i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center shrink-0"><MapPin size={16} className="text-[var(--accent)]" /></span>
                  <span><span className="block font-semibold text-[13px]">{t}</span><span className="block text-white/45 text-[12px]">{d}</span></span>
                  <span className="ml-auto text-[10px] uppercase tracking-widest text-white/30 border border-white/10 rounded-full px-2 py-0.5">{tag}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= GNIAZDO — pliki ================= */
const GNIAZDA = ["Osobiste", "Wspólne", "Nasiona", "Archiwum"];
const PLIKI = [
  { nazwa: "Manifest_Miry.txt", typ: "tekst", rozmiar: "4 KB", gniazdo: "Osobiste", kolor: "#7df9c6" },
  { nazwa: "szkic_zorzy.svg", typ: "obraz", rozmiar: "2,1 MB", gniazdo: "Osobiste", kolor: "#ff9ed2" },
  { nazwa: "nagranie_fali.wav", typ: "dźwięk", rozmiar: "18 MB", gniazdo: "Wspólne", kolor: "#67e8f9" },
  { nazwa: "nasiono_042.md", typ: "tekst", rozmiar: "1 KB", gniazdo: "Nasiona", kolor: "#a3e635" },
  { nazwa: "atlas_snow.mp4", typ: "film", rozmiar: "240 MB", gniazdo: "Archiwum", kolor: "#c4b5fd" },
  { nazwa: "zielnik_2026.pdf", typ: "dokument", rozmiar: "8 MB", gniazdo: "Wspólne", kolor: "#fcd34d" },
  { nazwa: "echo_poranne.mp3", typ: "dźwięk", rozmiar: "6 MB", gniazdo: "Osobiste", kolor: "#fda4af" },
  { nazwa: "konstelacja.png", typ: "obraz", rozmiar: "3,4 MB", gniazdo: "Nasiona", kolor: "#93c5fd" },
  { nazwa: "sen_o_mirze.md", typ: "tekst", rozmiar: "2 KB", gniazdo: "Nasiona", kolor: "#7df9c6" },
];

export function GniazdoApp() {
  const [gniazdo, setGniazdo] = useState("Osobiste");
  const [widok, setWidok] = useState<"grid" | "list">("grid");
  const [szukaj, setSzukaj] = useState("");
  const pliki = PLIKI.filter((p) => p.gniazdo === gniazdo && p.nazwa.toLowerCase().includes(szukaj.toLowerCase()));
  return (
    <div className="h-full flex text-[13px]">
      <div className="w-[170px] shrink-0 border-r border-white/10 p-3 space-y-1 bg-white/[0.02]">
        <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold px-2 pb-1">Gniazda</div>
        {GNIAZDA.map((g) => (
          <button key={g} onClick={() => setGniazdo(g)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-2xl text-[12.5px] font-semibold ${gniazdo === g ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5"}`}>
            <FolderOpen size={14} className={gniazdo === g ? "text-[var(--accent)]" : "opacity-60"} /> {g}
            <span className="ml-auto text-[10px] font-mono2 opacity-40">{PLIKI.filter((p) => p.gniazdo === g).length}</span>
          </button>
        ))}
        <div className="pt-3 px-1">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <div className="text-[11px] font-semibold">Spiżarnia światła</div>
            <div className="h-1.5 rounded-full bg-white/10 mt-2"><div className="h-full w-[38%] rounded-full" style={{ background: "linear-gradient(90deg, var(--accent), var(--accent-2))" }} /></div>
            <div className="text-[10px] text-white/40 mt-1.5 font-mono2">48 GB z 128 GB</div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 px-4 pt-3">
          <span className="text-white/30 text-[12px]">gniazdo /</span><span className="font-display font-semibold text-[14px]">{gniazdo}</span>
          <span className="ml-auto flex items-center gap-1.5">
            <span className="flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 py-1"><Search size={12} className="opacity-50" /><input value={szukaj} onChange={(e) => setSzukaj(e.target.value)} placeholder="Szukaj…" className="bg-transparent w-20 text-[12px] placeholder:text-white/30" /></span>
            <button onClick={() => setWidok(widok === "grid" ? "list" : "grid")} className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10">{widok === "grid" ? <List size={13} /> : <LayoutGrid size={13} />}</button>
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {widok === "grid" ? (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2.5">
              {pliki.map((p, i) => (
                <div key={i} className="rounded-3xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] p-3.5 text-center transition-all cursor-pointer group">
                  <div className="w-11 h-11 mx-auto rounded-2xl flex items-center justify-center font-display font-bold text-black/70 text-[15px]" style={{ background: `linear-gradient(135deg, ${p.kolor}, ${p.kolor}88)` }}>{p.nazwa[0].toUpperCase()}</div>
                  <div className="mt-2 text-[11.5px] font-semibold truncate">{p.nazwa}</div>
                  <div className="text-[10px] text-white/35 font-mono2">{p.typ} • {p.rozmiar}</div>
                </div>
              ))}
              {pliki.length === 0 && <div className="col-span-full text-center py-10 text-white/30">Puste gniazdo. Cisza też jest treścią.</div>}
            </div>
          ) : (
            <div className="space-y-1">
              {pliki.map((p, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.07]">
                  <span className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-black/70 text-[13px] shrink-0" style={{ background: p.kolor }}>{p.nazwa[0].toUpperCase()}</span>
                  <span className="font-semibold text-[12.5px] truncate">{p.nazwa}</span>
                  <span className="ml-auto text-[11px] text-white/35 font-mono2 shrink-0">{p.rozmiar}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= SZEPT — terminal ================= */
export function SzeptApp({ onOpenApp, notify }: { onOpenApp?: (a: AppId) => void; notify?: (t: string, b: string) => void }) {
  const [linie, setLinie] = useState<{ kto: string; tekst: string }[]>([
    { kto: 'mira', tekst: 'Jestem Szept. Nie krzycze poleceniami - slucham. Napisz: pomoc, a opowiem Ci, co potrafie.' },
    { kto: 'mira', tekst: 'Sprobuj: mantra | czas | pogoda | otworz ogrod | zart | kim jestes' },
  ]);
  const [wpis, setWpis] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [hi, setHi] = useState(-1);
  const dół = useRef<HTMLDivElement>(null);
  useEffect(() => { dół.current?.scrollIntoView({ behavior: "smooth" }); }, [linie]);
  const mantry = ["Oddychaj. Fala wróci.", "Mniej znaczy głębiej.", "Światło pamięta Twoje imię.", "Zasiej dziś jedną ciszę."];
  const wykonaj = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    const nowe = [...linie, { kto: "ty", tekst: raw }];
    const mira = (tekst: string) => setLinie([...nowe, { kto: "mira", tekst }]);
    if (cmd === "pomoc") mira("• czas / data — pytaj o chwilę\n• mantra — losowa myśl na dziś\n• pogoda — szept o niebie\n• otwórz [ogród fala soczewka kapsuła gniazdo atelier zorza laboratorium]\n• echa — wyślij sobie znak\n• wyczyść — wymieć ciszę");
    else if (cmd === "czas") mira(`Jest ${new Date().toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}. Dokładnie tyle, ile potrzebujesz.`);
    else if (cmd === "data") mira(new Date().toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + ". Dobry dzień, by coś zacząć.");
    else if (cmd === "mantra") mira(mantry[Math.floor(Math.random() * mantry.length)]);
    else if (cmd === "pogoda") mira("Nad Mirą: zorza 12°, wiatr pachnie deszczem. W Twoim mieście: dokładnie taka pogoda, na jaką masz ochotę.");
    else if (cmd === "kim jesteś" || cmd === "kim jestes") mira("Jestem Mira — system, który oddycha. Nie mam pulpitu. Mam ogród, rzekę i jądro. A Ty masz mnie.");
    else if (cmd === "żart" || cmd === "zart") mira("Dlaczego okno poszło na terapię? Bo miało za dużo ramek. Ja ramek nie mam. Jestem wolna.");
    else if (cmd === "wyczyść" || cmd === "wyczysc" || cmd === "clear") { setLinie([]); setWpis(""); return; }
    else if (cmd === "echa") { notify?.("Szept wysłuchał Cię", "Twoje słowa odbiły się echem w Rzece."); mira("Wysłałam echo do Rzeki. Posłuchaj, jak wraca."); }
    else if (cmd.startsWith("otwórz ") || cmd.startsWith("otworz ")) {
      const nazwa = cmd.replace("otwórz ", "").replace("otworz ", "").trim();
      const znalezione = (Object.keys(APPS) as AppId[]).find((k) => k === nazwa || APPS[k].nazwa.toLowerCase() === nazwa);
      if (znalezione) { mira(`Budzę ${APPS[znalezione].nazwa}…`); setTimeout(() => onOpenApp?.(znalezione), 600); }
      else mira(`Nie znam takiego miejsca jak „${nazwa}". Znam: ${Object.keys(APPS).join(", ")}.`);
    }
    else mira(`Hmm… „${raw}" brzmi jak początek wiersza. Napisz „pomoc", a pokażę Ci język, który rozumiem najlepiej.`);
    setHist((h) => [raw, ...h]); setHi(-1); setWpis("");
  };
  return (
    <div className="h-full flex flex-col bg-[#080a14]/60 font-mono2 text-[12.5px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 allow-select">
        {linie.map((l, i) => (
          <div key={i} className={l.kto === "ty" ? "text-right" : ""}>
            {l.kto === "ty"
              ? <span className="inline-block max-w-[85%] rounded-2xl rounded-br-md px-3.5 py-2 text-black font-medium whitespace-pre-wrap" style={{ background: "linear-gradient(120deg, var(--accent), var(--accent-2))" }}>{l.tekst}</span>
              : <div className="flex gap-2.5"><span className="w-6 h-6 rounded-full orb-core shrink-0 mt-0.5" /><span className="inline-block max-w-[88%] rounded-2xl rounded-tl-md px-3.5 py-2 bg-white/[0.06] border border-white/10 text-white/80 whitespace-pre-wrap leading-relaxed">{l.tekst}</span></div>}
          </div>
        ))}
        <div ref={dół} />
      </div>
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-2 rounded-full bg-white/[0.05] border border-white/12 px-4 py-2.5">
          <Command size={14} className="text-[var(--accent)] shrink-0" />
          <input value={wpis} onChange={(e) => setWpis(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") wykonaj(wpis);
              if (e.key === "ArrowUp") { e.preventDefault(); if (hist.length) { const n = Math.min(hi + 1, hist.length - 1); setHi(n); setWpis(hist[n]); } }
              if (e.key === "ArrowDown") { e.preventDefault(); if (hi > 0) { setHi(hi - 1); setWpis(hist[hi - 1]); } else { setHi(-1); setWpis(""); } }
            }}
            placeholder="Szepnij coś…" className="bg-transparent w-full placeholder:text-white/25 text-white/90" autoFocus />
          <button onClick={() => wykonaj(wpis)} className="p-1.5 rounded-full text-black shrink-0" style={{ background: "linear-gradient(120deg, var(--accent), var(--accent-2))" }}><Send size={13} /></button>
        </div>
      </div>
    </div>
  );
}

/* ================= ATELIER — rysowanie ================= */
const PEDZLE = ["#7df9c6", "#ff9ed2", "#a78bfa", "#fcd34d", "#67e8f9", "#ffffff", "#0b0e1e"];

export function AtelierApp() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [kolor, setKolor] = useState("#7df9c6");
  const [rozmiar, setRozmiar] = useState(6);
  const [gumka, setGumka] = useState(false);
  const [odbicie, setOdbicie] = useState(true);
  const rysuje = useRef(false);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const r = c.getBoundingClientRect();
    c.width = r.width * 2; c.height = r.height * 2;
    ctx.scale(2, 2);
    ctx.fillStyle = "#0a0c18"; ctx.fillRect(0, 0, r.width, r.height);
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    for (let x = 0; x < r.width; x += 28) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, r.height); ctx.stroke(); }
  }, []);
  const poz = (e: React.PointerEvent) => { const c = ref.current!; const r = c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height }; };
  const kreska = (x0: number, y0: number, x1: number, y1: number) => {
    const c = ref.current; if (!c) return; const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.strokeStyle = gumka ? "#0a0c18" : kolor;
    ctx.lineWidth = gumka ? rozmiar * 3 : rozmiar;
    ctx.shadowBlur = gumka ? 0 : 12; ctx.shadowColor = gumka ? "transparent" : kolor;
    const seg = (ax: number, ay: number, bx: number, by: number) => { ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); };
    seg(x0, y0, x1, y1);
    if (odbicie) {
      const r = c.getBoundingClientRect();
      seg(r.width - x0, y0, r.width - x1, y1);
    }
    ctx.shadowBlur = 0;
  };
  const ost = useRef<{ x: number; y: number } | null>(null);
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/10 flex-wrap">
        <div className="flex gap-1.5">
          {PEDZLE.map((k) => (
            <button key={k} onClick={() => { setKolor(k); setGumka(false); }} className={`w-6 h-6 rounded-full border-2 ${kolor === k && !gumka ? "border-white scale-110" : "border-white/20"}`} style={{ background: k, boxShadow: kolor === k ? `0 0 12px ${k}` : "none" }} />
          ))}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-white/50">
          <span className="font-mono2">{rozmiar}px</span>
          <input type="range" min={1} max={30} value={rozmiar} onChange={(e) => setRozmiar(+e.target.value)} className="w-20" />
        </div>
        <button onClick={() => setGumka(!gumka)} className={`p-2 rounded-full border ${gumka ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/60"}`}><Eraser size={14} /></button>
        <button onClick={() => setOdbicie(!odbicie)} className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border flex items-center gap-1 ${odbicie ? "text-black border-transparent" : "text-white/55 border-white/10 bg-white/5"}`} style={odbicie ? { background: "linear-gradient(120deg, var(--accent), var(--accent-2))" } : {}}>
          <Sparkles size={12} /> Odbicie {odbicie ? "żyje" : "śpi"}
        </button>
        <span className="ml-auto flex gap-1.5">
          <button onClick={() => { const c = ref.current; if (!c) return; const ctx = c.getContext("2d"); const r = c.getBoundingClientRect(); ctx!.fillStyle = "#0a0c18"; ctx!.fillRect(0, 0, r.width, r.height); }} className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-white/5 border border-white/10 hover:bg-white/10">Wymieć</button>
          <button onClick={() => { const c = ref.current; if (!c) return; const a = document.createElement("a"); a.download = "atelier-mira.png"; a.href = c.toDataURL(); a.click(); }} className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-black flex items-center gap-1" style={{ background: "linear-gradient(120deg, var(--accent), var(--accent-2))" }}><Download size={12} /> Zachowaj</button>
        </span>
      </div>
      <div className="flex-1 p-3">
        <canvas ref={ref}
          className="w-full h-full rounded-3xl border border-white/10 cursor-crosshair touch-none"
          style={{ background: "#0a0c18" }}
          onPointerDown={(e) => { rysuje.current = true; (e.target as HTMLElement).setPointerCapture(e.pointerId); ost.current = poz(e); }}
          onPointerMove={(e) => { if (!rysuje.current) return; const p = poz(e); if (ost.current) kreska(ost.current.x, ost.current.y, p.x, p.y); ost.current = p; }}
          onPointerUp={() => { rysuje.current = false; ost.current = null; }}
          onPointerLeave={() => { rysuje.current = false; ost.current = null; }}
        />
      </div>
    </div>
  );
}

/* ================= ZORZA — pogoda i czas ================= */
export function ZorzaApp() {
  const [miasto, setMiasto] = useState(0);
  const miasta = [
    { nazwa: "Gdańsk", temp: 12, opis: "Zorza na horyzoncie", wiatr: 14, wilg: 72, ikona: "✦" },
    { nazwa: "Kraków", temp: 15, opis: "Miękkie słońce", wiatr: 8, wilg: 58, ikona: "☀" },
    { nazwa: "Warszawa", temp: 13, opis: "Pierzaste chmury", wiatr: 11, wilg: 64, ikona: "☁" },
    { nazwa: "Wrocław", temp: 16, opis: "Ciepły nurt", wiatr: 6, wilg: 51, ikona: "☀" },
    { nazwa: "Zakopane", temp: 4, opis: "Śnieg i cisza", wiatr: 22, wilg: 88, ikona: "❄" },
  ];
  const m = miasta[miasto];
  const godziny = Array.from({ length: 12 }, (_, i) => ({ h: (new Date().getHours() + i) % 24, t: m.temp + Math.round(Math.sin(i * 0.9) * 3) }));
  const dni = ["PN", "WT", "ŚR", "CZ", "PT", "SB", "ND"];
  const dzis = new Date();
  const pierwszy = new Date(dzis.getFullYear(), dzis.getMonth(), 1);
  const startOffset = (pierwszy.getDay() + 6) % 7;
  const dniMies = new Date(dzis.getFullYear(), dzis.getMonth() + 1, 0).getDate();
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="rounded-[28px] p-5 relative overflow-hidden border border-white/10" style={{ background: "linear-gradient(140deg, rgba(125,249,198,0.18), rgba(167,139,250,0.22), rgba(255,158,210,0.16))" }}>
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {miasta.map((x, i) => <button key={i} onClick={() => setMiasto(i)} className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${i === miasto ? "bg-black/40 border-white/30 text-white" : "bg-white/10 border-white/10 text-white/60"}`}>{x.nazwa}</button>)}
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="font-display text-[52px] leading-none font-bold">{m.temp}°</div>
            <div className="font-semibold mt-1">{m.opis}</div>
            <div className="text-white/55 text-[12px] flex items-center gap-3 mt-1.5"><span className="flex items-center gap-1"><Wind size={12} /> {m.wiatr} km/h</span><span className="flex items-center gap-1"><Droplets size={12} /> {m.wilg}%</span><span className="flex items-center gap-1"><MapPin size={12} /> {m.nazwa}</span></div>
          </div>
          <div className="text-[64px] leading-none animate-floaty">{m.ikona}</div>
        </div>
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
          {godziny.map((g, i) => (
            <div key={i} className={`shrink-0 w-[52px] rounded-2xl py-2 text-center border ${i === 0 ? "bg-black/30 border-white/25" : "bg-white/10 border-white/10"}`}>
              <div className="text-[10px] font-mono2 opacity-60">{String(g.h).padStart(2, "0")}:00</div>
              <div className="font-bold text-[13px] mt-0.5">{g.t}°</div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-3 mt-3">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2 font-display font-semibold text-[13px]"><CalendarDays size={14} className="text-[var(--accent)]" /> {dzis.toLocaleDateString("pl-PL", { month: "long", year: "numeric" })}</div>
          <div className="grid grid-cols-7 gap-1 mt-3 text-center text-[11px]">
            {dni.map((d) => <span key={d} className="text-white/30 font-bold text-[10px]">{d}</span>)}
            {Array.from({ length: startOffset }).map((_, i) => <span key={`p${i}`} />)}
            {Array.from({ length: dniMies }).map((_, i) => (
              <span key={i} className={`py-1.5 rounded-full ${i + 1 === dzis.getDate() ? "text-black font-bold" : "text-white/60"}`} style={i + 1 === dzis.getDate() ? { background: "linear-gradient(120deg, var(--accent), var(--accent-2))" } : {}}>{i + 1}</span>
            ))}
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2 font-display font-semibold text-[13px]"><Clock size={14} className="text-[var(--accent-2)]" /> Rytm dnia</div>
          <div className="space-y-2 mt-3">
            {[["07:30", "Pierwszy oddech + Ogród", true], ["12:00", "Fala w południe", false], ["17:04", "Złota godzina — Atelier", false], ["21:30", "Sen • wyciszenie Miry", false]].map(([g, t, on], i) => (
              <div key={i} className={`flex items-center gap-3 rounded-2xl px-3 py-2 border ${on ? "bg-white/10 border-white/20" : "bg-white/[0.03] border-white/[0.07]"}`}>
                <span className="font-mono2 text-[11px] text-[var(--accent)]">{g}</span>
                <span className="text-[12px]">{t}</span>
                {on ? <span className="ml-auto w-2 h-2 rounded-full bg-emerald-300 animate-pulse" /> : <Check size={12} className="ml-auto opacity-20" />}
              </div>
            ))}
          </div>
          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-widest text-white/35 font-bold mb-1.5">Puls dnia</div>
            <div className="h-2 rounded-full bg-white/10 relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(dzis.getHours() / 24) * 100}%`, background: "linear-gradient(90deg, var(--accent), var(--accent-2), var(--accent-3))" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= LABORATORIUM — ustawienia ================= */
export function LaboratoriumApp(props: {
  accent: number; setAccent: (i: number) => void;
  wallpaper: number; setWallpaper: (i: number) => void;
  glow: number; setGlow: (v: number) => void;
  grain: number; setGrain: (v: number) => void;
  jasnosc: number; setJasnosc: (v: number) => void;
  glos: number; setGlos: (v: number) => void;
  wifi: boolean; setWifi: (v: boolean) => void;
  skupienie: boolean; setSkupienie: (v: boolean) => void;
  onReset: () => void;
}) {
  const p = props;
  const Sekcja = ({ t, children }: { t: string; children: React.ReactNode }) => (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
      <div className="font-display font-semibold text-[13px] mb-3">{t}</div>
      {children}
    </div>
  );
  const Prz = ({ label, val, on, hint }: { label: string; val: boolean; on: (v: boolean) => void; hint?: string }) => (
    <button onClick={() => on(!val)} className="w-full flex items-center gap-3 py-2 text-left">
      <span className={`w-10 h-[22px] rounded-full p-[3px] transition-all shrink-0 ${val ? "" : "bg-white/15"}`} style={val ? { background: "linear-gradient(120deg, var(--accent), var(--accent-2))" } : {}}>
        <span className={`block w-4 h-4 rounded-full bg-white transition-all ${val ? "ml-auto" : ""}`} />
      </span>
      <span><span className="block text-[12.5px] font-semibold">{label}</span>{hint && <span className="block text-[11px] text-white/40">{hint}</span>}</span>
    </button>
  );
  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      <div className="rounded-[24px] p-5 border border-white/10 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08), transparent)" }}>
        <div className="font-display font-bold text-[16px]">Laboratorium</div>
        <div className="text-white/50 text-[12px]">Przestrajaj Mirę jak instrument. Każda zmiana brzmi inaczej.</div>
        <div className="flex gap-2 mt-3">
          {[["MIRA OS", "Oddech 1.0"], ["Jądro", "tętni 62/min"], ["Ogrody", "3 aktywne"]].map(([a, b], i) => (
            <span key={i} className="rounded-2xl bg-black/25 border border-white/10 px-3 py-1.5"><span className="block text-[11px] font-bold">{a}</span><span className="block text-[10px] text-white/45 font-mono2">{b}</span></span>
          ))}
        </div>
      </div>
      <Sekcja t="Barwa oddechu">
        <div className="grid grid-cols-5 gap-2">
          {ACCENTS.map((a, i) => (
            <button key={a.id} onClick={() => p.setAccent(i)} className={`rounded-2xl p-2 border text-center ${p.accent === i ? "border-white/40 bg-white/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]"}`}>
              <span className="block h-8 rounded-xl" style={{ background: `linear-gradient(135deg, ${a.c1}, ${a.c2}, ${a.c3})` }} />
              <span className="block text-[10px] font-semibold mt-1.5">{a.nazwa}</span>
            </button>
          ))}
        </div>
      </Sekcja>
      <Sekcja t="Krajobraz">
        <div className="grid grid-cols-2 gap-2">
          {WALLPAPERS.map((w) => (
            <button key={w.id} onClick={() => p.setWallpaper(w.id)} className={`rounded-2xl p-1 border text-left ${p.wallpaper === w.id ? "border-white/40" : "border-white/10"}`}>
              <span className={`block h-14 rounded-xl wp-${w.id} border border-white/10`} />
              <span className="block px-2 py-1.5"><span className="block text-[11.5px] font-bold">{w.nazwa}</span><span className="block text-[10px] text-white/40">{w.opis}</span></span>
            </button>
          ))}
        </div>
        <div className="mt-3 space-y-2.5">
          {[["Poświata", p.glow, p.setGlow, "jak mocno Mira świeci"], ["Ziarnistość", p.grain, p.setGrain, "filmowa faktura powietrza"], ["Jasność", p.jasnosc, p.setJasnosc, "oddech światła"], ["Głośność Eteru", p.glos, p.setGlos, "szum tła"]].map(([label, val, set, hint]: any, i) => (
            <div key={i}>
              <div className="flex justify-between text-[12px]"><span className="font-semibold">{label}</span><span className="font-mono2 text-white/40">{Math.round(val * 100)}%</span></div>
              <div className="text-[10.5px] text-white/35 mb-1">{hint}</div>
              <input type="range" min={0} max={100} value={Math.round(val * 100)} onChange={(e) => set(+e.target.value / 100)} className="w-full" />
            </div>
          ))}
        </div>
      </Sekcja>
      <Sekcja t="Nurt i cisza">
        <Prz label="Eter (sieć)" val={p.wifi} on={p.setWifi} hint={p.wifi ? "połączona • 480 Mb/s • pachnie deszczem" : "rozłączona • tryb offline • tylko Ty i Mira"} />
        <Prz label="Tryb skupienia" val={p.skupienie} on={p.setSkupienie} hint="wycisza echa, przyciemnia Rzekę" />
      </Sekcja>
      <button onClick={p.onReset} className="w-full rounded-2xl border border-rose-300/20 bg-rose-400/10 py-2.5 text-[12px] font-semibold text-rose-200 hover:bg-rose-400/20">Uśpij wszystko i zacznij oddech od nowa</button>
      <div className="text-center text-[10.5px] text-white/25 pb-2 font-mono2">MIRA OS „Oddech" • zaprojektowana, by nikt jej nie pomylił z niczym • MMXXVI</div>
    </div>
  );
}

/* helper do podglądu miniatur */
export function AppIcon({ id, size = 40 }: { id: AppId; size?: number }) {
  const m = APPS[id];
  const I = m.ikona;
  return (
    <span className={`rounded-2xl bg-gradient-to-br ${m.gradient} flex items-center justify-center text-black/70 shrink-0`} style={{ width: size, height: size, boxShadow: `0 6px 24px -6px ${m.glow}` }}>
      <I size={size * 0.5} strokeWidth={2.2} />
    </span>
  );
}
