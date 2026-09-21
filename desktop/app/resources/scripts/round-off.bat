@echo off
rem MiraOS — wylaczenie zaokraglania okien
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0round-off.ps1" >nul 2>&1
exit /b 0
