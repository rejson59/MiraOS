# MiraOS dla Windows — natywna aplikacja `.exe`

**MiraOS.exe** zamienia cały ekran komputera w MiraOS — „system, który oddycha".
Zbudowany na podstawie przykładu `unique-operating-system-interface.zip`, opakowany
w natywną powłokę Neutralino (WebView2/Chromium).

## v1.3 — Mira żyje prawdziwym życiem

- **Głośność na serio**: suwak „Głośność Eteru" w Strojeniu ustawia głośność Windows.
- **Prawdziwa bateria i WiFi** na górnej wyspie (nazwa sieci, % baterii, ⚡ przy ładowaniu).
- **Dźwięki Miry**: akord przy obudzeniu z blokady, cichy „ping" powiadomień (synteza, offline).
- **Przypinanie aplikacji do Rzeki**: prawy przycisk na kafelku w „Wszystkich aplikacjach".
- **Frequent-first**: Jądro sortuje aplikacje po tym, jak często je uruchamiasz.
- **Zasilanie**: uśpij / restart / wyłącz — z potwierdzeniem (ekran wyjścia i szukajka).
- **Zapamiętywany wygląd Miry**: akcent, krajobraz i jasność wracają po restarcie.
- **Auto-blokada** po 10 minutach bezczynności (opcja w panelu ✦).

## Szybki start

1. Rozpakuj `MiraOS-1.0.0-windows-x64.zip` w dowolnym miejscu (np. `C:\MiraOS`).
2. Uruchom **`MiraOS.exe`**.
3. Mira przejdzie sekwencję boot → ekran blokady → pulpit. Kliknij godzinę, aby „obudzić" system.

**Wymagania:** Windows 10/11 x64 + **Microsoft Edge WebView2 Runtime**
(Win11 ma go zawsze; na starszych Win10 pobierzesz go za darmo ze strony Microsoftu —
MiraOS wykorzysta go automatycznie).

## Co się dzieje przy pierwszym uruchomieniu

MiraOS przejmuje wygląd Windowsa (dokładnie tak, jak chcesz — „jakby to nie był Windows"):

- **ciemny motyw** Windows (aplikacje i powłoka),
- **akcent zorzy**: paleta mięta → róż → fiolet (pasek zadań, menu Start, podświetlenia),
- **tapeta MiraOS** (zorza nad fiordem ciszy) na pulpicie Windows,
- **autostart**: MiraOS uruchamia się razem z systemem.

Wszystkie zmiany dotyczą tylko Twojego konta (rejestr HKCU) i są **w pełni odwracalne**:
karta **✦** (prawy dolny róg MiraOS) → **„Przywróć domyślne"** (albo ręcznie: `resources\scripts\restore-defaults.bat`).
Tapetę cofniesz w: *Ustawienia → Personalizacja → Tło*.

## Sterowanie w MiraOS

| Akcja | Jak |
|---|---|
| Pełny ekran (Windows znika całkiem) | **F11** |
| Wyjście z MiraOS | **Ctrl+Alt+Q** |
| Wyszukiwanie („Zapytaj Mirę") | **`/`** lub **Ctrl+K** |
| Konstelacja aplikacji („Jądro") | podwójne kliknięcie na tle |
| Menu kontekstowe | prawy przycisk myszy |
| przełączanie ogrodów / aplikacji | Rzeka (dolny dok) i Jądro |

### Karta „System MiraOS" (✦, prawy dolny róg)

- **Autostart z Windows** — włącz/wyłącz,
- **Motyw Mira dla Windows** — zastosuj ponownie paletę i ciemny motyw,
- **Tapeta MiraOS** — ustaw ponownie,
- **Przywróć domyślne** — cofnij integrację,
- sygnowany znak wodny `MiraOS 1.2 • NATIVE/WIN64` w lewym dolnym rogu.

## Jak to zbudowano (100% offline, bez zaufania zewnętrznym binarkom)

Komponenty i pochodzenie:

| Element | Skąd |
|---|---|
| Interfejs MiraOS | Twój przykład z `unique-operating-system-interface.zip` (React/Vite/Tailwind) + branding „MiraOS" |
| Czcionki (Unbounded, Space Grotesk, JetBrains Mono) | oficjalne paczki `@fontsource` (npm), wbudowane w HTML — działa bez internetu |
| Powłoka okna ( Neutralino v6.9.0, lic. MIT) | **skompilowana ze źródeł** w tym repozytorium (`desktop/neutralino/build-miraos.sh`) — kompilator Zig (target `x86_64-windows-gnu`), linkowana statycznie z Microsoft **WebView2LoaderStatic.lib** |
| Ikona i tapeta | wygenerowane w stylu MiraOS (AI) |
| Integracja z Windows | skrypty `.bat`/`.ps1` w `resources/scripts` (rejestr HKCU + `SystemParametersInfo`) |

Odbuduj sam:

```bash
cd desktop/neutralino && ./build-miraos.sh      # MiraOS-raw.exe (Windows x64)
cd desktop/app-src    && npx vite build         # interfejs -> desktop/resources/index.html
cd desktop            && node tools/assemble.mjs  # składa desktop/app
```

## Struktura

```
desktop/
├── app/                        # GOTOWA APLIKACJA (uruchamiaj MiraOS.exe)
│   ├── MiraOS.exe
│   ├── neutralino.config.json
│   └── resources/              # interfejs + skrypty integracji + ikony + tapeta
├── app-src/                    # źródła interfejsu (z Twojego zipa) + mira-win.js
├── neutralino/                 # źródła Neutralino + skrypt budowy .exe
├── tools/                      # czcionki offline, składanie, pobieranie fontów
└── dist/                       # paczka ZIP do pobrania
```

## Licencje i podziękowania

- NeutralinoJS — MIT License © Neutralinojs and contributors
- React / Vite / Tailwind — licencje open source ich autorów
- Czcionki Google (Unbounded, Space Grotesk, JetBrains Mono) — SIL Open Font License
- Ikona i tapeta — wygenerowane na potrzeby MiraOS

*System, który oddycha — teraz także na Twoim pulpicie.* ✦

---

## Prawdziwe aplikacje w Mirze (v1.1/v1.2)

Przy pierwszym otwarciu Jądra Mira **skanuje Menu Start** i pokazuje **Twoje zainstalowane
aplikacje z prawdziwymi ikonkami**:

- **zewnętrzny pierścień Jądra** — 14 najczęstszych aplikacji; klik = uruchomienie,
- **„Wszystkie aplikacje (N)"** — szklana siatka z wyszukiwarką (również aplikacje ze Sklepu/UWP),
- lista i ikonki trzymane w `%APPDATA%\MiraOS` (`apps.json` + `icons\`); odświeżenie kartą ✦.

## Szkło — zaokrąglone okna całego systemu (v1.1)

W tle działa klocek DWM (`round-windows.ps1`), który **każdemu oknu w Windows 11**
(Chrome, Spotify, Eksplorator…) nadaje zaokrąglone narożniki i mintową obwódkę MiraOS,
również nowo otwartym oknom. Wyłączysz to kartą ✦ → „Szkło: zaokrąglone okna".
(W Windows 10 DWM nie wspiera zaokrągleń — wrażenie szkła daje tam ciemny motyw i akcent.)

## Sumy kontrolne (SHA-256) — do weryfikacji integralności

```
MiraOS.exe                          c1cf522306437c3c47144002ad9428c2a5582da8824999b5d56096b30e1b0acc
MiraOS-1.3.0-windows-x64.zip        5c07f77468c4cbcfb215ef32a6dfa522d93a4947f81e9a2cac0f173292be2a65
```
