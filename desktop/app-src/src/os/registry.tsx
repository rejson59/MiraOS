import type { LucideIcon } from "lucide-react";

export type AppId =
  | "ogrod" | "fala" | "soczewka" | "kapsula" | "gniazdo"
  | "szept" | "atelier" | "zorza" | "laboratorium";

export type GardenId = "skupienie" | "tworzenie" | "sen";

export interface Okno {
  id: string;
  appId: AppId;
  x: number; y: number; w: number; h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  garden: GardenId;
}

export interface Echo {
  id: string;
  title: string;
  body: string;
  icon: string;
  time: string;
  accent?: string;
}

export interface AppMeta {
  id: AppId;
  nazwa: string;
  podtytul: string;
  opis: string;
  ikona: LucideIcon;
  gradient: string;
  glow: string;
  skrot: string;
}

export const APPS: Record<AppId, AppMeta> = {} as Record<AppId, AppMeta>;

export const APP_LIST: AppMeta[] = [];

export const GARDENS: Record<GardenId, { nazwa: string; opis: string; kolor: string; ikona: string }> = {
  skupienie: { nazwa: "Skupienie", opis: "cisza • głębia • jeden nurt", kolor: "#7df9c6", ikona: "◉" },
  tworzenie: { nazwa: "Tworzenie", opis: "iskry • próby • rozkwit", kolor: "#ff9ed2", ikona: "✦" },
  sen: { nazwa: "Sen", opis: "półmrok • echo • odpoczynek", kolor: "#a78bfa", ikona: "☾" },
};

export const MANTRY = [
  "Oddychaj. System oddycha z Tobą.",
  "Mniej okien. Więcej przestrzeni.",
  "Każda fala kiedyś wraca do brzegu.",
  "Porządek to też forma czułości.",
  "Światło potrzebuje ciemności, by błyszczeć.",
  "Zasiej dziś jedną małą myśl.",
];

export const ACCENTS = [
  { id: "zorza", nazwa: "Zorza", c1: "#7df9c6", c2: "#ff9ed2", c3: "#a78bfa" },
  { id: "bursztyn", nazwa: "Bursztyn", c1: "#fcd34d", c2: "#fb923c", c3: "#f472b6" },
  { id: "ocean", nazwa: "Głębia", c1: "#67e8f9", c2: "#60a5fa", c3: "#34d399" },
  { id: "wrzos", nazwa: "Wrzos", c1: "#c4b5fd", c2: "#f0abfc", c3: "#7df9c6" },
  { id: "koral", nazwa: "Koral", c1: "#fda4af", c2: "#fb923c", c3: "#facc15" },
];

export const WALLPAPERS = [
  { id: 0, nazwa: "Pierwszy Oddech", opis: "zorza nad fiordem ciszy" },
  { id: 1, nazwa: "Żar Ogrodu", opis: "bursztynowy zmierzch" },
  { id: 2, nazwa: "Głębia", opis: "oceaniczna medytacja" },
  { id: 3, nazwa: "Fioletowa Mgła", opis: "senne wrzosowisko" },
];

export function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function teraz(): string {
  const d = new Date();
  return d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
}

export function powitanie(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 10) return "Dzień dobry, Wędrowcze";
  if (h >= 10 && h < 18) return "Witaj w nurcie dnia";
  if (h >= 18 && h < 22) return "Dobry wieczór, Wędrowcze";
  return "Cicha noc sprzyja myślom";
}

export const FAKE_FILES = [
  { nazwa: "Manifest_Miry.txt", typ: "tekst", rozmiar: "4 KB", gniazdo: "Osobiste" },
  { nazwa: "szkic_zorzy.svg", typ: "obraz", rozmiar: "2,1 MB", gniazdo: "Osobiste" },
  { nazwa: "nagranie_fali.wav", typ: "dźwięk", rozmiar: "18 MB", gniazdo: "Wspólne" },
  { nazwa: "nasiono_042.md", typ: "tekst", rozmiar: "1 KB", gniazdo: "Nasiona" },
  { nazwa: "atlas_snow.mp4", typ: "film", rozmiar: "240 MB", gniazdo: "Archiwum" },
  { nazwa: "zielnik_2026.pdf", typ: "dokument", rozmiar: "8 MB", gniazdo: "Wspólne" },
  { nazwa: "echo_poranne.mp3", typ: "dźwięk", rozmiar: "6 MB", gniazdo: "Osobiste" },
  { nazwa: "konstelacja.png", typ: "obraz", rozmiar: "3,4 MB", gniazdo: "Nasiona" },
];
