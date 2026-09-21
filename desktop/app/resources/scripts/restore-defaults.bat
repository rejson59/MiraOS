@echo off
rem ============================================================
rem  MiraOS — przywrocenie domyslnego wygladu Windows
rem  (akcent: domyslny niebieski Windows; autostart: wylaczony)
rem  Tapety nie mozna wrocic automatycznie — zmienisz ja w:
rem  Ustawienia > Personalizacja > Tlo
rem ============================================================

rem --- szklo off ---
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0round-off.ps1" >nul 2>&1

rem --- autostart off ---
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v MiraOS /f >nul 2>&1

rem --- domyslna paleta niebieska Windows (0078D7) ---
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Accent" /v AccentPalette /t REG_BINARY /d 99ebff006fdbff004fccff0026bfff0006b7ff00009fec000076b70000527c00 /f >nul 2>&1
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Accent" /v AccentColorMask /t REG_DWORD /d 4292311040 /f >nul 2>&1
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Accent" /v StartColorMask /t REG_DWORD /d 4292311040 /f >nul 2>&1

exit /b 0
