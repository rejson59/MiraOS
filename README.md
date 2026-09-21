# MiraOS

**System, który oddycha.** Organiczny interfejs systemu operacyjnego — projekt koncepcyjny
i natywna aplikacja dla Windows.

## Zawartość repozytorium

| Ścieżka | Opis |
|---|---|
| `unique-operating-system-interface.zip` | oryginalny przykład: interfejs MiraOS (React + Vite + Tailwind) |
| `extracted/` | rozpakowany przykład |
| `desktop/` | **MiraOS.exe** — natywna aplikacja Windows zbudowana z przykładu |

## MiraOS dla Windows

`desktop/dist/MiraOS-1.0.0-windows-x64.zip` → rozpakuj → **`MiraOS.exe`**.

Aplikacja uruchamia MiraOS jako pełnoekranowe natywne okno (WebView2/Chromium),
a przy pierwszym starcie przejmuje wygląd Windowsa: ciemny motyw, paleta akcentów
zorzy (mięta → róż → fiolet), tapeta MiraOS i autostart. Wszystko odwracalne kartą **✦**.

- Pełny ekran: **F11** • Wyjście: **Ctrl+Alt+Q** • Szukaj: **`/`**
- Szczegóły, sumy kontrolne i instrukcja budowy: [`desktop/README-MiraOS.md`](desktop/README-MiraOS.md)

Powłoka `.exe` powstała z **kompilacji lokalnej źródeł Neutralino v6.9.0** (MIT)
kompilatorem Zig (`desktop/neutralino/build-miraos.sh`) — bez zewnętrznych binariów.
