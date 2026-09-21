@echo off
rem ============================================================
rem  MiraOS — pomocnik startowy
rem  Sprawdza srodowisko WebView2 i uruchamia MiraOS.exe.
rem  Uzyj go, gdy podwojne klikniecie MiraOS.exe "nic nie robi".
rem ============================================================
setlocal
set "DIR=%~dp0"

echo ============================================
echo   MiraOS — sprawdzam srodowisko...
echo ============================================

rem --- 1) czy pliki aplikacji sa na miejscu ---
if not exist "%DIR%MiraOS.exe" (
  echo [blad] Nie ma MiraOS.exe obok tego pliku. Rozpakuj caly ZIP.
  pause
  exit /b 1
)
if not exist "%DIR%resources\index.html" (
  echo [blad] Brak folderu resources. Rozpakuj caly ZIP, nie tylko exe.
  pause
  exit /b 1
)

rem --- 2) czy jest WebView2 Runtime (Win11 ma zawsze; Win10 czasem nie) ---
set "WV2="
for %%K in ("HKLM\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}" "HKCU\Software\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}" "HKLM\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}") do (
  reg query %%K /v pv >nul 2>&1 && set "WV2=1"
)

if "%WV2%"=="" (
  echo [!] Nie znaleziono WebView2 Runtime — MiraOS go potrzebuje.
  echo    Otwieram strone pobierania Microsoftu...
  start "" "https://developer.microsoft.com/microsoft-edge/webview2/"
  echo    Zainstaluj "Evergreen Runtime" i uruchom ten plik ponownie.
  pause
  exit /b 2
)

echo [ok] WebView2 obecny. Startuje MiraOS...
start "" "%DIR%MiraOS.exe"
exit /b 0
