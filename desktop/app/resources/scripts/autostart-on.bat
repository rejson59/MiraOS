@echo off
rem MiraOS — autostart z Windows (HKCU, bez uprawnien administratora)
set "EXEPATH=%~dp0..\..\MiraOS.exe"
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v MiraOS /t REG_SZ /d "%EXEPATH%" /f >nul 2>&1
exit /b 0
