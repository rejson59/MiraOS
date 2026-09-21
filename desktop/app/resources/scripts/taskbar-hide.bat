@echo off
rem MiraOS — ukryj pasek zadan
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0taskbar-hide.ps1" >nul 2>&1
exit /b 0
