@echo off
rem MiraOS — tapeta zorzy nad fiordem ciszy
set "WALLPATH=%~dp0..\wallpaper.png"
if not exist "%WALLPATH%" exit /b 1

rem wpis rejestru (zostaje po restarcie)
reg add "HKCU\Control Panel\Desktop" /v Wallpaper /t REG_SZ /d "%WALLPATH%" /f >nul 2>&1

rem natychmiastowe zastosowanie przez SystemParametersInfo (SPI_SETDESKWALLPAPER)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0set-wallpaper.ps1" -Path "%WALLPATH%" >nul 2>&1

exit /b 0
