@echo off
rem MiraOS — pokaz pasek zadan
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0taskbar-show.ps1" >nul 2>&1
exit /b 0
