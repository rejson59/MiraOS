@echo off
rem ============================================================
rem  MiraOS — motyw zorzy dla Windows
rem  (ciemny motyw + paleta akcentow MiraOS: mięta -> roz -> fiolet)
rem  Zmiany dotycza wylacznie biezacego uzytkownika (HKCU).
rem ============================================================

rem --- ciemny motyw (aplikacje i system) ---
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize" /v AppsUseLightTheme /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize" /v SystemUsesLightTheme /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize" /v EnableTransparency /t REG_DWORD /d 1 /f >nul 2>&1

rem --- paleta akcentow MiraOS (8 kolorow BGR, od jasnej mikty po gleboki fiolet) ---
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Accent" /v AccentPalette /t REG_BINARY /d e9f8df00d5f4b000c6f97d00d8d36300fa8ba700e26f8d00be4f6a0085354a00 /f >nul 2>&1
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Accent" /v AccentColorMask /t REG_DWORD /d 4291230077 /f >nul 2>&1
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Accent" /v StartColorMask /t REG_DWORD /d 4291230077 /f >nul 2>&1

exit /b 0
